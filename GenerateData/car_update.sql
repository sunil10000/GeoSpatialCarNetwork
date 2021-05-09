do $$
declare
    car_row      car%rowtype;
    petrol_row   petrolpump%rowtype;
    traffic_row  trafficsignal%rowtype;

    dist_frac     FLOAT;
    fill_fuel     FLOAT;

   
    new_fuel      FLOAT;
    new_loc       GEOMETRY(POINT,4326);
   
    new_cur_stretch          INT;
    new_stretch_start_time   TIMESTAMP;
    new_stretch_initial_fuel FLOAT;
    new_stretch_next_node    GEOMETRY(POINT, 4326);

    new_air_quality  FLOAT;
    new_speed        FLOAT;
    new_running      BOOLEAN;
    run_start        BOOLEAN;
    run_stop         BOOLEAN;

    new_broke_rule           BOOLEAN;
    new_broke_reason         TEXT;

    is_journey  BOOLEAN;
    new_track   GEOMETRY(LINESTRING,4326);

    new_road_id   INT;
    new_road_speed FLOAT;

begin

    
    for car_row in select * from car where id=1
    loop
        -- =========== CONSUME FUEL and INTERACT WITH PETROL PUMP 
        new_fuel := car_row.fuel - car_row.speed*25/180000;
        if new_fuel < 0 then
            new_fuel := 0;
        end if;
        
        -- find  petrolpump in 5 meter distance
        select * from petrolpump 
        into petrol_row
        where st_distance(loc::geography, car_row.loc::geography) < 5 limit 1;

        --  if petrol pump has fuel then fill some  Leters of fuel
        -- NOTE we add fill_fuel to start fuel of road stretch so that
        -- it works appropriately for fuel consumed data
        select ('[0:9]={10,10,10,10, 20,20,20, 50,50, 100}'::integer[])[trunc(random()*10)] 
        into fill_fuel;
        if petrol_row is not null and petrol_row.fuel_amount >= 100 then
            new_fuel := new_fuel + fill_fuel;
            update petrolpump set fuel_amount = fuel_amount - fill_fuel where id = petrol_row.id;
        else
            fill_fuel = 0;
        end if;

        -- ======= UPDATE AIR QUALITY and update road stretch air quality also
        select ('[0:9]={2, -2, 0,0,0,0,0,0,0,0}'::float[])[trunc(random()*10)] into new_air_quality;
        new_air_quality := new_air_quality + car_row.air_quality;
        if new_air_quality < 0 then 
            new_air_quality := 0;
        end if;
        if new_air_quality > 100 then
            new_air_quality := 100;
        end if;

        update roadstretch set air_quality = new_air_quality where id = new_cur_stretch;

        -- ========= UPDATE speed
        select ('[0:9]={5,5,5,5,5,5,5,5, -5, 0}'::float[])[trunc(random()*10)] into new_speed;
        new_speed := new_speed + car_row.speed;
        if new_speed < 30 then 
            new_speed := 30;
        end if;
        if new_speed > 120 then
            new_speed := 120;
        end if;

        -- ========== UPDATE new running
        new_running := True;

        -- move the stopeed car again with 50% probability
        select ('[0:9]={True,True, False,False,False,False,False,False,False,False}'::boolean[]
                    )[trunc(random()*10)] into run_start;
        if not car_row.running and new_fuel <= 0 then
            if run_start then
                new_fuel := new_fuel + 10;
            end if;
        end if;

        select ('[0:9]={True, False,False,False,False,False,False,False,False,False}'::boolean[]
                    )[trunc(random()*10)] into run_stop;
        --=== NOTE: 120 <= speed <= 240
        if new_fuel <= 0 or run_stop then
            new_running := False;
            new_speed := 0;
        end if;

        --=== UPDATE JOURNEY

        if not car_row.running then
            if new_running then
                insert into journey(car_id, start_time, track, tags)
                values (car_row.id, now(), st_makeline(car_row.loc, car_row.stretch_next_node),
                        '"fuel_consumed"=>0.0, "avg_speed"=>0.0'::hstore);
            end if;
        else  -- intially running 
            if not new_running then
                update journey set end_time=now()
                where car_id = car_row.id and end_time is null;
            end if;
        end if;

         -- ========== CALCULATE NEW LOC and NEW STRETCH with start time, start fuel and next node
        select (car_row.speed*25/18)/st_distance(car_row.loc::geography,
                car_row.stretch_next_node::geography)
        into dist_frac;

        if dist_frac < 1 then  -- we are in same stretch
            select st_lineinterpolatepoint(
                st_makeline(car_row.loc, car_row.stretch_next_node), dist_frac)
            into new_loc;
            select car_row.cur_stretch into new_cur_stretch;
            select car_row.stretch_start_time into new_stretch_start_time;
            select car_row.stretch_initial_fuel+fill_fuel into new_stretch_initial_fuel;
            select car_row.stretch_next_node into new_stretch_next_node;
        else  -- we need to find next stretch
            select id, node_a, node_b, now() from (
                (select id, node_a, node_b from roadstretch where 
                        st_distance(node_a::geography, car_row.stretch_next_node::geography)<5)
                union
                (select id, node_b, node_a from roadstretch where 
                        st_distance(node_b::geography, car_row.stretch_next_node::geography)<5)
                
            ) as possible_next_stretch
            into new_cur_stretch, new_loc, new_stretch_next_node, new_stretch_start_time;
            select new_fuel into new_stretch_initial_fuel;

            --========= UPDATE old ROAD STRETCH and add new ROAD STRETCH to data and journey
            update roadstretchdata set end_time = now(),
                   fuel_consumed = car_row.stretch_initial_fuel + fill_fuel - new_fuel
            where stretch_id = car_row.cur_stretch and car_id = car_row.id 
            and start_time = car_row.stretch_start_time;

            insert into roadstretchdata(stretch_id, car_id, start_time)
            values (new_cur_stretch, car_row.id, new_stretch_start_time);


            -- ======= CAR Started but journey not inserted
            select false into is_journey;
            select true from journey into is_journey
                where car_id = car_row.id and end_time is null;
            
            if new_running then
                raise notice 'new_run: %', new_running;
                if is_journey then
                     update journey set 
                                    tags = tags || hstore('fuel_consumed', ((tags->'fuel_consumed')::float+
                                      car_row.stretch_initial_fuel + fill_fuel - new_fuel)::text) ||
                                      hstore('avg_speed', (
                                          (st_length(track::geography)*18)/(5*extract(epoch from now()-start_time))
                                          )::text),
                                    track = st_makeline(track, new_loc)
                            where car_id = car_row.id and end_time is null;
                else 
                    insert into journey(car_id, start_time, track, tags)
                    values (car_row.id, now(), st_makeline(car_row.loc, car_row.stretch_next_node),
                            '"fuel_consumed"=>0.0, "avg_speed"=>0.0'::hstore);
                   
                end if;
            end if;

        end if;

        -- ========== CAR RULE BREAK of speed limit and traffic signal
        new_broke_rule   := False;
        new_broke_reason := '';
        select road_id from roadstretch into new_road_id
            where id = new_cur_stretch;
        if new_road_id is not null then
            select maxspeed from road into new_road_speed
            where id = new_road_id;
            if new_road_speed is not null then
                if new_road_speed < new_speed then
                    new_broke_rule = True;
                    new_broke_reason =  'overshoot speed limit with speed='
                                        || new_speed::text || ' on road='
                                        || new_road_id::text;
                end if;
            end if;
        end if;

        select * from trafficsignal 
        into traffic_row
        where st_distance(loc::geography, car_row.loc::geography) < 5 limit 1;
        if traffic_row is not null and traffic_row.signal = 'R'  then
            new_broke_rule = True;
            new_broke_reason =  'broke traffic signal of id=' || traffic_row.id::text;
        end if;


        -- ========== UPDATE CAR DATA
        update car set running = new_running, loc = new_loc, speed = new_speed, fuel = new_fuel,
        air_quality = new_air_quality, cur_stretch = new_cur_stretch, 
        stretch_start_time   =  new_stretch_start_time,
        stretch_initial_fuel =  new_stretch_initial_fuel,
        stretch_next_node    =  new_stretch_next_node,
        broke_rule = new_broke_rule, broke_reason = new_broke_reason
        where id = car_row.id;


       
        -- raise notice '==== START ITEM car ID: %', car_row.id;
        -- raise notice 'dist_frac: %', dist_frac;
        -- raise notice 'old_loc: %', car_row.loc;
        -- raise notice 'new_loc: %', new_loc;

        -- raise notice 'old_stretch: %', car_row.cur_stretch;
        -- raise notice 'new_stretch: %', new_cur_stretch;

        -- raise notice 'old_aq: %', car_row.air_quality;
        -- raise notice 'new_aq: %', new_air_quality;

        -- raise notice 'old_sp: %', car_row.speed;
        -- raise notice 'new_sp: %', new_speed;

        -- raise notice 'old_fuel: %', car_row.fuel;
        -- raise notice 'new_fuel: %', new_fuel;

        -- raise notice 'old_run: %', car_row.running;
        -- raise notice 'new_run: %', new_running;

        -- raise notice '========END ITEM===========';
    


    end loop;

end; $$;

-- MARK UNREAD
-- update car set  past_breaks = past_breaks || broke_reason,
--                 broke_rule = false, broke_reason='' where id = 1;
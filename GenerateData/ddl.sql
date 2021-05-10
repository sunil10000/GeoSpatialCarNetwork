
--enable postgis
CREATE EXTENSION if not exists postgis;
--enable hstore
CREATE EXTENSION if not exists hstore;


-- TOTAL 14 TABLES
drop table if exists RoadStretchData;

drop table if exists Journey;
drop table if exists Car;
drop table if exists Users;

drop table if exists PetrolPump;
drop table if exists TrafficSignal;

drop table if exists RoadStretch;
drop table if exists Road;

--- FIRST
create table Road(
   id SERIAL PRIMARY KEY,
   maxspeed FLOAT,
   highway TEXT,
   way GEOMETRY(LINESTRING,4326),
   tags HSTORE
);

create table RoadStretch(
   id SERIAL PRIMARY KEY,
   road_id INT references Road(id),
   node_a GEOMETRY(POINT,4326),
   node_b GEOMETRY(POINT,4326),
   air_quality INT,
   unique(road_id, node_a, node_b)
);

-- SECOND
create table TrafficSignal(
   id SERIAL PRIMARY KEY, 
   loc GEOMETRY(POINT,4326), 
   signal TEXT,
   check (signal in ('R', 'Y', 'G'))
);

create table PetrolPump(
   id SERIAL PRIMARY KEY, 
   loc GEOMETRY(POINT,4326), 
   fuel_amount FLOAT
);



-- THIRD
create table Users(
   id SERIAL PRIMARY KEY, 
   uname TEXT,
   upassword TEXT, 
   urole TEXT,
   unique(uname),
   check (urole in ('driver', 'police', 'municipality'))
);

create table Car(
   id SERIAL PRIMARY KEY,
   car_name TEXT,
   car_owner INT references Users(ID),

   running BOOLEAN,
   loc GEOMETRY(POINT,4326),
   speed FLOAT,
   fuel FLOAT,
   air_quality FLOAT,
   cur_stretch INT references RoadStretch(id),
   stretch_start_time TIMESTAMP,
   stretch_initial_fuel FLOAT,
   stretch_next_node GEOMETRY(POINT, 4326),

   broke_rule BOOLEAN,
   broke_reason TEXT,
   past_breaks TEXT[]
);


create table Journey(
   id SERIAL PRIMARY KEY,
   car_id  INT references Car(id),
   start_time TIMESTAMP,
   end_time TIMESTAMP,
   track GEOMETRY(LINESTRING,4326),
   tags HSTORE  -- fuel_consumed and avg_speed will always be stored in tags
);


-- FOURTH
create table RoadStretchData(
   stretch_id INT references RoadStretch(id),
   car_id INT references Car(id),
   start_time  TIMESTAMP,
   end_time TIMESTAMP,
   fuel_consumed FLOAT,
   PRIMARY KEY(stretch_id, car_id, start_time)
);

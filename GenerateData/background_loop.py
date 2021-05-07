import os, psycopg2
import config
from time import sleep
import csv, random
import threading


petrol_requests = []

def connect():
    conn = psycopg2.connect(
        database=config.db,
        user=config.user,
        password=config.pswd,
        host=config.host,
        port=config.port)
    return conn

def car_loop(conn, cur):
    mileage = 25 #kmpl
    liter_in_1_m = 1/25000 # liter
    while(True):
        sleep(5) 
        cur.execute("select * from car")
        rows = cur.fetchall()
        for row in rows:
            car_id,_,_,running, loc, speed, fuel, aq, cur_stretch, _, _, next_node = row[0:12]


            
            #new_loc   = 
            try:


                # PETROL PUMP AND FUEL
                fuel = fuel - (speed*25/18*liter_in_1_m)
                cur.execute(f"select id, fuel_amount from petrolpump\
                    where st_distance(loc::geography, '{loc}'::geography) < 5 limit 1")
                    
                if cur.rowcount != 0 and random.choice([True, False]): # 50% chance of refilling gas from station
                    [p_id, p_fuel] = cur.fetchone()
                    fill_fuel = random.choices([ 10, 20, 50, 100], weights=[0.4, 0.3, 0.2, 0.1], k=1)[0]
                    fuel = fuel + fill_fuel
                    cur.execute("update petrolpump set fuel_amount = fuel_amount - %s \
                        where id = %s",(str(fill_fuel), str(p_id)))
                    conn.commit()
                


                cur.execute("select %s/st_distance(%s::geography, %s::geography)", 
                            (speed*25/18, loc, next_node))
                new_frac = cur.fetchone()[0]
                print(f"frac:{new_frac}")
                if new_frac < 1:
                    cur.execute("select st_lineinterpolatepoint(st_makeline(%s, %s), %s)",
                    (loc, next_node, new_frac))
                    new_loc = cur.fetchone()[0]
                    new_stretch = cur_stretch
                    new_next_node = next_node
                else:
                    print(next_node)
                    cur.execute(f"select st_astext('{next_node}')")
                    print(cur.fetchone()[0])

                    cur.execute("select id, node_a, node_b from\
                            ((select id, node_a, node_b from roadstretch\
                                where st_distance(node_a::geography , %s::geography) < 5)\
                                union\
                            (select id, node_b, node_a from roadstretch\
                                where st_distance(node_b::geography, %s::geography) < 5))\
                                    as foo order by random() limit 1;\
                    ", (str(next_node), str(next_node)))
                    row = cur.fetchone()
                    new_loc = row[1]
                    new_stretch = row[0]
                    new_next_node = row[2]
            except:
                print("###############EXCEPTION#################")
                continue

            # if running:
            #     new_running = random.choices([True, False], weights=[0.7, 0.3], k=1)[0]
            # else:
            #     new_running = random.choices([True, False], weights=[0.5, 0.5], k=1)[0]

            new_aq = max(0, min(100, aq+random.choices([2, -2, 0], weights=[0.1, 0.1, 0.8], k=1)[0]))
            new_speed = max(30, min(120, speed+random.choices([5, -5, 0], weights=[0.6, 0.3, 0.3], k=1)[0]))
            new_running = True

            if running == False and fuel == 0:
                if random.choice([True, False], [0.05, 0.95]):
                    print("Added 10 litres of petrol!")
                    fuel = fuel + 10

            if random.choices([True, False], [0.05, 0.95])[0] or fuel == 0:
                new_running = False
                new_speed = 0

            
            print(f"old:{loc}, new:{new_loc}")
            cur.execute("update car set (running, loc, speed, fuel, air_quality, cur_stretch, stretch_next_node)=\
                (%s, %s, %s, %s, %s, %s, %s) where id = %s",
                (str(new_running), str(new_loc), str(new_speed), str(fuel), str(new_aq), str(new_stretch), str(new_next_node), str(car_id))
                )
            conn.commit()
            print("finished")
        print("=========================================================")

def trafficsignal_loop(conn, cur):
    while(True):
        sleep(60)
        cur.execute("update trafficsignal set signal = case\
            when signal = 'R' then 'Y'\
            when signal = 'Y' then 'G'\
            when signal = 'G' then 'R'\
            end")
        conn.commit()

def petrolpump_loop(conn, cur):
    while(True):
        cur.execute("update petrolpump set fuel_amount = fuel_amount + 400 where fuel_amount < 200;")
        sleep(5*60)

def background_loop(conn, cur):
    c_th  = threading.Thread(name='car', target=car_loop, args=(conn, cur))
    ts_th = threading.Thread(name='ts', target=trafficsignal_loop, args=(conn, cur))
    pp_th = threading.Thread(name='pp', target=petrolpump_loop, args=(conn, cur))

    c_th.start()
    ts_th.start()
    pp_th.start()
    pass

if __name__ == '__main__':
    conn = connect()
    cur  = conn.cursor()

    background_loop(conn, cur)
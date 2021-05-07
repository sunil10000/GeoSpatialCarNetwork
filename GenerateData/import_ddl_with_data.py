import os, psycopg2
import config
from time import sleep
import csv, random
import threading

def connect():
    conn = psycopg2.connect(
        database=config.db,
        user=config.user,
        password=config.pswd,
        host=config.host,
        port=config.port)
    return conn


def create_tables(conn, cur):
    ddl = open('ddl.sql', 'r').read()
    cur.execute(ddl)
    conn.commit()
    return


def import_road(conn, cur):
    os.system(f'sudo -u postgres \
        osm2pgsql -d {config.db} -U {config.user} --hstore {config.osm_path}')

    cur.execute("insert into road(maxspeed, highway, way, tags) \
                select cast(tags->'maxspeed' as integer), highway,\
                st_transform(st_setsrid(way,3857), 4326), tags from planet_osm_line\
                where highway is not null;")
    conn.commit()
    return

def import_roadstretch(conn, cur):
    cur.execute("WITH segments AS ( SELECT id, (pt).geom AS geom2,\
                            lag((pt).geom, 1, NULL) OVER (PARTITION BY id ORDER BY id, (pt).path) as geom1\
                            FROM (SELECT id, ST_DumpPoints(way) AS pt FROM road) as dumps)\
                INSERT INTO roadstretch(road_id, node_a, node_b)\
                    SELECT id, geom1, geom2 FROM segments WHERE geom1 IS NOT NULL AND geom2 is NOT NULL")
    conn.commit()
    return

def add_petrol_pumps(conn, cur):
    # Install Petrol Pumps on 20% node_points
    cur.execute("INSERT INTO petrolpump(loc, fuel_amount) (SELECT node_a,1000 FROM\
         ((SELECT node_a from RoadStretch) union (SELECT node_b from Roadstretch)) as foo\
             ORDER BY RANDOM() LIMIT 1000 );")
    conn.commit()
    return

def add_traffic_signals(conn, cur):
    cur.execute("with nodes(node_a, node_b) as\
        (select node_a, node_b from roadstretch rs join road r on rs.road_id = r.id where r.highway in ('primary','secondary','tertiary'))\
       insert into trafficsignal(loc, signal) (select node_a, ('[0:2]={R,G,Y}'::text[])[trunc(random()*3)] from ((select node_a, count(*) as cnt\
        from nodes group by node_a) union (select node_b, count(*) from nodes group by node_b)) as foo\
        group by node_a having sum(cnt) = 4);")
    conn.commit()
    return

def add_users(conn, cur):
    with open('all_users.csv') as f:
        f1 = csv.reader(f, delimiter=',')
        header = next(f1)
        for row in f1:
            cur.execute("INSERT INTO users(uname, upassword, urole) VALUES (%s, %s, %s)",
            tuple([s.strip() for s in row[1:]]))
        conn.commit()
    return

def add_cars(conn, cur):
    total_cars = 20
    car_names = ['maruti', 'bmw', 'toyota', 'honda', 'ford', 'GM', 'suzuki']

    cur.execute("SELECT id from Users where urole='driver';")
    car_owners = [row[0] for row in cur.fetchall()]


    cur.execute(f"SELECT id, node_a, node_b FROM RoadStretch\
             ORDER BY RANDOM() LIMIT '{total_cars}';")
    nodes = cur.fetchall()
    
    for i in range(total_cars):
        car_name  = str(random.choice(car_names))
        car_owner = str(random.choice(car_owners))

        running     = random.choice([True, False])
        loc         = str(nodes[i][1])
        speed       = str(0)
        if running:
            speed = random.choice([40, 60 , 80])
        fuel        = str(100)
        air_quality = str(50)
        cur_stretch = str(nodes[i][0])
        stretch_next_node = str(nodes[i][2])

        broke_rule   = str(False)
        broke_reason = str({})
        past_breaks  = str({})

        cur.execute("INSERT INTO car(car_name, car_owner, running, loc, speed, fuel, air_quality, cur_stretch,stretch_start_time, stretch_initial_fuel, stretch_next_node, broke_rule, broke_reason, past_breaks)\
            VALUES(%s, %s, %s, %s, %s, %s, %s, %s, now(), %s, %s, %s, %s, %s);",
        (car_name, car_owner, running, loc, speed, fuel, air_quality, cur_stretch, fuel, stretch_next_node, broke_rule, broke_reason, past_breaks))
    
    conn.commit()
        
    return

def generate_data(conn, cur):
    import_road(conn, cur)
    import_roadstretch(conn, cur)

    add_petrol_pumps(conn, cur)
    add_traffic_signals(conn, cur)

    add_users(conn,cur)
    add_cars(conn,cur)
    return

if __name__ == '__main__':
    conn = connect()
    cur  = conn.cursor()

    create_tables(conn, cur)
    generate_data(conn, cur)

    cur.close()
    conn.close()












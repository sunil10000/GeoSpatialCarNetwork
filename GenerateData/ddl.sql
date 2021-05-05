
--enable postgis
CREATE EXTENSION if not exists postgis;
--enable hstore
CREATE EXTENSION if not exists hstore;

/* WILL BE ADDED ONLY IF NEEDED
-- enable raster support (for 3+)
CREATE EXTENSION if not exists postgis_raster;
-- Enable Topology
CREATE EXTENSION if not exists postgis_topology;
-- Enable PostGIS Advanced 3D
-- and other geoprocessing algorithms
-- sfcgal not available with all distributions
CREATE EXTENSION if not exists postgis_sfcgal;
-- fuzzy matching needed for Tiger
CREATE EXTENSION if not exists fuzzystrmatch;
-- rule based standardizer
CREATE EXTENSION if not exists address_standardizer;
-- example rule data set
CREATE EXTENSION if not exists address_standardizer_data_us;
-- Enable US Tiger Geocoder
CREATE EXTENSION if not exists postgis_tiger_geocoder;
*/

-- TOTAL 14 TABLES
drop table if exists RoadStretchData;

drop table if exists Journey;
drop table if exists Car;
drop table if exists Users;

drop table if exists AirQuality;
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

create table AirQuality(
   loc GEOMETRY(POINT,4326) PRIMARY KEY,
   quality INT
);


-- THIRD
create table Users(
   id SERIAL PRIMARY KEY, 
   uname TEXT, 
   upassword TEXT, 
   urole TEXT,
   check (urole in ('admin', 'driver', 'police', 'municipality'))
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
   past_breaks JSON
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

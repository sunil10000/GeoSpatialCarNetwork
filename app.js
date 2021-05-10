
const express = require('express');
const path = require('path');
const bodyParser = require('body-parser');
const pool = require('./utils/database');


const mncRo = require('./routes/mnc');

const mycarsRo = require('./routes/mycars');
const pjRo = require('./routes/pj');
const userTrafficRo = require('./routes/userTraffic');

const policeTrafficRo = require('./routes/policeTraffic');
const allcarsRo = require('./routes/allcars');




const app = express();
app.set('view engine', 'ejs');
app.set('views', 'views');
app.use(bodyParser.urlencoded({ extended:true}));
app.use(express.static(path.join(__dirname,'public')));
app.use(express.json({
    type: ['application/json', 'text/plain']
  }))

app.use('/mnc', mncRo);

app.use('/user/mycars',mycarsRo);
app.use('/user/pastjourneys', pjRo);
app.use('/user/traffic', userTrafficRo);

app.use('/police/allcars', allcarsRo);
app.use('/police/traffic', policeTrafficRo);

app.post('/api/car', (req, res, next) => {
        // console.log("inside post req.body:", req.body);

        pool.query('SELECT id, car_name, running, speed, fuel, st_x(loc) as locx, st_y(loc) as locy\
            FROM car where car_owner=$1 order by id', [req.body.owner], function(err, row){
                if (err){
                    throw err;
                }
                else{
                    res.set("Content-Type", 'application/json');
                    res.json(row)
                }
        });


})
app.post('/api/all_cars', (req, res, next) => {
    // console.log("inside post req.body:", req.body);

    pool.query('SELECT C.id as id, car_name, speed, st_x(loc) as locx,\
    st_y(loc) as locy, U.uname as owner, broke_rule, broke_reason, past_breaks\
    FROM car C, users U where C.car_owner = U.id;', function(err, row){
            if (err){
                console.log(error);
                throw err;
            }
            else{
                res.set("Content-Type", 'application/json');
                res.json(row)
            }
    });


})

app.post('/api/unmark_car', (req, res, next) => {
    console.log("hi")
    console.log("inside unmark req.body:", req.body);

    pool.query("update car set past_breaks = past_breaks || broke_reason,\
            broke_rule = false, broke_reason='' where id = $1 and broke_rule;",
            [req.body.car_id],
            function(err, row){
            if (err){
                console.log(error);
                throw err;
            }
            else{
                console.log(row)
                res.set("Content-Type", 'application/json');
                res.json("{updated: true}")
            }
    });


})



app.post('/api/pj', (req, res, next) => {

    pool.query("SELECT id, car_id, \
                to_char(start_time, 'YYYY-MM-DD  HH24:MI') as start_time,\
                to_char(end_time, 'YYYY-MM-DD  HH24:MI') as end_time,\
                tags, st_asgeojson(st_flipcoordinates(track)) as track,\
                st_astext(st_startpoint(st_flipcoordinates(track))) as start_point FROM journey where car_id in\
            (select car_id from car where car_owner=$1) order by id", [req.body.owner], function(err, row){
            if (err){
                throw err;
            }
            else{
                res.set("Content-Type", 'application/json');
                res.json(row)
            }
    });
})

app.post('/api/tsig', (req, res, next) => {

    pool.query("SELECT id, st_astext(st_flipcoordinates(loc)) as loc,\
                signal from trafficsignal", function(err, row){
            if (err){
                throw err;
            }
            else{
                res.set("Content-Type", 'application/json');
                res.json(row)
            }
    });


})

app.post('/api/ppump', (req, res, next) => {

    pool.query("SELECT id, st_astext(st_flipcoordinates(loc)) as loc,\
                fuel_amount from petrolpump", function(err, row){
            if (err){
                throw err;
            }
            else{
                res.set("Content-Type", 'application/json');
                res.json(row)
            }
    });


})


app.post('/api/road_data', (req, res, next) => {
    pool.query("select R.id as id,\
    st_asgeojson(st_flipcoordinates(st_makeline(node_a, node_b))) as track,\
    avg((st_length(\
     st_makeline(node_a, node_b)::geography)*18)/(5* extract(epoch from (end_time - start_time))\
    )) as avg_speed, avg(fuel_consumed) as avg_fuel_consumed, count(car_id) as no_of_cars\
    from roadstretch R, roadstretchdata RD where R.id = RD.stretch_id\
    and RD.end_time is not null group by R.id", function(err, row){
        if (err){
            throw err;
        }
        else{
            res.set("Content-Type", 'application/json');
            res.json(row)
        }
        });

})

app.post('/api/hour_road_data', (req, res, next) => {
    pool.query("select R.id as id,\
    st_asgeojson(st_flipcoordinates(st_makeline(node_a, node_b))) as track,\
    to_char(date_trunc('minute', start_time), 'YYYY-MM-DD  HH24:MI') as start_hour,\
    avg((st_length(\
     st_makeline(node_a, node_b)::geography)*18)/(5* extract(epoch from (end_time - start_time))\
    )) as avg_speed, avg(fuel_consumed) as avg_fuel_consumed, count(car_id) as no_of_cars\
    from roadstretch R, roadstretchdata RD where R.id = RD.stretch_id\
    and RD.end_time is not null group by R.id, date_trunc('minute', start_time)", function(err, row){
        if (err){
            throw err;
        }
        else{
            res.set("Content-Type", 'application/json');
            res.json(row)
        }
        });
})


app.post('/api/cur_road_data', (req, res, next) => {
    pool.query("select R.id as id,\
    st_asgeojson(st_flipcoordinates(st_makeline(node_a, node_b))) as track,\
    avg(C.speed) as avg_speed, count(C.id) as no_of_cars\
    from roadstretch R, roadstretchdata RD, car C where R.id = RD.stretch_id and RD.car_id = C.id\
    and RD.end_time is null group by R.id", function(err, row){
        if (err){
            throw err;
        }
        else{
            res.set("Content-Type", 'application/json');
            res.json(row)
        }
        });

})

app.listen(3000);
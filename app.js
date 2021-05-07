
const express = require('express');
const path = require('path');
const bodyParser = require('body-parser');

const adminRo = require('./routes/admin');
const userRo = require('./routes/user');
const policeRo = require('./routes/police');
const mncRo = require('./routes/mnc');
const mycarsRo = require('./routes/mycars');
const pjRo = require('./routes/pj');
const trafficRo = require('./routes/traffic');
const rbRo = require('./routes/rb');
const allcarsRo = require('./routes/allcars');
const pool = require('./utils/database');



const app = express();
app.set('view engine', 'ejs');
app.set('views', 'views');
app.use(bodyParser.urlencoded({ extended:true}));
app.use(express.static(path.join(__dirname,'public')));
app.use(express.json({
    type: ['application/json', 'text/plain']
  }))

app.use('/admin',adminRo);
app.use('/user', userRo);
app.use('/police', policeRo);
app.use('/mnc', mncRo);
app.use('/user/mycars',mycarsRo);
app.use('/user/pastjourneys', pjRo);
app.use('/user/traffic', trafficRo);
app.use('/police/rulebreakers', rbRo);
app.use('/police/allcars', allcarsRo);

app.post('/api', (req, res, next) => {
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
app.listen(3000);
const pool = require('../utils/database');

exports.get_test = (req,res,next) => {

    pool.query('SELECT id, car_name, running, speed, fuel, st_x(loc) as locx, st_y(loc) as locy\
            FROM car where car_owner=2', function select(error, results, fields) {
        if (error) {
          console.log(error);
          pool.end();
        }
        res.render('user/mycars', {
            pageTitle: 'My Cars',
            path: '/user/mycars',
            editing: false,
            data:results
        });
      });

};

exports.post_test = (req,res,next) => {
    const username = req.body.username;
    const password = req.body.password;
    
    // var thatrow = [];
    // pool.query("select password, role from users where username = $1", [username], function(err, row){
    //     if (err){
    //         throw err;
    //     }
    //     else{
    //         setValue(row);
    //     }
    // });

    // function setValue(value){
    //     thatrow=value;
    //     var pwd=thatrow['rows'][0]['password'];
    //     if (pwd == password){
    //         res.redirect(thatrow['rows'][0]['role'])
    //     }
    // }
};




// exports.get_test = (req,res,next) => {
    
//     console.log("My hello");

//     res.render('admin', {
//         pageTitle: 'Test',
//         path: '/admin',
//         editing: false
//     });


// };
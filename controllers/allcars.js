const pool = require('../utils/database');

exports.get_test = (req,res,next) => {


    res.render('police/allcars', {
        pageTitle: 'All Cars',
        path: '/police/allcars',
        // username: req.query.username,
        editing: false
    });


};

exports.post_test = (req,res,next) => {
    const username = req.body.username;
    const password = req.body.password;
    
    var thatrow = [];
    pool.query("select password, role from users where username = $1", [username], function(err, row){
        if (err){
            throw err;
        }
        else{
            setValue(row);
        }
    });

    function setValue(value){
        thatrow=value;
        var pwd=thatrow['rows'][0]['password'];
        if (pwd == password){
            res.redirect(thatrow['rows'][0]['role'])
        }
    }
};




// exports.get_test = (req,res,next) => {
    
//     console.log("My hello");

//     res.render('admin', {
//         pageTitle: 'Test',
//         path: '/admin',
//         editing: false
//     });


// };
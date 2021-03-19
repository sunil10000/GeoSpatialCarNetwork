// const pool = require('../utils/database');


exports.get_test = (req,res,next) => {
    
    console.log("My hello");

    res.render('admin', {
        pageTitle: 'Test',
        path: '/admin',
        editing: false
    });


};
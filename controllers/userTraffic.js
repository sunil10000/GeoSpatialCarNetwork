const pool = require('../utils/database');

exports.get_test = (req,res,next) => {


    res.render('user/traffic', {
        pageTitle: 'Traffic',
        path: '/user/traffic',
        editing: false
    });


};
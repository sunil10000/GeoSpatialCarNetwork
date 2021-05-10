const pool = require('../utils/database');

exports.get_test = (req,res,next) => {


    res.render('mnc/mnc', {
        pageTitle: 'Municipal Corp',
        path: '/mnc/mnc',
        // username: req.query.username,
        editing: false,
        uname: req.session.username,
        upassword: req.session.password,
        uid: req.session.uid
    });


};
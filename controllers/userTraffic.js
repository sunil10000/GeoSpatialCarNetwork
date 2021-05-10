const pool = require('../utils/database');

exports.get_test = (req,res,next) => {


    res.render('user/traffic', {
        pageTitle: 'Traffic',
        path: '/user/traffic',
        editing: false,
        uname: req.session.username,
        upassword: req.session.password,
        uid: req.session.uid
    });


};
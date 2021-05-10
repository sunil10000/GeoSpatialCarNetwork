const pool = require('../utils/database');

exports.get_test = (req,res,next) => {


    res.render('police/traffic', {
        pageTitle: 'Traffic',
        path: '/police/traffic',
        // username: req.query.username,
        editing: false,
        uname: req.session.username,
        upassword: req.session.password,
        uid: req.session.uid
    });


};
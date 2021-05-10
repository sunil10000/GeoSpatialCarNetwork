const pool = require('../utils/database');

exports.get_test = (req,res,next) => {


    res.render('user/pj', {
        pageTitle: 'Past Journeys',
        path: '/user/pastjourneys',
        // username: req.query.username,
        editing: false,
        uname: req.session.username,
        upassword: req.session.password,
        uid: req.session.uid
    });


};
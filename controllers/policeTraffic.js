const pool = require('../utils/database');

exports.get_test = (req,res,next) => {


    res.render('police/traffic', {
        pageTitle: 'Traffic',
        path: '/police/traffic',
        // username: req.query.username,
        editing: false
    });


};
const pool = require('../utils/database');

exports.get_test = (req,res,next) => {


    res.render('police/allcars', {
        pageTitle: 'All Cars',
        path: '/police/allcars',
        // username: req.query.username,
        editing: false
    });


};
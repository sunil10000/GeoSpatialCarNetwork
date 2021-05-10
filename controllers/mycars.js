const pool = require('../utils/database');

exports.get_test = (req,res,next) => {

   res.render('user/mycars', {
        pageTitle: 'My Cars',
        path: '/user/mycars',
        editing: false,
    });

};
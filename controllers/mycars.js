const pool = require('../utils/database');

exports.get_test = (req,res,next) => {
//  console.log(req.session);
   res.render('user/mycars', {
        pageTitle: 'My Cars',
        path: '/user/mycars',
        editing: false,
        uname: req.session.username,
        upassword: req.session.password,
        uid: req.session.uid
    });

};
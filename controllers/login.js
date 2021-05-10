const session = require('express-session');
const pool = require('../utils/database');

exports.get_test = (req,res,next) => {


    res.render('login', {
        pageTitle: 'Login',
        path: '/',
        editing: false
    });


};

exports.post_test = (req,res,next) => {
    const username = req.body.username;
    const password = req.body.password;
    const url = require('url');
    console.log(username);

    pool.query('SELECT id, urole from users where uname = $1 AND upassword = $2', [username, password], function(err, data, fields) {
        if(err){
            throw err
        }
        else{
            var rows = data.rows
            if (rows.length <= 0) {
                res.redirect('/')
            }
            else {

                var row = rows[0];
                const sess = req.session;
                sess.username = username;
                sess.password = password;
                sess.uid = row['id']
                if(row['urole']=='driver'){
                    res.redirect('/user/mycars');
                }
                else if(row['urole']=='police'){
                    res.redirect('/police/allcars');
                }
                else{
                    res.redirect('/mnc');
                }
            }  
        }      
    });
};
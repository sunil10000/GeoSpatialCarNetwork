const { Pool } = require('pg');

const pool = new Pool({
    user: 'postgres',     //your postgres username
    host: 'localhost', 
    database: 'mumbai', //your local database 
    password: 'harshad', //your postgres user password
    port: 5432, //your postgres running port
});

pool.connect();


module.exports = pool;
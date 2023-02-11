const mysql = require('mysql2');
const dotenv = require('dotenv').config();

const dbConfig = {
    host: 'sqlclassdb-instance-1.cqjxl5z5vyvr.us-east-2.rds.amazonaws.com',
    port: 3306,
    user: 'pracha23',
    password: '2SxhMFnYU869',
    database: 'webapp_p8_2223t2_pracha23'
}

console.log(dbConfig.host)

const connection = mysql.createConnection(dbConfig);

module.exports = connection;
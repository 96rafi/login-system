var mysql = require('mysql');
const dotenv = require('dotenv')
dotenv.config({ path: './config/config.env' })


var connection = mysql.createConnection({
    host: process.env.HOST,
    user: process.env.USER,
    password: process.env.PASSWORD,
    database: process.env.DATABASE
});

connection.connect()

module.exports = { connection }
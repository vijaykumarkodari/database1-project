let mysql = require('mysql');
const keys = require('./keys');

let connection = mysql.createConnection({
    host: keys.mysql.host,
    user: keys.mysql.user,
    password: keys.mysql.password,
    database: keys.mysql.database
});

connection.connect(function(err) {
    if (err) {
        return console.error('error: ' + err.message);
    }

    console.log('Connected to the MySQL server.');
});
/*
connection.end(function(err) {
    if (err) {
        return console.log('error:' + err.message);
    }
    console.log('Close the database connection.');
});
 */
module.exports = connection;
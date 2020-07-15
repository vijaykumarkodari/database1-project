//C:/Users/vijay/OneDrive/Desktop/DB-project/upload_files/players.csv

const express = require("express");
const app = express();
const router = express.Router();
const fileUpload = require('express-fileupload');
const path = __dirname + '/views/';
const db = require('./dbconnect');
// default options
app.use(fileUpload());


app.post('/upload', function(req, res) {
    if (!req.files || Object.keys(req.files).length === 0) {
        return res.status(400).send('No files were uploaded.');
    }

    // The name of the input field (i.e. "sampleFile") is used to retrieve the uploaded file
    let sampleFile = req.files.sampleFile;
    //var array = new Function(`return [${Array.prototype.slice.call(sampleFile.data, 0)}]`);
    var array = sampleFile.data.toString().split('\n');
    console.log(array.length);
    console.log(db);
    db.connect(function(err) {
        if (err) {
            return console.error('error: ' + err.message);
        }

        console.log('Connected to the MySQL server.');
        /* array.forEach(element => {
            sql = "insert into players values  ( " + element + ")";
            console.log(sql);
            db.query(sql, function(err, result) {
                if (err) throw err;
                console.log("Result: " + result);
            });
        }); */
        /* sql = "insert into players values";
        array.forEach(element => {
            sql = sql + "(" + element + "),";

        });
        sql = sql.slice(0, -1);
        console.log(sql);
        db.query(sql, function(err, result) {
            if (err) throw err;
            console.log("Result: " + result);
        }); */
        //console.log(sql);

        /*  var sql = "LOAD DATA LOCAL INFILE " + "\"" +
             "C:/Users/vijay/OneDrive/Desktop/DB-project/temp/" + sampleFile.name +
             "\"" + " INTO TABLE players FIELDS TERMINATED BY ','" + " LINES TERMINATED BY \'" +
             "\\r\\n" + "\' IGNORE 0 LINES (PlayerID ,FirstName,LastName ,TeamID,Position,Touchdowns,TotalYards,Salary);";
         console.log(sql);
         db.query(sql, function(err, result, fields) {
             if (err) throw err;
             Object.keys(result).forEach(function(key) {
                 console.log(key, result[key]);
             });
         }); */


    });

    // Use the mv() method to place the file somewhere on your server
    /*  sampleFile.mv('./temp/' + sampleFile.name, function(err) {
         if (err)
             return res.status(500).send(err);

         res.send('File uploaded!');
     }); */

    db.end((err) => {
        // The connection is terminated gracefully
        // Ensures all remaining queries are executed
        // Then sends a quit packet to the MySQL server.
    });
});

router.use(function(req, res, next) {
    console.log("/" + req.method);
    next();
});

router.get("/", function(req, res) {
    res.sendFile(path + "upload.html");
});

router.get("/about", function(req, res) {
    res.sendFile(path + "about.html");
});

router.get("/contact", function(req, res) {
    res.sendFile(path + "contact.html");
});

app.use("/", router);

app.use("*", function(req, res) {
    res.sendFile(path + "404.html");
});

app.listen(3000, function() {
    console.log("Live at Port 3000");
});
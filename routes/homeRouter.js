const router = require('express').Router();
const path = require('path');
const app = require('express')();
const fileUpload = require('express-fileupload');
const db = require('./../config/dbconnect');
const { stringify } = require('querystring');
router.get("/inserts", function(req, res) {
    res.sendFile(path.resolve(__dirname + "/../public/views/", "upload.html"));
});

router.get("/view", function(req, res) {
    res.sendFile(path.resolve(__dirname + "/../public/views/", "view.html"));
});

router.get("/clear", function(req, res) {
    res.sendFile(path.resolve(__dirname + "/../public/views/", "clear.html"));
});

router.get("/max", function(req, res) {
    res.sendFile(path.resolve(__dirname + "/../public/views/", "max.html"));
});


// default options
router.use(fileUpload());

router.post('/upload', function(req, res) {
    if (!req.files || Object.keys(req.files).length === 0) {
        return res.status(400).send('No files were uploaded.');
    }
    var time = null;
    var message = null;
    // The name of the input field (i.e. "sampleFile") is used to retrieve the uploaded file
    let sampleFile = req.files.sampleFile;
    //var array = new Function(`return [${Array.prototype.slice.call(sampleFile.data, 0)}]`);
    var array = sampleFile.data.toString().split('\n');
    var table = sampleFile.name.toString().split('.');
    array.pop();
    // console.log(array.length);
    var sql = "insert into " + table[0] + "(PlayerID, FirstName, LastName, TeamID, Position, Touchdowns, TotalYards, Salary) values ?";
    if (req.body.insertionType === "bulk") {
        //  ndnnd
        const start = Date.now();

        var records = [];
        var i = -1;
        console.log("Bulk insertion :");

        array.forEach(element => {
            //console.log(element);
            var str = element.toString().split(",");

            records[++i] = str;
        });
        // sql = sql.slice(0, -1);
        //  console.log(records[1]);

        db.query(sql, [records], function(err, result) {
            //  console.log(sql);
            if (err) {
                var mesg = "error occured : " + err;
                console.log(mesg);
                res.send(mesg);
            }
            console.log("Result: " + result);
            // alert("Bulk Data Inserted Successfully");
        });
        time = Date.now() - start;
        message = " ==Bulk Insertion time in milli sec: " + time;
        console.log("Uploaded time : " + time + " ms");

    } else {
        const start = Date.now();
        sql = "insert into " + table[0] + "(PlayerID, FirstName, LastName, TeamID, Position, Touchdowns, TotalYards, Salary) values (?)";
        // var ss = 0;
        console.log(" Single insertion :" + array.length);
        array.forEach(element => {


            var str = element.toString().split(",");
            const util = require('util'); // node native promisify
            const query = util.promisify(db.query).bind(db);
            //   console.log(++ss + " " + str.length);

            (async() => {
                try {
                    const rows = await query(sql, [str]);
                    // console.log(rows);
                } catch (err) {
                    var mesg = "error occured : " + err;
                    console.log(mesg);
                    res.send(mesg);
                }
            })()


        });
        // alert("Serial single insertion Data Inserted Successfully");
        time = Date.now() - start;
        message = " ==Single Insertion time in milli sec: " + time;
        console.log("Uploaded time : " + time + " ms");

    }
    res.send("upload success" + message);
    // res.redirect("http://localhost:3000/home/inserts");
});


router.post('/loadfile', function(req, res) {
    // console.log(req);
    const start = Date.now();
    const a = req.body.filepath.toString().split("/");
    const b = a[a.length - 1].toString().split(".");
    const val = b[0];
    console.log(val);
    console.log("Load file insertion :");
    var sql = null;
    if (val === "players") {
        sql = "LOAD DATA LOCAL INFILE " + "\"" + req.body.filepath +
            "\"" + " INTO TABLE players FIELDS TERMINATED BY ','" + " LINES TERMINATED BY \'" +
            "\\r\\n" + "\' IGNORE 0 LINES (PlayerID ,FirstName,LastName ,TeamID,Position,Touchdowns,TotalYards,Salary);";

    } else if (val === "teams") {
        sql = "LOAD DATA LOCAL INFILE " + "\"" + req.body.filepath +
            "\"" + " INTO TABLE teams FIELDS TERMINATED BY ','" + " LINES TERMINATED BY \'" +
            "\\r\\n" + "\' IGNORE 0 LINES (TeamID, TeamName, City);";

    } else if (val === "games") {
        sql = "LOAD DATA LOCAL INFILE " + "\"" + req.body.filepath +
            "\"" + " INTO TABLE games FIELDS TERMINATED BY ','" + " LINES TERMINATED BY \'" +
            "\\r\\n" + "\' IGNORE 0 LINES (GameID, Date, Stadium, Result, Attendance, TicketRevenue);";
    } else if (val === "play") {
        sql = "LOAD DATA LOCAL INFILE " + "\"" + req.body.filepath +
            "\"" + " INTO TABLE play FIELDS TERMINATED BY ','" + " LINES TERMINATED BY \'" +
            "\\r\\n" + "\' IGNORE 0 LINES (PlayerID, GameID);";

    } else {
        res.send("Invalid entry: make sure file name matches with table name");
    }
    // console.log(sql);
    db.query(sql, function(err, result, fields) {
        if (err) {
            var mesg = "error occured : " + err;
            console.log(mesg);
            res.send(mesg);
        }
        /*  Object.keys(result).forEach(function(key) {
             console.log(key, result[key]);
         }); */
        // console.log("Result: " + result);

    });
    var time = Date.now() - start;
    console.log("Uploaded time : " + time + " ms");
    res.send("Data Uploaded===== file load time in milli seconds " + time);
});

router.post('/getdata', function(req, res) {
    console.log(req.body);
    const start = Date.now();
    var sql = "select * from " + req.body.tablename + " limit 1000";
    // console.log(sql);
    db.query(sql, function(err, result) {
        if (err) {
            var mesg = "error occured : " + err;
            console.log(mesg);
            res.send(mesg);
        }
        /*  Object.keys(result).forEach(function(key) {
             console.log(key, result[key]);
         }); */
        // console.log("Result: " + result);
        var time = Date.now() - start;
        console.log("fetch Time : " + time + " ms");
        var data = {
            "result": JSON.stringify(result),
            "message": "Data fetched successfully in time milli sec " + time
        };
        res.send(data);

    });

});

router.post('/cleardata', function(req, res) {
    // console.log(req);
    const start = Date.now();
    var sql = "truncate " + req.body.tablename;

    // console.log(sql);
    db.query(sql, function(err, result, fields) {
        if (err) {
            var mesg = "error occured : " + err;
            console.log(mesg);
            res.send(mesg);
        }
        /*  Object.keys(result).forEach(function(key) {
             console.log(key, result[key]);
         }); */
        // console.log("Result: " + JSON.stringify(result));
        var time = Date.now() - start;

        res.send("Data cleared successfully in time milli sec " + time);

    });

});


router.post('/getmax', function(req, res) {
    // console.log(req);
    const start = Date.now();
    var sql = "select max(" + req.body.columnname + ") as maxSalary  from " + req.body.tablename;
    // console.log(sql);
    db.query(sql, function(err, result, fields) {
        if (err) {
            var mesg = "error occured : " + err;
            console.log(mesg);
            res.send(mesg);
        }

        /*  Object.keys(result).forEach(function(key) {
             console.log(key, result[key]);
         }); */
        console.log("Result: " + JSON.stringify(result));
        var time = Date.now() - start;
        var data = {
            "result": JSON.stringify(result),
            "message": "Data fetched successfully in time milli sec " + time
        };
        console.log("Fetch max value time : " + time + " ms");
        res.send(data);

    });

});
module.exports = router;
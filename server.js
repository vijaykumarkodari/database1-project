const express = require("express");
const app = express();
const router = express.Router();

const home = require('./routes/homeRouter');


app.use(express.static(__dirname + '/public'));

router.use(function(req, res, next) {
    // console.log("/" + req.method);
    next();
});

router.get("/", function(req, res) {
    res.sendFile(__dirname + "/public/views/index.html");
});

router.use("/db", home);

app.use("/", router);

app.use("*", function(req, res) {
    res.sendFile(__dirname + "/404.html");
});

app.listen(3000, function() {
    console.log("Live at Port 3000");
});
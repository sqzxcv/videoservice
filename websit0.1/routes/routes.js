var index = require('./index');
var users = require('./users');
var videoPreview = require('./videoPreview');

var mysql = require('mysql');
var async = require("async");


module.exports = function (app) {

    // app.use('/:id', videoPreview);
    // app.use('/', index);
    // app.use('/users', users);

    /* GET home page. */
    app.get('/', function (req, res, next) {
        //res.render('index', { title: '首页' });
        // next();
        index(0, req, res, next, function(err) {});
    });

    app.get('/detail/:id', function (req, res, next) {

        var videoIndex = parseInt(req.params.id, 10);

        videoPreview(videoIndex, req, res, next, function(err) {});
    });
};
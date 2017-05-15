var mysql = require('mysql');
var async = require("async");

module.exports = function (index, req, res, next, callback) {

    var pool = mysql.createPool({
        host: "172.104.91.83",
        user: "admin",
        password: "Anhuiqiang851",
        database: "BB",
        connectionLimit: 10,
        port: "3306",
        waitForConnections: false
    });

    // var self = this;
    pool.getConnection(function (err, connection) {

        connection.query("select * from videos where video_index=?", [index], function (err, results, fields) {

            if (results.length != 0) {

                var rootUrl = "http://www.99vv1.com/";
                res.render('item', {
                    "title": results[0]['title'],
                    "_XXXXXRESOURCE_ADDRESS_": rootUrl + results[0]['lq_content'],
                    '_XXXPREVIEW_ADDR_': "http://" + results[0]['preview_url'],
                    'XXXWIDTH_': results[0]['width'],
                    'XXXHEIGHT_': results[0]['height']
                });
            } else {
                next();
            }
            callback(err);
        });
    });
};
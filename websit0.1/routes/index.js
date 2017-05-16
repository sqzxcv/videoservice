var mysql = require('mysql');
var async = require("async");
var fs = require("fs");

/*

*/
var itemModel = fs.readFileSync("./resource/HomeItemModel").toString();
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

        connection.query("select * from videos order by videoid desc limit 10", [index], function (err, results, fields) {

            if (results.length != 0) {

                var rootUrl = "http://www.99vv1.com/";
                var item;
                if (itemModel != null) {
                    
                    var node,rate;
                    for (var i = 0; i < results.length; i++) {
                        if (results[i]['v_like']+results[i]['v_unlike'] != 0) {

                            rate = results[i]['v_like']/(results[i]['v_like']+results[i]['v_unlike']);
                            rate = Number(rate).toFixed(2);
                        } else {

                            rate = 0;
                        }
                        item = itemModel.replace(/{{detail}}/g, "/detail/"+results[i]['video_index'])
                        .replace(/{{thumbnail}}/g,results[i]['thumbnail'])
                        //.replace(/{{thumbnail}}/g,"./Oshine_files/preview3-650x385.jpg")
                        .replace(/{{title}}/g,results[i]['title'])
                        .replace(/{{view_count}}/g,results[i]['view_count'])
                        .replace(/{{rate}}/g, Number(rate * 100 ).toString()+"%");
                        
                        if (i == 0) {
                            node = item;
                        } else {
                            node +="\n" + item;
                        }
                    }
                    res.render('index', {
                        "VIDEOITEM": node,
                        "title":"Home"
                    });
                } else {
                    next();
                }
            } else {
                next();
            }
            callback(err);
        });
    });
};

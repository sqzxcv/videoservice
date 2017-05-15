var mysql = require('mysql');
var async = require("async");
var wrapper = require('co-mysql');
var co = require("co");

module.exports = {
    index: function* () {
        yield this.render('index', { "title": "koa demo" });
    },
    detail: function* () {

        var videoIndex = parseInt(this.params['id'], 10);

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
        // pool.getConnection(function (err, connection) {

        //     connection.query("select * from videos where video_index=?", [videoIndex], function (err, results, fields) {
                
        //         yield self.render('item', {"title":results[0]['title']});
        //     });
        // });

        pool = wrapper(pool);
        co(function *() {
            var results = yield pool.query("select * from videos where video_index="+videoIndex+";");
            // yield this.render('item', {"title":results[0]['title']});
            yield this.render('index', { "title": "koa demo" });
        }) ();
    }
}
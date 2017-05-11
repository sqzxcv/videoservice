'use strict'
const request = require('request');
const cheerio = require('cheerio');
const iconv = require('iconv-lite');
const mysql = require('mysql');
const execTrans = require('./execTrans');
const async = require('async');

function main() {

    // 登录获取 cookie
    // var options = {
    //     url: 'http://www.99vv1.com/login.php?action=login&username=sqzxcv&pass=19851223',//'http://www.99vv1.com/get_file/3/938d5af72ed17b29a8cd7c335282884a/64000/64217/64217.mp4',
    //     headers: {
    //         'User-Agent': 'request',
    //         'Referer': 'http://www.99vv1.com/login.php'
    //     }
    // };
    // function callback(error, response, body) {
    //     if (!error && response.statusCode == 200) {
    //         var info = JSON.parse(body);
    //         console.log(info.stargazers_count + " Stars");
    //         console.log(info.forks_count + " Forks");
    //     }
    // }
    //
    //request(options, callback);

    //请求视频资源
    var options = {
        url: 'http://www.99vv1.com/latest-updates/',
        headers: {
            'User-Agent': 'request',
            'Referer': 'http://www.99vv1.com/',
            'Cookie': "PHPSESSID=fhmodnam8ua7drus1ddf6gsjp3; kt_qparams=sort_by%3Dpost_date; _gat=1; kt_tcookie=1; kt_is_visited=1; _ga=GA1.2.686339515.1493887117; _gid=GA1.2.1778669130.1494145057"
        }
    };

    // var videos
    request(options, callback);
}

function callback(error, response, body) {
    if (!error && response.statusCode == 200) {

        const $ = cheerio.load(body);
        var videoParent = $("div[class=thumbs]").html();
        var videos = $("a[class=kt_imgrc]", videoParent).toArray();

        //先处理视频列表
        var title, url, thumbnail, duration, like, unlike, cotent, view_count, upload_time, video_index, tmpNode, tmparr;
        var urlArr =[];
        var paramArr = [];
        var param;
        $("a[class=kt_imgrc]", videoParent).each(function (i, element) {

            // title = $(element).attr('title');
            // url = $(element).attr('href');
            // video_index = parseInt(url.slice('/')[1], 10);;
            // tmpNode = $("span[class=preview]", element);
            // thumbnail = $("img", tmpNode).attr('src');
            // tmparr = $("span[class=duration]", tmpNode).text().slice(':');
            // duration = (parseInt(tmparr[0], 10) * 60 + parseInt(tmparr[1], 10)) * 1000;//毫秒;时间戳
            // tmpNode = $("span[class=desc]", element);
            // view_count = parseInt($("span[class=views]", tmpNode).text().replace("次观看", ""), 10);
            // upload_time = $("span[class=data]", tmpNode).text().replace(/\s+/g, "");
            param = {
            "title" : $(element).attr('title'),
            "url" : $(element).attr('href'),
            "video_index" : parseInt(url.slice('/')[1], 10),
            "tmpNode" : $("span[class=preview]", element),
            "thumbnail" : $("img", tmpNode).attr('src'),
            "tmparr" : $("span[class=duration]", tmpNode).text().slice(':'),
            "duration" : (parseInt(tmparr[0], 10) * 60 + parseInt(tmparr[1], 10)) * 1000,//毫秒;时间戳
            "tmpNode" : $("span[class=desc]", element),
            "view_count" : parseInt($("span[class=views]", tmpNode).text().replace("次观看", ""), 10),
            "upload_time" : $("span[class=data]", tmpNode).text().replace(/\s+/g, ""),
            };
        });

        //请求单个视频
        async.mapLimit(videos, 2, function (element, callback) {


            var contentOption = {

                url: 'http://www.99vv1.com/' + url,
                headers: {
                    'User-Agent': 'request',
                    'Referer': 'http://www.99vv1.com/',
                    'Cookie': "PHPSESSID=fhmodnam8ua7drus1ddf6gsjp3; kt_qparams=sort_by%3Dpost_date; _gat=1; kt_tcookie=1; kt_is_visited=1; _ga=GA1.2.686339515.1493887117; _gid=GA1.2.1778669130.1494145057"
                }
            };
            request(contentOption, function (error, response, body) {
                // content = 
            });
        }, function (err, results) {

        });


        // videos = iconv.decode(videos, 'gbk');
        // console.log(videos);


        var sqlParamsEntity = [];
        var sql1 = "insert into videos (title,thumbnail,content,view_count,upload_time,duration) value(?,?,?,?,?,?)";
        var param1 = ['a', 'n', 'f', 1, 1, 1];//{ a:1, b:2 };
        sqlParamsEntity.push(execTrans._getNewSqlParamEntity(sql1, param1));

        execTrans.execTrans(sqlParamsEntity, function (err, info) {
            if (err) {
                console.error("事务执行失败");
            } else {
                console.log("done.");
            }
        });


        // var connection = mysql.createConnection({
        //     host: '172.104.91.83',
        //     user: 'admin',
        //     password: 'Anhuiqiang851',
        //     database: 'BB'
        // });
        // connection.connect(function (err) {
        //     if (err) {
        //         console.error('db connect failed with error: ' + err.stack);
        //         return;
        //     }

        //     console.log('db did connect successfully as id ' + connection.threadId);
        // });

        // connection.end();
    }
}

main();
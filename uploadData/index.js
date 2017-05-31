'use strict'
const request = require('request');
const cheerio = require('cheerio');
const iconv = require('iconv-lite');
const mysql = require('mysql');
const execTrans = require('./execTrans');
const async = require('async');
const zlib = require('zlib');
const fs = require('fs');
const event = new (require('events').EventEmitter)();
const schedule = require("node-schedule");
const nodemailer = require("nodemailer");
var execSHFile = require('child_process').execFile;
const path = require('path');

var token = "vtiarsokuaemt7v16ggr7oo317";
var requestURL_last_updates = 'http://www.99vv1.com/latest-updates/';
var requestURL_most_favourited = "http://www.99vv1.com/most-favourited/";
var mailCotent = [];

function main() {

    execSHFile(path.join(__dirname,"/data.sh"), function (err, stdout, stderr) {
        if (err) {
            console.error("同步 data 文件失败:" + err);
        } else {
            console.log(stdout);

            var str = fs.readFileSync('/var/www/data/data.json').toString();
            var paramArr = JSON.parse(str);
            if (paramArr.length != 0) {

                uploadData(paramArr);
            }
        }
    });
}

function uploadData(paramArr) {

    var sqlVideoEntity = [], tagEn = [], tagMap = [];
    var sql, sql2;
    var param_sql, par;
    var titles = [];
    for (var i = 0; i < paramArr.length; i++) {

        sql = "INSERT ignore INTO videos(video_index,title,thumbnail,view_count,upload_time,duration,lq_content,hq_content,preview_url,v_like,v_unlike,url,width,height) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?);";
        param_sql = [paramArr[i]['video_index'], paramArr[i]['title'], paramArr[i]['thumbnail'], paramArr[i]['view_count'], paramArr[i]['upload_time'], paramArr[i]['duration'], paramArr[i]['video_url'],
        paramArr[i]['video_alt_url'], paramArr[i]['preview_url'], paramArr[i]['like'], paramArr[i]['unlike'], paramArr[i]['url'], paramArr[i]['width'], paramArr[i]['height']];
        sqlVideoEntity.push(execTrans._getNewSqlParamEntity(sql, param_sql));
        titles.push(paramArr[i]['title']);
    }
    if (sqlVideoEntity.length == 0) {

        console.error("!!!!!!!!!!!!!!!!当前视频上传失败,");
        return;
    }
    execTrans.execTrans(sqlVideoEntity, function (err, info) {

        if (err) {
            console.error("事务执行失败");
        } else {
            console.log("done.");
            mailCotent = mailCotent.concat(titles);
        }

        //开始插入 tag 及其关系
        for (var i = 0; i < paramArr.length; i++) {

            if (paramArr[i]['tags'] == null) {
                continue;
            }
            for (var j = 0; j < paramArr[i]['tags'].length; j++) {

                sql2 = "insert into tagmap(tagname,videoid) values(?,(select videoid from videos where videos.video_index=?))";
                par = [paramArr[i]['tags'][j], paramArr[i]['video_index']];
                tagEn.push(execTrans._getNewSqlParamEntity(sql2, par));
            }
        }
        if (tagEn.length == 0) {
            console.log("当前视频没有 tag");
            clearData();
            return;
        }
        execTrans.execTrans(tagEn, function (err, info) {

            if (err) {

                console.error("tagmap事务执行失败");
            } else {

                console.log("tagmap 插入完成");
            }
            clearData();
        });
    });
}

function clearData() {

    fs.writeFileSync('/var/www/production/data/data.json',"");
    execSHFile(path.join(__dirname,"/cleardata.sh"), function (err, stdout, stderr) {
        if (err) {
            console.error("清空 data 文件失败:" + err);
        } else {
            console.log(stdout);
        }
    });
}

main();

//定时任务:
function scheduleJob() {

    //每天早上8点钟获取最新内容
    var j = schedule.scheduleJob({ hour: 8 }, function () {

        main();
    });
}

scheduleJob();

function sendEmail(content) {

    var text;
    if (content.length != 0) {
        text = "本次总共采集到" + content.length + "篇文章,具体标题如下:\n" + content.join('\n');
    } else {
        text = "本次采集失败,请检查原因";
    }
    var nodemailer = require('nodemailer');
    var transporter = nodemailer.createTransport({
        service: 'Gmail',
        auth: {
            user: 'love8video@gmail.com',
            pass: '19851223'
        }
    });
    var mailOptions = {
        from: 'love8video@gmail.com ', // sender address
        to: 'sqzxcv@gmail.com', // list of receivers
        subject: 'Hello ✔', // Subject line
        text: text, // plaintext body
    };

    transporter.sendMail(mailOptions, function (error, info) {
        if (error) {
            console.log(error);
        } else {
            console.log('Message sent: ' + info.response);
        }
    });
}
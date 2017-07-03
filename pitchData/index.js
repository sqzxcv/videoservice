'use strict'
const request = require('request');
const cheerio = require('cheerio');
const iconv = require('iconv-lite');
const async = require('async');
const zlib = require('zlib');
const fs = require('fs');
const event = new (require('events').EventEmitter)();
const schedule = require("node-schedule");
const nodemailer = require("nodemailer");
var execSHFile = require('child_process').execFile;
const path = require('path');
var moment = require('moment');

var currentPageIndex = 0;
var token = "j25n3jlddj6gcequgp9bg8ops7";
var cook = `__cfduid=dbbe996ac26c8eb21de5957ae5a8297231498187080; PHPSESSID=j25n3jlddj6gcequgp9bg8ops7; kt_referer=http%3A%2F%2Flocalhost%3A3000%2F0; HstCfa3517525=1498624935773; HstCmu3517525=1498624935773; kt_tcookie=1; HstCla3517525=1498627676180; HstPn3517525=2; HstPt3517525=2; HstCnv3517525=1; HstCns3517525=2; __dtsu=2DE7B66B8E4F1959C418903702741259; _gat=1; kt_tcookie=1; _ga=GA1.2.1049765528.1498187083; _gid=GA1.2.1187703988.1498446269; kt_is_visited=1`;
var requestURL_last_updates = 'http://99kk5.com/latest-updates/';
var requestURL_most_favourited = "http://99kk5.com/most-favourited/";
var vip_url = `http://99kk5.com/viplatest-updates/`;
var vip_url_most_favourited = `http://99kk5.com/vipmost-favourited/`;
var vip_url_rated = `http://99kk5.com/viptop-rated/`;
var my_favourite_videos_url = `http://99kk5.com/my_favourite_videos/`;
var mailCotent = [];
var outPutResult = [];

function main() {

    event.on("requireNewPage", function (pageIndex) {

        if (outPutResult.length != 0) {

            var str = fs.readFileSync('/Users/shengqiang/Documents/Codes/data/data.json').toString();
            if (str.length != 0) {
                try {
                    var arr = JSON.parse(str);
                    outPutResult = outPutResult.concat(arr);
                } catch (error) {

                }
            }
            str = JSON.stringify(outPutResult);
            fs.writeFileSync('/Users/shengqiang/Documents/Codes/data/data.json', str);
            syncData(function (err) { });
            console.log("++++++++++++++++++++获取视频数量:" + outPutResult.length);
            outPutResult = [];
        }
        if (pageIndex < 9) {
            console.log("------------------------开始请求视频列表,页码:" + pageIndex);
            //请求视频资源
            var options = {
                url: my_favourite_videos_url + pageIndex + '/',
                headers: {
                    'User-Agent': "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_12_3) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/58.0.3029.110 Safari/537.36",
                    'Referer': 'http://99kk5.com/latest-updates/',
                    'Host': "99kk5.com",
                    'Cookie': cook//"PHPSESSID=" + token + "; kt_referer=http%3A%2F%2Flove8video.com%2F; kt_tcookie=1; _ga=GA1.2.197140424.1497848164; _gid=GA1.2.2049258620.1497848164; kt_is_visited=1"
                }
            };
            request(options, callback);
        } else {
        }
    });

    execSHFile(path.join(__dirname, "/pulldata.sh"), function (err, stdout, stderr) {
        if (err) {
            console.error("同步 data 文件失败:" + err);
        } else {
            console.log(stdout);

            event.emit("requireNewPage", currentPageIndex);
        }
    });
}

function callback(error, response, body) {
    if (!error && response.statusCode == 200) {

        console.log(" 视频列表返回成功,页码:" + currentPageIndex);
        var $ = cheerio.load(body);
        var videoParent = $("div[class=thumbs]").html();
        var videos = $("a[class=kt_imgrc]", videoParent).toArray();
        fs.writeFileSync("/Users/shengqiang/Desktop/tmp/body.html", body);

        //先处理视频列表
        var title, url, thumbnail, duration, like, unlike, cotent, view_count, upload_time, video_index = 0, tmpNode, tmparr;
        var urlArr = [];
        var paramArr = [];
        $("a[class=kt_imgrc]", videoParent).each(function (i, element) {

            title = $(element).attr('title');
            url = $(element).attr('href');
            video_index = parseInt(url.split('/')[2], 10);;
            tmpNode = $("span[class=preview]", element);
            thumbnail = $("img", tmpNode).attr('src');
            tmparr = $("span[class=duration]", tmpNode).text().split(':');
            duration = (parseInt(tmparr[0], 10) * 60 + parseInt(tmparr[1], 10)) * 1000;//毫秒;时间戳
            tmpNode = $("span[class=desc]", element);
            view_count = parseInt($("span[class=views]", tmpNode).text().replace("次观看", ""), 10);
            upload_time = moment().unix();//$("span[class=data]", tmpNode).text().replace(/\s+/g, "");
            var param = {
                "title": title,
                "url": url,
                "video_index": video_index,
                "thumbnail": thumbnail,
                "duration": duration,
                "view_count": view_count,
                "upload_time": upload_time
            };
            paramArr.push(param);
            urlArr.push(param['url']);
        });

        console.log("开始请求第" + currentPageIndex + "页所有视频");
        //请求单个视频
        var contentDict;
        var urla = [urlArr[0], urlArr[1], urlArr[2]];
        async.mapLimit(urlArr, 1, function (url, callback) {

            var contentOption = {

                url: 'http://99kk5.com/' + url,
                headers: {
                    "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_12_3) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/58.0.3029.110 Safari/537.36",
                    'Accept': "text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8",
                    'Accept-Language': "zh-CN,zh;q=0.8,zh-TW;q=0.6,en;q=0.4",
                    'Host': "99kk5.com",
                    'Upgrade-Insecure-Requests': 1,
                    "Connection": "keep-alive",
                    'Cookie': cook//"PHPSESSID=" + token + "; kt_referer=http%3A%2F%2Flove8video.com%2F; kt_qparams=id%3D69926%26dir%3Db178; kt_tcookie=1; _ga=GA1.2.197140424.1497848164; _gid=GA1.2.2049258620.1497848164; _gat=1; kt_is_visited=1",
                }
            };
            request(contentOption, async function (error, response, body) {
                // console.log('start');
                if (error == null && response.statusCode == 200) {

                    var $ = cheerio.load(body);
                    fs.writeFileSync("/Users/shengqiang/Desktop/tmp/body.html", body);

                    var scriptText = $($("div[class=video]").children()[2]).html();
                    if (scriptText == null) {
                        console.error("失败:获取脚本失败, URL:" + url);
                        fs.writeFileSync("/Users/shengqiang/Desktop/tmp/" + url.replace(/\//g, "-") + ".html", body);

                        callback("请求视频识别,URL:" + url, null);
                        return;
                    }
                    var tmpInfo = ((/{[\s\S]*};/).exec((/flashvars\s*=\s*{[\s\S]*?};/).exec($($("div[class=video]").children()[2]).text())[0])[0]).replace(/\s+/g, "");
                    tmpInfo = tmpInfo.replace(/{/g, "");
                    tmpInfo = tmpInfo.replace(/};/g, "");
                    tmpInfo = tmpInfo.replace(/'/g, "");
                    tmpInfo = tmpInfo.replace(/http:\/\//g, "");
                    // var content = $("video").html();
                    // contentDict[url] = content;
                    var arr = tmpInfo.split(',');
                    var videoInfo = [];
                    for (var i = 0; i < arr.length; i++) {

                        videoInfo[arr[i].split(':')[0]] = arr[i].split(':')[1];
                    }

                    //获取视频播放器宽度/高度
                    tmpInfo = ((/kt_player\([\s\S]*?\);/).exec($($("div[class=video]").children()[2]).text().replace(/\s+/g, "")))[0]
                    tmpInfo = tmpInfo.replace(/kt_player\(/g, "");
                    tmpInfo = tmpInfo.replace(/\);/g, "");
                    tmpInfo = tmpInfo.replace(/'/g, "");
                    var tmpArr = tmpInfo.split(',');
                    videoInfo['width'] = parseInt(tmpArr[2], 10);
                    videoInfo['height'] = parseInt(tmpArr[3], 10);

                    var progress = $("li[class=progress]", $("ul[class=rate]")).text();
                    progress = progress.split('(')[1];
                    progress = progress.split(")")[0];
                    var like = parseInt(progress.split('/')[0], 10);
                    var unlike = parseInt(progress.split('/')[1], 10);
                    videoInfo['like'] = like;
                    videoInfo['unlike'] = unlike;

                    //处理 tag
                    var tmpNodes = $("div[class=description-block]").children();
                    //todo 默认将该视频打上 tag,用完立刻注释
                    var tags = [`viplatest-updates`, `精品视频`,`my_favourite`];
                    // var tags = [];
                    for (var i = 0; i < tmpNodes.length; i++) {

                        if ($("span", tmpNodes[i]).text().search("影片分类:") != -1
                            || $("span", tmpNodes[i]).text().search("标签:") != -1) {

                            $("a", $("div[class=wrap-overflow]", tmpNodes[i])).each(function (index, element) {

                                tags.push($(element).text());
                            });
                            // var allcatagrate = $("div[class=wrap-overflow]", tmpNodes[i]).children();
                            // allcatagrate.forEach(function (element) {

                            // }, this);
                        }
                    }
                    videoInfo['tags'] = tags;
                    var result = videoInfo;
                    //result[videoInfo["video_id"]] = videoInfo;
                    console.log("-----,title:" + $("div[class=wrap-title]").text().replace(/\s+/g, "") + ";  url:" + url);
                    await sleep(1000);
                    // console.log('end');
                    callback(null, result);
                } else {

                    await sleep(3000);
                    // console.log('end');
                    callback(error, null);
                }
            });

            // var start = async function () {
            //     // 在这里使用起来就像同步代码那样直观
            //     console.log('start');
            //     await sleep(3000);
            //     console.log('end');
            // };

            // start();
        }, function (err, results) {

            if (results) {

                var rDict = [];
                for (var i = 0; i < results.length; i++) {

                    if (results[i] == null) {
                        continue;
                    }
                    rDict[results[i]['video_id']] = results[i];
                }
                var sqlVideoEntity = [], tagEn = [], tagMap = [];
                var sql, sql2;
                var param_sql, par;
                var titles = [];
                for (var i = 0; i < paramArr.length; i++) {
                    var result = rDict[Number(paramArr[i]['video_index']).toString()];
                    if (result == null || result == undefined) {
                        continue;
                    }
                    // 
                    paramArr[i]['video_url'] = result['video_url'];
                    paramArr[i]['video_alt_url'] = result['video_alt_url'];
                    paramArr[i]['preview_url'] = result['preview_url'];
                    paramArr[i]['like'] = result['like'];
                    paramArr[i]['unlike'] = result['unlike'];
                    paramArr[i]['width'] = result['width'];
                    paramArr[i]['height'] = result['height'];
                    paramArr[i]['tags'] = result['tags'];
                }

                outPutResult = outPutResult.concat(paramArr);
                event.emit("requireNewPage", ++currentPageIndex);
            }
            if (err) {

                console.error("请求视频数据出现错误:" + err);
            }
        });
    }
}

main();

var sleep = function (time) {
    return new Promise(function (resolve, reject) {
        setTimeout(function () {
            resolve();
        }, time);
    })
};

//定时任务:
function scheduleJob() {

    //每天早上8点钟获取最新内容
    var j = schedule.scheduleJob({ hour: 8 }, function () {

        currentPageIndex = 0;
        outPutResult = [];
        main();
    });
}

scheduleJob();

function syncData(callback) {

    execSHFile(path.join(__dirname, "/data.sh"), function (err, stdout, stderr) {
        if (err) {
            console.error("同步 data 文件失败:" + err);
        } else {
            console.log(stdout);
        }
        callback(err);
    });
}
var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');

var index = require('./routes/index');

var app = express();

var config = require('./config.json');//引入配置文件
var wechat = require('./util/getAccessToken')//引入获取access_token
var util = require('util') //引入 util 工具包
var menus=require('./util/menu.json')
// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: false}));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
/**
 * 进行微信服务器验证
 * 进行access_token 的获取、更新
 */
app.use(function (req, res, next) {
    var wechatApp = new wechat(config); //实例wechat 模块
    wechatApp.auth(req, res, next)//验证是否为微信请求
    wechatApp.getAccessToken().then(function (data) {
        console.log(`access_token:${data}`)
        var url = util.format(config.apiURL.createMenu,config.apiDomain,data);
//使用 Post 请求创建微信菜单
        wechatApp.requestPost(url,JSON.stringify(menus)).then(function(data){
            //将结果打印
            console.log(data);
            next()
        });

    }).catch(function (err) {
        console.log(err)
    });
})
app.use('/', index);


module.exports = app;

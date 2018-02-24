var express = require('express');
var router = express.Router();
var crypto = require('crypto');  //引入加密模块
var config = require('./../config.json');//引入配置文件
var parseString = require('xml2js').parseString;//引入xml2js包
var huifu=require('./../util/huifu')

/* 接入微信开发者模式 */
router.get('/', function (req, res) {
    //1.获取微信服务器Get请求的参数 signature、timestamp、nonce、echostr
    var signature = req.query.signature,//微信加密签名
        timestamp = req.query.timestamp,//时间戳
        nonce = req.query.nonce,//随机数
        echostr = req.query.echostr;//随机字符串

    //2.将token、timestamp、nonce三个参数进行字典序排序
    var array = [config.token, timestamp, nonce];
    array.sort();

    //3.将三个参数字符串拼接成一个字符串进行sha1加密
    var tempStr = array.join('');
    const hashCode = crypto.createHash('sha1'); //创建加密类型
    var resultCode = hashCode.update(tempStr, 'utf8').digest('hex'); //对传入的字符串进行加密

    //4.开发者获得加密后的字符串可与signature对比，标识该请求来源于微信
    if (resultCode === signature) {
        res.send(echostr);
    } else {
        res.send('错误');
    }
});
/**
 * 处理微信post消息请求
 */
router.post('/', function (req, res) {
    try{
        var buffer = [];
        //监听 data 事件 用于接收数据
        req.on('data', function (data) {
            buffer.push(data);
        });
        //监听 end 事件 用于处理接收完成的数据
        req.on('end', function () {
            //输出接收完成的数据
            parseString(Buffer.concat(buffer).toString('utf-8'),{explicitArray : false},function(err,result){
                if(err){
                    //打印错误信息
                    console.log(err);
                }else{
                    //打印解析结果
                    console.log(result);
                    result = result.xml;
                    var toUser = result.ToUserName; //接收方微信
                    var fromUser = result.FromUserName;//发送方微信
                    var xml=''
                    if(result.Event==='subscribe'){
                        //回复消息
                        xml=huifu.txtMsg(fromUser,toUser,'欢迎关注公众号,hahhh');
                        console.log(xml)
                        res.send(xml)
                    }else{
                        xml=huifu.txtMsg(fromUser,toUser,'您好');
                        console.log(xml)
                        res.send(xml)
                    }

                }
            })
        });
    }catch(err){
console.log(err)
    }

})
module.exports = router;

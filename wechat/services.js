var config = require('../config')
var weixinUtil = require('./util')
var crypto = require('crypto')

console.log(weixinUtil)

// TODO (yutingzhao): 群发消息

//开发者通过检验signature对请求进行校验（下面有校验方式）。
//若确认此次GET请求来自微信服务器，请原样返回echostr参数内容，则接入生效，否则接入失败。
function judgeAuthentication(token, signature, timestamp, nonce) {
    //加密/校验流程：
    //1. 将token、timestamp、nonce三个参数进行字典序排序
    //2. 将三个参数字符串拼接成一个字符串进行sha1加密
    //3. 开发者获得加密后的字符串可与signature对比，标识该请求来源于微信
    var shasum = crypto.createHash('sha1')
    var arr = [token, timestamp, nonce].sort()
    shasum.update(arr.join(''))

    return shasum.digest('hex') === signature
}

//认证
function authenticate(req, res, next){
    var signature = req.query.signature //   微信加密签名
    var timestamp = req.query.timestamp //   时间戳
    var nonce = req.query.nonce //    随机数
    var echostr = req.query.echostr // 随机字符串
    var token = config.wechatToken

    if(judgeAuthentication(token, signature, timestamp, nonce, echostr)) {
        //通过微信官方认证来源验证
        res.send(echostr)
    } else {
        res.send('error.untrusted')
    }
}

//自动回复消息
function reply(req, res, next){
    // parse
    var buf = ''
    var data = null

    req.setEncoding('utf8')
    req.on('data', function(chunk){ buf += chunk })
    req.on('end', function(){
        console.log('get reply from weixin:' + buf)
        data = weixinUtil.decodeRequest(buf)
        getReplyContent(data, function(reply){
            res.set('Content-Type', 'text/xml')
            switch(reply.msgType) {
                case 'text':
                    res.render('wechat/text.jade', reply)
                    break
                case 'news':
                    // TODO(yutingzhao): support news
                    res.render('wechat/news.jade', reply)
                    break
            }
            console.log('send reply to custom:' + JSON.stringify(reply))
        })
    })
}

function getReplyContent(data, callback) {
    // TODO(yutingzhao): use real data
    callback && callback({
        msgType: 'text',
        toUser: data.fromUser,
        fromUser: data.toUser,
        funcFlag: 1,
        createTime: Date.now(),
        content: '感谢您的反馈，我们会努力做得更好'
    })
}

exports.authenticate = authenticate
exports.reply = reply


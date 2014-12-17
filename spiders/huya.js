
var cheerio = require('cheerio')
var request = require('request')
var util = require('./util')
var async = require('async')
var debug = require('debug')('huya')

var BASE_URL = 'http://www.huya.com/'


module.exports = function(cb) {
    cb = cb || noop
    request({
        url: 'http://www.huya.com/show',
        headers: {
            'X-Requested-With': 'XMLHttpRequest',
            'User-Agent': 'Mozilla/5.0 (Windows NT 6.3; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/37.0.2062.103 Safari/537.36',
            'Referer': 'http://www.huya.com/'
        }
    }, function(err, res, body) {
        if (err) {
            return cb(err)
        }
        if ('string' == typeof body) {
            body = /videoList\s*=\s*(\[[^\[\]]+\])/.exec(body)[1]
            try {
                arr = JSON.parse(body)
            } catch (e) {
                return cb('huya parse error')
            }
        } else {
            return cb('huya response is not string')
        }
        debug('huya show', arr.length)
        var ret = []
        arr.forEach(function(me) {
            var obj = {
                  href: me.yyid
                , img: me.screenshot
                , title: me.nick
                , anchor: me.nick
                , people: me.userCount
                , gameType: '看球'
                , baseurl: BASE_URL
                , platform: '虎牙'
            }
            util(obj)
            ret.push(obj)
        })
        cb(null, ret)
    })
}

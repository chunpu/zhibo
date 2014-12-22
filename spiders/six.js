
var cheerio = require('cheerio')
var request = require('request')
var util = require('./util')
var async = require('async')
var debug = require('debug')('six')

var BASE_URL = 'http://www.6.cn/'

module.exports = function(cb) {
    cb = cb || util.noop
    request({
        url: 'http://www.6.cn/liveAjax.html',
        headers: {
            'X-Requested-With': 'XMLHttpRequest',
            'User-Agent': 'Mozilla/5.0 (Windows NT 6.3; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/37.0.2062.103 Safari/537.36',
            'Referer': 'http://www.6.cn/#'
        }
    }, function(err, res, body) {
        if (err) return cb(err)
        if ('string' == typeof body) {
            try {
                body = JSON.parse(body)
                body = body.roomList
            } catch (e) {
                return cb('six parse error')
            }
        } else {
            return cb('six response is not string')
        }
        debug('get item count :', body.length)
        if (body.length < 10) return cb('too short')
        var ret = body.map(function(x) {
            var a = {
                  platform: '六间房'
                , href: x.uid
                , img: x.pic
                , title: x.username
                , anchor: x.username
                , gameType: '秀场'
                , people: x.count
                , baseurl: BASE_URL
            }
            util(a)
            return a
        })
        cb(null, ret)
    })
}

var cheerio = require('cheerio')
var request = require('request')
var util = require('./util')
var async = require('async')

var BASE_URL = 'http://www.zhanqi.tv/'

module.exports = function(cb) {
    cb = cb || noop
    request({
        url: 'http://www.zhanqi.tv/api/static/live.hots/200-1.json',
        headers: {
            'X-Requested-With': 'XMLHttpRequest',
            'User-Agent': 'Mozilla/5.0 (Windows NT 6.3; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/37.0.2062.103 Safari/537.36',
            'Referer': 'Referer:http://www.zhanqi.tv/lives'
        }
    }, function(err, res, body) {
        if (err) return cb(err)
        if ('string' == typeof body) {
            try {
                body = JSON.parse(body)
                body = body.data.rooms
            } catch (e) {
                return cb('zhanqi parse error')
            }
        }
        if (body.length < 10) return cb('too short')
        var ret = body.map(function(x) {
            var a = {
                  platform: '战旗'
                , href: x.url
                , img: x.bpic
                , title: x.title
                , anchor: x.nickname
                , gameType: x.gameName
                , people: x.online
                , baseurl: BASE_URL
            }
            util(a)
            return a
        })
        cb(null, ret)
    })
}
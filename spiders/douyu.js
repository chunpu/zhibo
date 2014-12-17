
var cheerio = require('cheerio')
var request = require('request')
var util = require('./util')
var async = require('async')

var BASE_URL = 'http://www.douyutv.com/'
var MIN_LEN = 10

module.exports = function(cb) {
    cb = cb || noop
    async.map([0, 100], function(x, cb) {
        request({
            url: 'http://www.douyutv.com/directory/all?limit=100&offset=' + x,
            headers: {
                'X-Requested-With': 'XMLHttpRequest',
                'User-Agent': 'Mozilla/5.0 (Windows NT 6.3; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/37.0.2062.103 Safari/537.36',
                'Referer': 'http://www.douyutv.com/directory/all'
            }
        }, function(err, res, body) {
            cb(err, body)
        })
    }, function(err, ret) {
        if (err || !Array.isArray(ret)) return cb(err || 'async not array')
        var $ = cheerio.load(ret.join(''))
        var arr = $('li')
        if (arr.length < MIN_LEN) return cb('too short')
        console.log('douyu', arr.length)
        var ret = []
        arr.each(function() {
            var me = $(this)
            var obj = {
                  href: me.find('.list').attr('href')
                , img: me.find('img').attr('data-original')
                , title: me.find('.title').text()
                , anchor: me.find('.nnt').text()
                , people: me.find('.view').text()
                , gameType: me.find('.zbName').text()
                , baseurl: BASE_URL
                , platform: '斗鱼'
            }
            util(obj)
            ret.push(obj)
        })
        cb(null, ret)
    })
}
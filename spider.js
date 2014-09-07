var cheerio = require('cheerio')
var request = require('request')
var data = require('./data')
var util = require('./spider-util')
var async = require('async')

function noop() {}

var MIN_LEN = 10

var urls = {
    douyu: 'http://www.douyutv.com/',
    zhanqi: 'http://www.zhanqi.tv/lives'
}

// 使用更牛逼的接口 GET: http://www.douyutv.com/directory/all?offset=0&limit=100 一次100个
exports.douyu = function(cb) {
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
        var ret = []
        arr.each(function() {
            var me = $(this)
            var obj = {
                href: me.find('.list').attr('href'),
                img: me.find('img').attr('src'),
                title: me.find('.title').text(),
                anchor: me.find('.nnt').text(),
                people: me.find('.view').text(),
                gameType: me.find('.zbName').text(),
                baseurl: urls.douyu
            }
            util(obj)
            ret.push(obj)
        })
        data.douyu = ret
    })
}

exports.zhanqi = function(cb) {
    cb = cb || noop
    request(urls.zhanqi, function(err, res, body) {
        if (err) return cb(err)
        var $ = cheerio.load(body)
        var arr = $('.live-list-tabc li')
        if (arr.length < 10) return cb('too short')
        var ret = []
        arr.each(function() {
            var me = $(this)
            var obj = {
                href: me.find('.imgBox a[href]').attr('href'),
                img: me.find('.imgBox img').attr('src'),
                title: me.find('.name').text(),
                anchor: me.find('.anchor').text(),
                gameType: me.find('.game-name').text(),
                people: me.find('span.dv').text(),
                baseurl: urls.zhanqi
            }
            util(obj)
            ret.push(obj)
        })
        data.zhanqi = ret
    })
}

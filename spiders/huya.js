
var cheerio = require('cheerio')
var request = require('request')
var util = require('./util')
var async = require('async')
var debug = require('debug')('huya')

var BASE_URL = 'http://www.huya.com/'

function getGames(cb) {
    cb = cb || util.noop
    request({
        url: 'http://www.huya.com/l',
        headers: {
            'X-Requested-With': 'XMLHttpRequest',
            'User-Agent': 'Mozilla/5.0 (Windows NT 6.3; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/37.0.2062.103 Safari/537.36',
            'Referer': 'http://www.huya.com/'
        }
    }, function(err, res, body) {
        if (err) {
            return cb(err)
        }
        var $ = cheerio.load(body)
        var arr = $('.video-list-item')
        debug('huya game', arr.length)
        var ret = []
        arr.each(function() {
            var me = $(this)
            var obj = {
                  href: me.find('a.video-info').attr('href')
                , img: me.find('img.pic').attr('src')
                , title: me.find('.all_live_tit a').text()
                , anchor: me.find('.all_live_nick').text()
                , people: me.find('.num').text().replace('个观众', '')
                , gameType: me.find('.game-type').text().trim()
                , baseurl: BASE_URL
                , platform: '虎牙'
            }
            util(obj)
            ret.push(obj)
        })
        debug(ret)
        cb(null, ret)
    })
}

function getGirls(cb) {
    cb = cb || util.noop
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
                  href: 'show/' + me.yyid
                , img: me.screenshot
                , title: me.nick
                , anchor: me.nick
                , people: me.userCount
                , gameType: '秀场'
                , baseurl: BASE_URL
                , platform: '虎牙'
            }
            util(obj)
            ret.push(obj)
        })
        cb(null, ret)
    })
}


module.exports = function(cb) {
    async.parallel([getGames, getGirls], function (err, ret) {
        if (err && ret.length < 2) {
            return cb('huya spider async response error')
        }
        cb(null, ret[0].concat(ret[1]))
    })
}

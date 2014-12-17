var cheerio = require('cheerio')
var request = require('request')
var data = require('./data')
var util = require('./spider-util')
var async = require('async')
var debug = require('debug')('spider')

function noop() {}

var MIN_LEN = 10

var urls = {
    douyu: 'http://www.douyutv.com/',
    //zhanqi: 'http://www.zhanqi.tv/lives'// http://www.zhanqi.tv/api/static/live.hots/30-1.json
    zhanqi: 'http://www.zhanqi.tv/api/static/live.hots/200-1.json',
    huomao: 'http://www.huomaotv.com/'
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
        debug('douyu: %d', arr.length)
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
                , baseurl: urls.douyu
                , platform: '斗鱼'
            }
            util(obj)
            ret.push(obj)
        })
        data.douyu = ret
    })
}

exports.zhanqi = function(cb) {
    cb = cb || noop
    request({
        url: urls.zhanqi,
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
        /*
        var $ = cheerio.load(body)
        var arr = $('.live-list-tabc li')
        if (arr.length < 10) return cb('too short')
        console.log('zhanqi', arr.length)
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
        })*/
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
                , baseurl: urls.zhanqi
            }
            util(a)
            return a
        })
        data.zhanqi = ret
    })
}

exports.huomao = function(cb) {
    cb = cb || noop
    request({
        url: 'http://www.huomaotv.com/live_list',
        headers: {
            'X-Requested-With': 'XMLHttpRequest',
            'User-Agent': 'Mozilla/5.0 (Windows NT 6.3; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/37.0.2062.103 Safari/537.36',
            'Referer': 'http://www.huomaotv.com/'
        }
    }, function(err, res, body) {
        if (err) {
            return cb(err)
        }
        var $ = cheerio.load(body)
        var arr = $('.VOD')
        debug('huomao: %d', arr.length)
        var ret = []
        arr.each(function() {
            var me = $(this)
            var obj = {
                  href: me.find('.VOD_pic dd a').attr('href')
                , img: urls.huomao + me.find('.VOD_pic img').attr('data-src')
                , title: me.find('.VOD_title a').text()
                , anchor: me.find('.LiveAuthor').text()
                , people: me.find('.fans').text()
                , gameType: me.find('.titleMb').text().trim()
                , baseurl: urls.huomao
                , platform: '火猫'
            }
            util(obj)
            ret.push(obj)
        })
        data.huomao = ret
    })
}

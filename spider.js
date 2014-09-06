var cheerio = require('cheerio')
var request = require('request')
var data = require('./data')
var util = require('./spider-util')

function noop() {}

var urls = {
    douyu: 'http://www.douyutv.com/',
    zhanqi: 'http://www.zhanqi.tv/lives'
}

exports.douyu = function(cb) {
    cb = cb || noop
    request(urls.douyu, function(err, res, body) {
        if (err) return cb(err)

        var $ = cheerio.load(body)
        var li = $('.column li')

        if (li.length < 10) return cb && cb('too short') // 认为失败

        var ret = []
        li.each(function() {
            var me = $(this)
            var img = me.find('img').attr('src')
            var people = util.people(me.find('.icon2').text())
            var anchor = me.find('.icon1').text()
            var gameType = me.find('.dis').text()
            var $a = me.find('a[title]')
            var href = util.url(urls.douyu, $a.attr('href'))
            var title = $a.attr('title')
            var obj = {
                people: people,
                img: img,
                anchor: anchor,
                title: title,
                href: href,
                gameType: gameType
            }
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
                href: util.url(urls.zhanqi, me.find('.imgBox a[href]').attr('href')),
                img: me.find('.imgBox img').attr('src'),
                title: me.find('.name').text(),
                anchor: me.find('.anchor').text(),
                gameType: me.find('.game-name').text(),
                people: util.people(me.find('span.dv').text())
            }
            ret.push(obj)
        })
        data.zhanqi = ret
    })
}

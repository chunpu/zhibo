
var cheerio = require('cheerio')
var request = require('request')
var util = require('./util')
var async = require('async')
var debug = require('debug')('huomao')

var BASE_URL = 'http://www.huomaotv.com/'


module.exports = function(cb) {
    cb = cb || util.noop
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
        debug('huomao', arr.length)
        var ret = []
        arr.each(function() {
            var me = $(this)
            var obj = {
                  href: me.find('.VOD_pic dd a').attr('href')
                , img: BASE_URL + me.find('.VOD_pic img').attr('data-src')
                , title: me.find('.VOD_title a').text()
                , anchor: me.find('.LiveAuthor').text()
                , people: me.find('.fans').text()
                , gameType: me.find('.titleMb').text().trim()
                , baseurl: BASE_URL
                , platform: '火猫'
            }
            util(obj)
            ret.push(obj)
        })
        cb(null, ret)
    })
}

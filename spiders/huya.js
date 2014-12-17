
var cheerio = require('cheerio')
var request = require('request')
var util = require('./util')
var async = require('async')

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
        var $ = cheerio.load(body)
        console.log(body)
        var arr = $('.video-list-item')
        console.log('huya show', arr.length)
        var ret = []
        arr.each(function() {
            var me = $(this)
            var obj = {
                  href: me.find('a.video-info').attr('href')
                , img: BASE_URL + me.find('img.pic').attr('src')
                , title: me.find('.VOD_title a').text()
                , anchor: me.find('.game-anchor h5').text()
                , people: parseInt(me.find('.icon-p').text())
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

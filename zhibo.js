var express = require('express')
var app = express()
var cheerio = require('cheerio')
var request = require('request')
var route = express.Router()
var spider = require('./spider')
var data = require('./data')

// 防抓取技巧, 懒加载

runSpider()

//setInterval(spider, 2000)

app.engine('jade', require('jade').__express).set('views', __dirname + '/views')

app
    .use(express.static(__dirname + '/static'))
    .use(route.get('/', function(req, res) {
    var items = merge()
    console.log(items[0], items[1])
    res.render('index.jade', {
        items: items
    })
})).listen(8888)

var sites = 'zhanqi douyu'.split(' ')

/*
function merge() {
    var arr = []
    sites.forEach(function(site) {
        if ('object' == typeof data[site]) {
            arr.push(data[site])
        }
    })
    arr = [].concat.apply([], arr)
    return arr.sort(function(a, b) {
        return a.people > b.people
    })
}*/

function merge() {
    var ret = {}
    sites.forEach(function(site) {
        var arr = data[site]
        if (!Array.isArray(arr)) return
        arr.forEach(function(x) {
            if (x.title) {
                ret[x.title] = x // filter same
            }
        })
    })
    var arr = []
    for (var k in ret) {
        arr.push(ret[k])
    }
    return arr.sort(function(a, b) {
        return b.people - a.people
    })
}

function runSpider() {
    for (var k in spider) {
        spider[k]()
    }
}

function getDouyu(cb) {
    request('http://www.douyutv.com/', function(err, res, body) {
        var $ = cheerio.load(body)
        var li = $('.column li')

        if (li.length < 10) return cb && cb('too short') // 认为失败

        var ret = []
        li.each(function() {
            var me = $(this)
            var img = me.find('img').attr('src')
            var people = me.find('.icon2').text()
            var anchor = me.find('.icon1').text()
            var gameType = me.find('.dis').text()
            var $a = me.find('a[title]')
            var href = $a.attr('href')
            var title = $a.attr('title')
            if (people.indexOf('万') != -1) {
                people = parseFloat(people) * 10000
            }
            people = ~~people
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

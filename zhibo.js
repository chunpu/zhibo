var express = require('express')
var app = express()
var cheerio = require('cheerio')
var request = require('request')
var route = express.Router()
var spider = require('./spider')
var data = require('./data')
var wechat = require('./wechat/services')

// 防抓取技巧, 懒加载

runSpider()

setInterval(runSpider, 100000)

app.engine('jade', require('jade').__express).set('views', __dirname + '/views')

app
    .use(express.static(__dirname + '/static'))
    .use(route.get('/wechat/authenticate', wechat.authenticate))
    .use(route.post('/wechat/reply', wechat.reply))
    .use(route.get('/', function(req, res) {
    var items = merge()
    res.render('index.jade', {
        items: items
    })
})).listen(8888)

var sites = 'zhanqi douyu'.split(' ')

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

function alert(err) {
    console.log(err)
}

function runSpider() {
    console.log('spider run')
    for (var k in spider) {
        spider[k](alert)
    }
}

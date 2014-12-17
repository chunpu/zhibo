var express = require('express')
var app = express()
var cheerio = require('cheerio')
var request = require('request')
var route = express.Router()
var spiders = require('./spiders')
var data = require('./data')
var wechat = require('./wechat/services')
var config = require('./config')

// 防抓取技巧, 懒加载

runSpider()

setInterval(runSpider, 100000)

app.engine('jade', require('jade').__express).set('views', __dirname + '/views')

app
    .use(express.static(__dirname + '/static'))
    .use(route.get('/wechat/juzhibotv', wechat.authenticate))
    .use(route.post('/wechat/juzhibotv', wechat.reply))
    .use(route.get('/', function(req, res) {
    var locals = merge()
    res.render('index.jade', locals)
})).listen(process.argv[2] || config.port)

var sites = 'zhanqi douyu huomao'.split(' ')

var COL = 4 // 每行3个

function merge() {
    var uniq = {}
    sites.forEach(function(site) {
        var arr = data[site]
        if (!Array.isArray(arr)) return
        arr.forEach(function(x) {
            if (x.title) {
                uniq[x.title] = x // filter same
            }
        })
    })
    var arr = []
    for (var k in uniq) {
        arr.push(uniq[k])
    }
    var ret = {}
    var items = arr.sort(function(a, b) {
        return b.people - a.people
    })
    'DOTA2 英雄联盟 炉石传说 其他 看球'.split(' ').forEach(function(x) {
        ret[x] = items.filter(function(item) {
            return item._gameType == x
        }).slice(0, COL * 2)
    })
    ret.hot = items.slice(0, COL * 2)
    ret.items = items
    return ret
}

function alert(err) {
    console.log(err)
}

function runSpider() {
    console.log('spider run')
    for (var k in spiders) {
        if (typeof spiders[k] == 'function') {
            spiders[k](function (err, items) {
                if (err) {
                    alert(err)
                } else {
                    data[k] = items
                }
            })
        }
    }
}

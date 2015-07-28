var express = require('express')
var app = express()
var cheerio = require('cheerio')
var request = require('request')
var route = express.Router()
var spiders = require('./spiders')
var data = require('./data')
var wechat = require('./wechat/services')
var config = require('./config')
var debug = require('debug')('zhibo')
var ballUtil = require('./utils/ball')

// 防抓取技巧, 懒加载

runSpiders()

setInterval(runSpiders, 100000)

var port = process.argv[2] || config.port

app.engine('jade', require('jade').__express).set('views', __dirname + '/views')

app
    .use(express.static(__dirname + '/static'))
    .use(express.static(__dirname + '/dist'))
    .use(route.get('/wechat/juzhibotv', wechat.authenticate))
    .use(route.post('/wechat/juzhibotv', wechat.reply))
    .use(route.get('/', function(req, res) {
        var locals = merge()
        res.render('index.jade', locals)
    }))
    .use(route.get('/:type', function(req, res) {
        var type = req.params.type
        var locals = merge(type)
        res.render('index.jade', locals)
    }))
    .listen(port, function() {
		console.log('listen on: %d', port)
	})

var sites = 'zhanqi douyu huomao huya six'.split(' ')

var COL = 4 // 每行3个

var ALL_TYPES = '英雄联盟 DOTA2 炉石传说 看球 其他 秀场'.split(' ')

function merge(type) {
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
    var types, row
    if (type) {
        types = [type]
        row = 8
    } else {
        types = ALL_TYPES
        row = 2
    }
    types.forEach(function(x) {
        ret[x] = items.filter(function(item) {
            if (x == '看球' && ballUtil.isBall(item)) {
                return true
            }
            return item._gameType == x
        }).slice(0, COL * row)
    })
    if (type) {
        ret.hot = null
        ret.type = type
    } else {
        ret.type = null
        ret.hot = items.slice(0, COL * row)
    }
    ret.types = ALL_TYPES
    ret.items = items
    return ret
}

function alert(err) {
    console.error(err)
}

function runSpider(name, spider) {
    spider(function (err, items) {
        if (err) {
            alert(err)
        } else {
            debug('update %s', name)
            data[name] = items
        }
    })
}

function runSpiders() {
    console.log('spider run')
    for (var k in spiders) {
        if (typeof spiders[k] == 'function') {
            runSpider(k, spiders[k])
        }
    }
}

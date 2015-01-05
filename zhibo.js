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

app.engine('jade', require('jade').__express).set('views', __dirname + '/views')

app
    .use(express.static(__dirname + '/static'))
    .use(express.static(__dirname + '/dist'))
    .use(route.get('/wechat/juzhibotv', wechat.authenticate))
    .use(route.post('/wechat/juzhibotv', wechat.reply))
    .use(route.get('/', function(req, res) {
        var website = req.query.site
        var locals = merge(null, website)
        res.render('index.jade', locals)
    }))
    .use(route.get('/:type', function(req, res) {
        var type = req.params.type
        var website = req.query.site
        var locals = merge(type, website)
        res.render('index.jade', locals)
    }))
    .listen(process.argv[2] || config.port)

var ALL_SITES = 'zhanqi douyu huomao huya six'.split(' ')
var SITES_CONF = {
    'zhanqi': {
        name: '战旗',
        link: 'http://www.zhanqi.tv'
    },
    'douyu': {
        name: '斗鱼',
        link: 'http://www.douyutv.com'
    },
    'huomao': {
        name: '火猫',
        link: 'http://www.huomaotv.com'
    },
    'huya': {
        name: '虎牙',
        link: 'http://www.huya.com'
    },
    'six': {
        name: '六间房',
        link: 'http://www.6.cn'
    }
}

var COL = 4 // 每行3个

var ALL_TYPES = '英雄联盟 DOTA2 炉石传说 看球 其他 秀场'.split(' ')

function merge(type, website) {
    var uniq = {}
    var websites
    if (website) {
        websites = [website]
    } else {
        websites = ALL_SITES
    }
    websites.forEach(function(website) {
        var arr = data[website]
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
    if (website) {
        ret.website = website
    } else {
        ret.website = null
    }
    ret.types = ALL_TYPES
    ret.websites = ALL_SITES
    ret.SITES_CONF = SITES_CONF
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

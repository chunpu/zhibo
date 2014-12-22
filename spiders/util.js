var url = require('url')
var debug = require('debug')('spider-util')

function util(obj) {
    obj.people = util.people(obj.people)
    obj.href = util.url(obj.baseurl, obj.href)
    obj.anchor = util.anchor(obj.anchor)
    obj._gameType = util.gameType(obj.gameType)
}

util.anchor = function(anchor) {
    anchor = (anchor + '').trim()
    /*
    TODO: do it in jade
    if (anchor.length > 10) {
        return anchor.substr(0, 7) + '...'
    }
    */
    return anchor
}

util.people = function(number) {
    number = number + ''
    if (number.indexOf('万') != -1) {
        number = parseFloat(number) * 10000
    }
    return ~~number
}

var match = {
    '英雄联盟': ['lol'],
    'DOTA2': [],
    '炉石传说': ['炉石'],
    '看球': ['卖萌日常'],
    '秀场': []
}

util.gameType = function(gameType) {
    var ret = '其他'
    if (typeof gameType != 'string') return ret
    gameType = gameType.toUpperCase()
    for (var k in match) {
        if (gameType == k) return k
        else {
            var arr = match[k] || []
            for (var i = 0, x; x = arr[i++];) {
                if (gameType.indexOf(x) != -1)
                    return k
            }
        }
    }
    return ret
}

util.url = function(base, path) {
    if (path && path.indexOf('http://') != -1) {
        return path
    }
    var base = url.parse(base)
    return url.format({
        protocol: base.protocol,
        host: base.host,
        pathname: path
    })
}

util.noop = function () {
    console.warn('cb is null')
}

module.exports = util

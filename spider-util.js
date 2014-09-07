var url = require('url')

function util(obj) {
    obj.people = util.people(obj.people)
    obj.href = util.url(obj.baseurl, obj.href)
    obj._gameType = util.gameType(obj.gameType)
}

util.people = function(number) {
    number = number + ''
    if (number.indexOf('万') != -1) {
        number = parseFloat(number) * 1000
    }
    return ~~number
}

var match = {
    '英雄联盟': ['lol'],
    'DOTA2': [],
    '炉石传说': ['炉石']
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
    var obj = url.parse(base)
    obj.pathname = path
    return url.format(obj)
}

module.exports = util

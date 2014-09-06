var url = require('url')

exports.people = function(number) {
    number = number + ''
    if (number.indexOf('万') != -1) {
        number = parseFloat(number) * 1000
    }
    return ~~number
}

exports.url = function(base, path) {
    var obj = url.parse(base)
    obj.pathname = path
    return url.format(obj)
}

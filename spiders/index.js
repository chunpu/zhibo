//
// All spilder should response a array of zhibo item detail,
// each item is a object like:
//   href: '/xxx/xxx',
// , img: 'http://xxx.xx.png'
// , title: 'xxx'
// , anchor: 'xxx'
// , people: '4343'
// , gameType: 'DOTA2' ...
// , baseurl: 'http://www.douyu.tv/'
// , platform: '斗鱼'
//

exports.douyu = require('./douyu')
exports.zhanqi = require('./zhanqi')
exports.huomao = require('./huomao')
exports.huya = require('./huya')

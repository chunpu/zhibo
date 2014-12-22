
var ballList = [
    // douyu
    // dota2
    'waterate',
    '念念Misa',
    '攸小雪',
    '梦Evilcurse',
    'liangbinge',
    'H22222i',
    // LoL
    '小兔子LOL',
    '是深海魚嗎',
    'Cajin西法',
    'Aoman',
    '琪妹0',
    '澳服王者卖萌九',
    '迷糊小樱桃',
    '懒羊Miracle',
    '励志做名躺赢王i',
    '316690201',
    '嘟嘟嘟丶嘟嘟嘟',
    '竹子姐姐',
    '小阿甄',
    '琴喵不吃鱼',
    '1440499099',
    '甜心琳',
    //lushi
    '萌太奇5238',
    'vokijing',
    '阿囍mm',
    'Queenie0531',
    'scntv_mini',

    // zhanqi
    // dota2
    'lilith♥',
    '不太会说话的Nova',
    // LOL
    '贪吃的小ani',
    '苏格y',
    '小凄',
    '小汉子雯雯ˆˆ',
    'N3tv_24小时直播',
    '小盈月',

    // huomao
    // dota2
    'yanghanna',
    '小麻老师',
    '星摩小情绪',
    // LOL
    '小夏夏',
    '小苏打',
    // lushi
    '星摩小蚂蚁',
    'Kara',
    // others
    'AC14小鹿',
    '小汐'

    // TODO complete ..
]

var ballMap = {}
ballList.forEach(function (x) {
    ballMap[x] = true
})

exports.isBall = function (item) {
    return item && ballMap[item.anchor]
}


// TODO(yutingzhao): suport other tyoe message

function decodeRequest(data){
    var result = {}
    try{
        result.msgType = data.match(/<MsgType><\!\[CDATA\[(\S+)\]\]><\/MsgType>/)[1]
        result.toUser = data.match(/<ToUserName><\!\[CDATA\[(\S+)\]\]><\/ToUserName>/)[1]
        result.fromUser = data.match(/<FromUserName><\!\[CDATA\[(\S+)\]\]><\/FromUserName>/)[1]
        result.content = data.match(/<Content><\!\[CDATA\[(\S+)\]\]><\/Content>/)[1]
    } catch (e) {
        console.log(e)
    }
    return result
}

exports.decodeRequest = decodeRequest
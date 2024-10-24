//game-server.js
const net = require('net')

function generateRandomNum(min, max) {
    min = Math.ceil(min);
    max = Math.floor(max);
    while (true) {
        answerNum = Math.floor(Math.random() * (max - min + 1) + min);
        if (answerNum !== undefined) {
            break;
        }
    }
    return answerNum;
}
console.log('Ждём клиента...')
net.createServer(connection => {
    console.log('Готов к игре!')
    let min, max, answerNum

    connection.on('data', data => {
        const message = JSON.parse(data)
        if(message.range) {
            console.log(message)
            let minmaxArr = message.range.split('-')
            min = minmaxArr[0]
            max = minmaxArr[1]
            answerNum = generateRandomNum(min, max)
            connection.write(JSON.stringify({answer:`${answerNum}`}))
        } else switch(message.hint) {
            case 'more': {
                console.log(message)
                answerNum = answerNum + 1
                connection.write(JSON.stringify({answer:`${answerNum}`}))
                break
            }
            case 'less': {
                console.log(message)
                answerNum = answerNum - 1
                connection.write(JSON.stringify({answer:`${answerNum}`}))
                break
            }
        }
    })

    connection.on('close', () => {
        console.log('Клиент отвалился')
    })
}).listen(3000)
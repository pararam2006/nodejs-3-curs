// game-client.js
const net = require('net');
const minStart = process.argv[2];
const maxStart = process.argv[3];
let requiredNum

if (!maxStart || !minStart) {
    throw new Error('Не указан интервал чисел!');
} else if (maxStart <= minStart) {
    throw new Error('Максимальное число должно быть больше минимального!');
}

function generateRandomNumStart(minStart, maxStart) {
    minStart = Math.ceil(minStart);
    maxStart = Math.floor(maxStart);
    while (true) {
        requiredNum = Math.floor(Math.random() * (maxStart - minStart + 1) + minStart);
        if (requiredNum !== undefined) {
            break;
        }
    }
    return requiredNum;
}

generateRandomNumStart(minStart, maxStart)
console.log(`Загаданное клиентом число - ${requiredNum}`)

const client = net.connect({ port: 3000 });

client.write(JSON.stringify({range:`${minStart}-${maxStart}`}))

client.on('data', data => {
    const message = JSON.parse(data);
    let answer = parseInt(message.answer)
    console.log(`Ответ сервера: ${answer}`)
        if(answer == requiredNum) {
            console.log(`Сервер угадал число ${requiredNum}. Игра окончена!`)
            client.end()
        } else if(parseInt(answer < requiredNum)) {
                console.log(`${message.answer} меньше загаданного. Отправка hint: 'more' `)
                client.write(JSON.stringify({hint: 'more'}))
        } else if(answer > requiredNum) {
            console.log(`${message.answer} больше загаданного. Отправка hint: 'less' `)
            client.write(JSON.stringify({hint: 'less'}))
        }
 
});
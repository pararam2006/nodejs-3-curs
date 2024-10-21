const net = require('net')
client = net.connect({port: 60000})

client.on('data', data => {
    const message = JSON.parse(data)
    switch(message.type){
        case 'watching': {
            console.log(`Наблюдаем за файлом ${message.file}`)
            break
        } 
        case 'changed': {
            let date = new Date(message.timestamp)
            console.log(`Файл изменен: ${date}`)
            break
        }
        default: {
            console.log(`Неизвестное сообщение: ${message.type}`)
        }
    }
        
})
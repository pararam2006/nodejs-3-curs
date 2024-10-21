const net = require('net')
const fs = require('fs')
const filename = process.argv[2]

if(!filename) throw Error("Укажите имя файла!")

net.createServer(cnn => {
    console.log('Клиент присоединился')

    cnn.write(JSON.stringify({type: "watching", file: filename}) + '\n') 

    const watcher = fs.watchFile(filename, () => {
        let json = JSON.stringify({type: "changed", timestamp: Date.now()}) + '\n'
        cnn.write(json)
    })

    cnn.on('close', () => {
        console.log('Клиент отвалился')
        fs.unwatchFile(filename)
    })

}).listen(60000, () => { console.log('Сервер слушает...') })

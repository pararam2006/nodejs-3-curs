const net = require("net")

const server = net.createServer(cnn => {
});

server.listen(60000)
console.log('Сервер слушает')

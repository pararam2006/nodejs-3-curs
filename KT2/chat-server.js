const express = require('express');
const app = express();
const io = require('socket.io')(app.listen(3000))

// Настройка статической директории
app.use(express.static(__dirname));

app.get('/', (req, res) => {
    res.sendFile(`${__dirname}/index.html`);
});

let users = [];

io.on('connection', (socket) => {
    console.log('Пользователь подключён');

    // Отправить приветственное сообщение новому участнику
    socket.emit('welcome', { message: 'Добро пожаловать в чат!' });

    // Сообщение о присоединении нового участника другим пользователям
    socket.broadcast.emit('newUserJoined', { user: 'Новый участник' });

    // Прием сообщения от клиента
    socket.on('sendMessage', (data) => {
        // Распространяем сообщение всем подключенным клиентам
        io.emit('receiveMessage', { user: data.user, message: data.message, color: data.color });
    });

    // Регистрация имени пользователя
    socket.on('registerName', (data) => {
        if (!users.some(u => u.name === data.name)) {
            users.push({ name: data.name, color: data.color, socketId: socket.id });
            socket.username = data.name;
            socket.color = data.color;
            socket.emit('registered', { message: `Вы зарегистрированы под именем ${data.name}.` });
            socket.broadcast.emit('userRegistered', { user: data.name });

            // Отправляем список текущих пользователей
            if (users.length === 1) {
                socket.emit('currentUsers', { users: [], message: 'Вы первый в чате.' });
            } else {
                const otherUsers = users.map(u => ({ name: u.name, color: u.color })).filter(u => u.name !== data.name);
                socket.emit('currentUsers', { users: otherUsers, message: `Добро пожаловать. В чате уже присутствуют: ${otherUsers.map(u => u.name).join(', ')}.` });
            }

            // Обновление списка участников для всех клиентов
            io.emit('updateOnlineList', { users: users.map(u => ({ name: u.name, color: u.color })) });
        } else {
            socket.emit('error', { message: 'Это имя уже занято.' });
        }
    });

    // Отправка личного сообщения
    socket.on('privateMessage', (data) => {
        const recipient = users.find(u => u.name === data.recipient);
        if (recipient && recipient.socketId) {
            io.to(recipient.socketId).emit('receivePrivateMessage', { sender: socket.username, message: data.message });
        } else {
            socket.emit('error', { message: `Пользователь ${data.recipient} не найден.` });
        }
    });

    // Отсоединение пользователя
    socket.on('disconnect', () => {
        if (socket.username) {
            let index = users.findIndex(u => u.name === socket.username);
            if (index !== -1) {
                users.splice(index, 1);
            }
            socket.broadcast.emit('userLeft', { user: socket.username });

            // Обновление списка участников для всех клиентов
            io.emit('updateOnlineList', { users: users.map(u => ({ name: u.name, color: u.color })) });
        }
    });
});
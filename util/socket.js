const chalk = require('chalk');
let io;
let chatUsers = [];

module.exports = {
    init: httpServer => {
        io = require('socket.io')(httpServer);
        io.on('connection', (socket) => {
            socket.on('join_chat', (id) => {
                chatUsers.push(id);
                console.log(chalk.green(`user ${id} came online`));
                socket.join(id);
            });
            socket.on('leave_chat', (id) => {
                console.log(chalk.red(`user ${id} went offline`));
                socket.leave(id);
                if (chatUsers.indexOf(id) !== -1) {
                    const i = chatUsers.indexOf(id);
                    chatUsers.slice(i, 1);
                }
            });
        });
    },
    getIO: () => {
        if (!io) {
            throw new Error('Socket.io not initialized');
        }
        return io;
    }
}
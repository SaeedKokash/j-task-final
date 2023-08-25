const socket = require('../socket');
const socketState = require('../socketState');
const logger = require('./logger');

const notify = (userId, message) => {
    // console.log(`Attempting to send notification to user with ID ${userId}: ${message}`);
    const io = socket.getIo();
    const userSocketId = socketState.getSocketId(userId);

    if (userSocketId) {
        io.to(userSocketId).emit('notification', message);
        logger.info(`Notification: ${message}`);
    } else {
        console.log(`User with ID ${userId} is not connected. Notification not sent.`);
    }

};

module.exports = notify;
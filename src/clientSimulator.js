const ioClient = require('socket.io-client');
const socketState = require('./socketState');

const SERVER_URL = 'http://localhost:4000';

const simulateClientConnection = (userId) => {
    const socket = ioClient(SERVER_URL);

    socket.on('connect', () => {
        console.log(`Simulated user with ID ${socket.id} connected to the server.`);
        socketState.setSocketId(userId, socket.id); 
        socket.emit('setUserId', userId);
    });

    socket.on('notification', (message) => {
        console.log(`Received Notification: ${message}`);
    });

    socket.on('disconnect', () => {
        console.log(`User with ID ${socket.id} disconnected.`);
        socketState.removeSocketId(userId);
    });
};

module.exports = simulateClientConnection;


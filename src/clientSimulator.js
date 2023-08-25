// const express = require('express');
// const ioClient = require('socket.io-client');
// const socketState = require('./socketState');

// const router = express.Router();

// let socket;  // Declare socket variable
// let simulatedSocketId;  // Declare simulated socket ID variable

// router.get('/:userId', (req, res) => {
//     const { userId } = req.params;

//     // Initialize the socket connection when this route is hit
//     socket = ioClient('http://localhost:4000');

//     socket.on('connect', () => {
//         console.log(`Simulated user with ID ${socket.id} connected to the server.`);
//         socketState.setSocketId(socket.id);// Set the socket ID
//         socketState.setSocketUserId(userId);  // Set the user ID
//         socket.emit('setUserId', userId);
//     });

//     socket.on('notification', (message) => {
//         console.log('Received Notification:', message);
//     });

//     res.send(`Simulated user with ID ${userId} connected.`);
// });

// module.exports = router;


const ioClient = require('socket.io-client');
const socketState = require('./socketState');

const SERVER_URL = 'http://localhost:4000';

const simulateClientConnection = (userId) => {
    const socket = ioClient(SERVER_URL);

    socket.on('connect', () => {
        console.log(`Simulated user with ID ${socket.id} connected to the server.`);
        socketState.setSocketId(userId, socket.id);  // Store the socket ID with the user ID
        socket.emit('setUserId', userId);
    });

    socket.on('notification', (message) => {
        console.log(`Received Notification: ${message}`);
    });

    socket.on('disconnect', () => {
        console.log(`User with ID ${socket.id} disconnected.`);
        socketState.removeSocketId(userId);  // Remove the socket ID when the user disconnects
    });
};

module.exports = simulateClientConnection;


// const socket = require('../socket');
// const socketState = require('../socketState');

// const notify = (userId, message) => {
//   console.log(`Attempting to send notification to user with ID ${userId}: ${message}`);
//     const io = socket.getIo();
//     const simulatedSocketId = socketState.getSocketId();  // Get the socket ID
//     const simulatedSocketUserId = socketState.getSocketUserId();  // Get the user ID

//     // console.log('Simulated Socket ID:', simulatedSocketId);
//     // console.log('Simulated Socket User ID:', simulatedSocketUserId);
//     // console.log('User ID:', userId)

//     // console.log(typeof simulatedSocketId);
//     // console.log(typeof simulatedSocketUserId);
//     // console.log(typeof userId);

//     if (!simulatedSocketId) {
//         console.log('No simulated socket ID found. Skipping notification.');
//         return;
//     }

//     if (userId !== Number(simulatedSocketUserId)) {
//         console.log('User ID does not match simulated socket user ID. Skipping notification.');
//         return;
//     }

//     io.to(simulatedSocketId).emit('notification', message);
// };

// module.exports = notify;

const socket = require('../socket');
const socketState = require('../socketState');

const notify = (userId, message) => {
    // console.log(`Attempting to send notification to user with ID ${userId}: ${message}`);
    const io = socket.getIo();
    const userSocketId = socketState.getSocketId(userId);  // Get the socket ID for the user

    if (userSocketId) {
        io.to(userSocketId).emit('notification', message);
    } else {
        console.log(`User with ID ${userId} is not connected. Notification not sent.`);
    }
};

module.exports = notify;
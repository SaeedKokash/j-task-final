const io = require('../app').io;

const notify = (userId, message) => {
  console.log('Notifying user', userId, 'with message', message)
  // Emitting a notification event to the specific user socket
  io.to(userId).emit('notification', message);
};

module.exports = notify;

// const socket = require('../socket');

// const notify = (userId, message) => {
//   try {
//       const io = socket.getIo();
//       console.log(`Attempting to send notification to user with ID ${userId}: ${message}`);
//       io.sockets.in(userId).emit('notification', message);
//   } catch (error) {
//       console.error('Error sending notification:', error);
//   }
// };

// module.exports = notify;

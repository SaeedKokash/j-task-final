const socket = require('../socket');

const notify = (userId, message) => {
  const userIdString = userId.toString();
  
  console.log(`Attempting to send notification to user with ID ${userId}: ${message}`);
  const io = socket.getIo();

  console.log(io.sockets.adapter.rooms[userIdString])

  // if the userIdString is not equal to the room name, then return 
  if(userIdString !== io.sockets.adapter.rooms[userIdString]) {
    console.log('User ID does not match simulated socket user ID. Skipping notification.');
    return;
  }

  console.log(`Emitting to room: ${userId}`);
  io.to(userIdString).emit('notification', message);
};

module.exports = notify;

// let socketId = null;
// let socketUserId = null;

// module.exports.setSocketUserId = (id) => {
//     socketUserId = id;
// };

// module.exports.getSocketUserId = () => {
//     return socketUserId;
// };

// module.exports.setSocketId = (id) => {
//     socketId = id;
// };

// module.exports.getSocketId = () => {
//     return socketId;
// };


let socketMap = {};

module.exports.setSocketId = (userId, id) => {
    socketMap[userId] = id;
};

module.exports.getSocketId = (userId) => {
    return socketMap[userId];
};

module.exports.removeSocketId = (userId) => {
    delete socketMap[userId];
};



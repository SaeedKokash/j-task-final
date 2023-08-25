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



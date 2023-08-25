const logger = require('./logger');

const notify = (message) => {
  // Simulate sending a notification by logging the message
  logger.info(`Notification: ${message}`);
};

module.exports = notify;

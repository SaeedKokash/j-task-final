'use strict';

const express = require('express');
const dotenv = require('dotenv');

const http = require('http');

const socket = require('./socket');
// const clientSimulator = require('./clientSimulator');
const simulateClientConnection = require('./clientSimulator');

const { sequelize } = require('./models');

const errorHandler = require('./middleware/errorHandler');

const documentRoutes = require('./routes/documentRoutes');
const authRoutes = require('./routes/authRoutes');
const middlemanRoutes = require('./routes/middlemanRoutes');
const checkerRoutes = require('./routes/checkerRoutes');

dotenv.config();

const app = express();
const PORT = 4000;
const server = http.createServer(app);
socket.init(server);

app.use(express.json());

app.use('/api/documents', documentRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/middleman', middlemanRoutes);
app.use('/api/checker', checkerRoutes);
// app.use('/simulate', clientSimulator);
app.get('/simulate-connect/:userId', (req, res) => {
  const userId = req.params.userId;
  console.log(userId)
  simulateClientConnection(userId);
  res.send(`Simulated user with ID ${userId} connected to the server.`);
});

// Sample route
app.get('/', (req, res) => {
  res.send('Document Workflow API');
});

app.use(errorHandler);

const io = socket.getIo();
io.on('connection', (socket) => {
    console.log('A user connected:', socket.id);

    socket.on('setUserId', (userId) => {
        // userId is a string
        socket.join(userId);
        console.log(`User with socket ID ${socket.id} joined room with ID ${userId}`);
    });
});

// sequelize.sync({force: true})
sequelize.sync()
  .then(() => {
    server.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`);
    })
  })
  .catch(err => {
    console.error(err);
  }
);

module.exports = { io }



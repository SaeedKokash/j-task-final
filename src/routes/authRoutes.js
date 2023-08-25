const express = require('express');
const authController = require('../controllers/authController');
const basicAuth = require('../middleware/authMiddleware');

const router = express.Router();


router.get('/getAllUsers', authController.getAllUsers);
router.post('/register', basicAuth, authController.register);
router.post('/login', authController.login);

module.exports = router;

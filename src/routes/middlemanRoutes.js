const express = require('express');
const middlemanController = require('../controllers/middlemanController');

const router = express.Router();

router.post('/forward', middlemanController.forwardToChecker);
router.post('/send-back', middlemanController.sendBackToMaker);

module.exports = router;

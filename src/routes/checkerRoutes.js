const express = require('express');
const checkerController = require('../controllers/checkerController');

const router = express.Router();

router.post('/accept', checkerController.acceptDocument);
router.post('/reject', checkerController.rejectDocument);

module.exports = router;

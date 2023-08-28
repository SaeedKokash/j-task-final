'use strict';

const express = require('express');
const documentController = require('../controllers/documentController');
const verifyToken = require('../middleware/verifyToken');

const router = express.Router();

router.get('/', verifyToken.authenticate, documentController.getAll);

router.post('/', verifyToken.authenticate, documentController.create);
router.get('/:id', verifyToken.authenticate, documentController.getById);
router.put('/:id', verifyToken.authenticate, documentController.modify);
router.delete('/:id', verifyToken.authenticate, documentController.delete);

router.post('/:id/deliver', verifyToken.authenticate, documentController.deliver);
router.post('/:id/accept', verifyToken.authenticate, documentController.accept);
router.post('/:id/reject', verifyToken.authenticate, documentController.reject);
router.post('/:id/modifyAccept', verifyToken.authenticate, documentController.modifyAccept);
router.post('/:id/modifyReject', verifyToken.authenticate, documentController.modifyReject);
router.post('/:id/requestModify', verifyToken.authenticate, documentController.requestModify);

module.exports = router;

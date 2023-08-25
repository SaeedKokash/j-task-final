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

// POST /document: For the maker to create a new document.
// GET /document/:id: To retrieve a document's information.
// PUT /document/:id: To modify a document.
// DELETE /document/:id: To delete a document.
// POST /document/:id/deliver: To deliver a document to the maker.
// POST /document/:id/accept: To handle acceptance of the document.
// POST /document/:id/reject: To handle rejection of the document.
// POST /document/:id/modify: To handle modification requests.

module.exports = router;

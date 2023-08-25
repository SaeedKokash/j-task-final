const Document = require('../models/document');
const asyncHandler = require('../utils/asyncHandler');

exports.acceptDocument = asyncHandler(async (req, res) => {
  const { documentId } = req.body;
  const document = await Document.findByPk(documentId);

  if (!document) {
    return res.status(404).json({ error: 'Document not found' });
  }

  document.status = 'accepted';
  await document.save();

  // Notify the maker about the acceptance
  notify(`Document accepted by checker.`);

  res.json({ message: 'Document accepted' });
});

exports.rejectDocument = asyncHandler(async (req, res) => {
  const { documentId, reason } = req.body;
  const document = await Document.findByPk(documentId);

  if (!document) {
    return res.status(404).json({ error: 'Document not found' });
  }

  document.status = 'rejected';
  await document.save();

  // Notify the maker about the rejection
  notify(`Document rejected by checker. Reason: ${reason}`);

  res.json({ message: 'Document rejected', reason });
});

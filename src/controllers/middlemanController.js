const Document = require('../models/document');
const asyncHandler = require('../utils/asyncHandler');

exports.forwardToChecker = asyncHandler(async (req, res) => {
  const { documentId } = req.body;
  const document = await Document.findByPk(documentId);

  if (!document) {
    return res.status(404).json({ error: 'Document not found' });
  }

  document.status = 'delivered';
  await document.save();

  // Notify the checker about the new document
  notify(`Document forwarded by middleman. Awaiting validation by checker.`);
  

  res.json({ message: 'Document forwarded to checker' });
});

exports.sendBackToMaker = asyncHandler(async (req, res) => {
  const { documentId, feedback } = req.body;
  const document = await Document.findByPk(documentId);

  if (!document) {
    return res.status(404).json({ error: 'Document not found' });
  }

  document.status = 'revised';
  await document.save();

  // Notify the maker about the feedback
  notify(`Document sent back by middleman for revisions. Feedback: ${feedback}`);
  

  res.json({ message: 'Document sent back to maker for revisions', feedback });
});

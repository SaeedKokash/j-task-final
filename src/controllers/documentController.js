'use strict';

const Document = require('../models/document');
const User = require('../models/user');

const asyncHandler = require('../utils/asyncHandler');
const notify = require('../utils/notifications');

exports.getById = asyncHandler(async (req, res) => {
  const user = await User.findByPk(req.userId);

  if (user.role !== 'maker' && user.role !== 'checker') {
    return res.status(403).json({ error: 'Only makers or checkers can get this document' });
  }

  const id = parseInt(req.params.id, 10);
  const document = await Document.findByPk(id);
  if (!document) {
    return res.status(404).json({ error: 'Document not found' });
  }
  res.status(200).json({ document });
});

exports.getAll = asyncHandler(async (req, res) => {
  const user = await User.findByPk(req.userId);

  if (user.role !== 'maker' && user.role !== 'checker') {
    return res.status(403).json({ error: 'Only makers or checkers can get all documents' });
  }
  const documents = await Document.findAll();
  res.status(200).json({ documents });
}
);

exports.delete = asyncHandler(async (req, res) => {

  const id = parseInt(req.params.id, 10);
  const user = await User.findByPk(req.userId);

  if (user.role !== 'maker' && user.role !== 'checker') {
    return res.status(403).json({ error: 'Only makers or checkers can delete documents' });
  }

  const document = await Document.findByPk(id);
  if (!document) {
    return res.status(404).json({ error: 'Document not found' });
  }

  const middlemanId = document.middlemanId;
  const checkerId = document.checkerId;

  if (document.latestUser === user.role && document.status === (`delivered to ${user.role === 'maker' ? 'checker' : 'maker'}`)) {
    return res.status(403).json({ error: 'You cannot delete the document if it is delivered to the other user' });
  }

  await document.destroy();

  notify(middlemanId, `Document with ID ${document.id} has been deleted by ${user.role}.`);
  notify(checkerId, `Document with ID ${document.id} has been deleted by ${user.role}.`);

  res.status(200).json({ message: 'Document deleted successfully' });
}
);

exports.create = asyncHandler(async (req, res, next) => {
  const data = { ...req.body, makerId: req.userId, latestUser: 'maker', isMakerApproved: true, status: 'request to create' };
  const user = await User.findByPk(req.userId);
  
  if(!user) {
    return res.status(404).json({ error: 'User not found' });
  }

  if (!data.monetary_value || !data.title || !data.description || !data.middlemanId || !data.checkerId) {
    return res.status(400).json({ error: 'Please provide all required fields' });
  }

  const middleman = await User.findByPk(data.middlemanId);
  const checker = await User.findByPk(data.checkerId);

  if (user.role !== 'maker') {
    return res.status(403).json({ error: 'Only makers can create documents' });
  }

  const document = await Document.create(data);

  notify(middleman.id, "New document created. Awaiting validation by middleman.");
  notify(checker.id, "New document created. Awaiting validation by middleman.");

  res.status(201).json({ document });
});

exports.modify = asyncHandler(async (req, res) => {

    const id = parseInt(req.params.id, 10);
    const data = req.body;
    const user = await User.findByPk(req.userId);

  if (user.role !== 'maker' && user.role !== 'checker') {
    return res.status(403).json({ error: 'Only makers or checkers can modify documents' });
  }

  const document = await Document.findByPk(id);
  if (!document) {
    return res.status(404).json({ error: 'Document not found' });
  }

  // 1. maker modifies
  if ((document.status === 'delivered to maker') && user.role === 'maker') {
    document.status = 'modification requested by maker';
    document.latestUser = 'maker';
    document.isMakerApproved = true;
    await document.update({ 
      status: 'modification requested by maker',
      latestUser: 'maker',
      isMakerApproved: true,
      monetary_value: data.monetary_value,
      title: data.title,
      description: data.description
    });
    notify(document.middlemanId, `Document with ID ${document.id} has been modified by ${user.role} and ready to be reviewed.`);
    notify(document.checkerId, `Document with ID ${document.id} has been modified by ${user.role}. Awaiting validation by middleman.`);
  }

  // 2. checker modifies
  else if (document.status === 'delivered to checker' && user.role === 'checker') {
    document.status = 'modification requested by checker';
    document.latestUser = 'checker';
    document.isCheckerApproved = true;
    await document.update({ 
      status: 'modification requested by checker',
      latestUser: 'checker',
      isCheckerApproved: true,
      monetary_value: data.monetary_value,
      title: data.title,
      description: data.description
    });
    notify(document.middlemanId, `Document with ID ${document.id} has been modified by ${user.role} and ready to be reviewed.`); 
    notify(document.makerId, `Document with ID ${document.id} has been modified by ${user.role}. Awaiting validation by middleman.`);
  }

  else {
    return res.status(403).json({ error: 'It is not your turn, waiting for document to be ready for modification' });
  }

  res.status(200).json({ document });
}
);



exports.deliver = asyncHandler(async (req, res) => {

  const id = parseInt(req.params.id, 10);
  const user = await User.findByPk(req.userId);

  if (user.role !== 'middleman') {
    return res.status(403).json({ error: 'Only middleman can deliver documents' });
  }

  const document = await Document.findByPk(id);
  if (!document) {
    return res.status(404).json({ error: 'Document not found' });
  }

  // when all users approve the document, it is completed
  if(document.isCheckerApproved === true && document.isMakerApproved === true && document.isMiddlemanApproved === true) {
    console.log('7')
    await document.update({ status: 'completed' });
    notify(document.makerId, `Document with ID ${document.id} has been completed.`);
    notify(document.checkerId, `Document with ID ${document.id} has been completed.`);
  }

  // 1. middleman delivers to checker after acceptance
  else if ((document.status === 'accepted by middleman' || document.status === 'modification accepted by middleman' || document.status === 'accepted by maker') && document.latestUser === 'maker') {
    console.log('1')
    await document.update({ status: 'delivered to checker' });
    notify(document.makerId, `Document with ID ${document.id} has been delivered to the checker by ${user.role} for validation.`);
    notify(document.checkerId, `Document with ID ${document.id} has been delivered by ${user.role} for validation.`);
  }

  // 2. middleman delivers to checker after rejection 
  else if ((document.status === 'rejected by middleman' || document.status === 'modification rejected by middleman' || document.status === 'rejected by maker') && document.latestUser === 'maker') {
    console.log('2')
    await document.update({ status: 'delivered to checker' });
    notify(document.makerId, `Document with ID ${document.id} has been delivered to the checker by ${user.role} for modification.`);
    notify(document.checkerId, `Document with ID ${document.id} has been delivered by ${user.role} for modification.`);
  }

  // 3. middleman delivers to maker after acceptance
  else if ((document.status === 'accepted by middleman' || document.status === 'modification accepted by middleman' || document.status === 'accepted by checker') && document.latestUser === 'checker') {
    console.log('3')
    await document.update({ status: 'delivered to maker' });
    notify(document.checkerId, `Document with ID ${document.id} has been delivered to the maker by ${user.role} for validation.`);
    notify(document.makerId, `Document with ID ${document.id} has been delivered by ${user.role} for validation.`);
  }

  // 4. middleman delivers to maker after rejection
  else if ((document.status === 'rejected by middleman' || document.status === 'modification rejected by middleman' || document.status === 'rejected by checker') && document.latestUser === 'checker') {
    console.log('4')
    await document.update({ status: 'delivered to maker' });
    notify(document.checkerId, `Document with ID ${document.id} has been delivered to the maker by ${user.role} for modification.`);
    notify(document.makerId, `Document with ID ${document.id} has been delivered by ${user.role} for modification.`);
  }

  // 5. specialcase 1. middleman delivers to maker after rejection by maker
  else if (document.status === 'modification from maker rejected by middleman' && document.latestUser === 'middleman') {
    console.log('5')
    await document.update({ status: 'delivered to maker', latestUser: 'maker' });
    notify(document.checkerId, `Document with ID ${document.id} has been delivered to the maker by ${user.role} for modification.`);
    notify(document.makerId, `Document with ID ${document.id} has been delivered by ${user.role} for modification.`);
  }

  // 6. specialcase 2. middleman delivers to checker after rejection by checker
  else if (document.status === 'modification from checker rejected by middleman' && document.latestUser === 'middleman') {
    console.log('6')
    await document.update({ status: 'delivered to checker', latestUser: 'checker' });
    notify(document.makerId, `Document with ID ${document.id} has been delivered to the checker by ${user.role} for modification.`);
    notify(document.checkerId, `Document with ID ${document.id} has been delivered by ${user.role} for modification.`);
  }

  else {
    return res.status(403).json({ error: 'It is not your turn, waiting for document to be ready for deliver' });
  }

  res.status(200).json({ document });
}
);

exports.accept = asyncHandler(async (req, res) => {

  const id = parseInt(req.params.id, 10);
  const user = await User.findByPk(req.userId);
  const document = await Document.findByPk(id);
  if (!document) {
    return res.status(404).json({ error: 'Document not found' });
  }

  if (user.role === document.latestUser) {
    return res.status(403).json({ error: 'You cannot accept your own document' });
  }

  // 1. middleman accepts
  if (document.status === 'request to create' && user.role === 'middleman') {
    await document.update({ status: 'accepted by middleman', isMiddlemanApproved: true });
    notify(document.makerId, `Document with ID ${document.id} has been accepted by ${user.role}. Awaiting validation by checker.`);
    notify(document.checkerId, `Document with ID ${document.id} has been accepted by ${user.role}.`);
  }

  // 2. checker accepts
  else if (document.status === 'delivered to checker' && user.role === 'checker') {
    await document.update({ status: 'accepted by checker', latestUser: 'checker', isCheckerApproved: true });
    notify(document.makerId, `Document with ID ${document.id} has been accepted by ${user.role}.`);
    notify(document.middlemanId, `Document with ID ${document.id} has been accepted by ${user.role}.`);
  }

   // 3. maker accepts
   else if (document.status === 'delivered to maker' && user.role === 'maker') {
    await document.update({ status: 'accepted by maker', latestUser: 'maker', isCheckerApproved: true });
    notify(document.checkerId, `Document with ID ${document.id} has been accepted by ${user.role}.`);
    notify(document.middlemanId, `Document with ID ${document.id} has been accepted by ${user.role}.`);
  }

  else {
    return res.status(403).json({ error: 'It is not your turn, waiting for document to be ready for acceptance' });
  }

  res.status(200).json({ document });
}
);

exports.reject = asyncHandler(async (req, res) => {

  const id = parseInt(req.params.id, 10);
  const user = await User.findByPk(req.userId);
  const document = await Document.findByPk(id);
  if (!document) {
    return res.status(404).json({ error: 'Document not found' });
  }

  if (user.role === document.latestUser) {
    return res.status(403).json({ error: 'You cannot reject your own document' });
  }

  // 1. middleman rejects
  if (document.status === 'request to create' && user.role === 'middleman') {
    await document.update({ status: 'rejected by middleman', isMiddlemanApproved: false });
    notify(document.makerId, `Document with ID ${document.id} has been rejected by ${user.role} for a reason and returned to be modified.`);
    notify(document.checkerId, `Document with ID ${document.id} has been rejected by ${user.role} for a reason and returned to maker to be modified.`);
  }

  // 2. checker rejects
  else if (document.status === 'delivered to checker' && user.role === 'checker') {
    await document.update({ status: 'rejected by checker', latestUser: 'checker', isCheckerApproved: false });
    notify(document.makerId, `Document with ID ${document.id} has been rejected by ${user.role} for a reason and returned to be modified.`);
    notify(document.middlemanId, `Document with ID ${document.id} has been rejected by ${user.role} for a reason and returned to maker to be modified.`);
  }

  // 3. maker rejects
  else if (document.status === 'adelivered to maker' && user.role === 'maker') {
    await document.update({ status: 'rejected by maker', latestUser: 'maker', isCheckerApproved: false });
    notify(document.checkerId, `Document with ID ${document.id} has been rejected by ${user.role} for a reason and returned to be modified.`);
    notify(document.middlemanId, `Document with ID ${document.id} has been rejected by ${user.role} for a reason and returned to checker to be modified.`);
  }

  else {
    return res.status(403).json({ error: 'It is not your turn, waiting for document to be ready for rejection' });
  }

  res.status(200).json({ document });
}
);

exports.modifyAccept = asyncHandler(async (req, res) => {

  const id = parseInt(req.params.id, 10);
  const user = await User.findByPk(req.userId);

  const document = await Document.findByPk(id);
  if (!document) {
    return res.status(404).json({ error: 'Document not found' });
  }

  if (user.role === document.latestUser) {
    return res.status(403).json({ error: 'You cannot accept your own modifications' });
  }

  // 1. middleman accepts modifications
  if((document.status === 'modification requested by maker' || document.status === 'modification requested by checker') && user.role === 'middleman') {
    await document.update({ status: 'modification accepted by middleman', isMiddlemanApproved: true });
    notify(document.makerId, `Modification of document with ID ${document.id} has been accepted by ${user.role}. Awaiting validation by checker.`);
    notify(document.checkerId, `Modification of document with ID ${document.id} has been accepted by ${user.role}. Awaiting to be delivered by middleman.`);
  }

  // 2. checker accepts modifications
  else if(document.status === 'delivered to checker' && user.role === 'checker') {
    await document.update({ status: 'modification accepted by checker', latestUser: 'checker', isCheckerApproved: true });
    notify(document.makerId, `Modification of document with ID ${document.id} has been accepted by ${user.role}. Awaiting validation by middleman.`);
    notify(document.middlemanId, `Modification of document with ID ${document.id} has been accepted by ${user.role}. Awaiting validation by middleman.`);
  }

  // 3. maker accepts modifications
  else if(document.status === 'delivered to maker' && user.role === 'maker') {
    await document.update({ status: 'modification accepted by maker', latestUser: 'maker', isMakerApproved: true });
    notify(document.checkerId, `Modification of document with ID ${document.id} has been accepted by ${user.role}. Awaiting validation by middleman.`);
    notify(document.middlemanId, `Modification of document with ID ${document.id} has been accepted by ${user.role}. Awaiting validation by middleman.`);
  }

  else {
    return res.status(403).json({ error: 'It is not your turn, waiting for document to be ready for modification acceptance' });
  }

  res.status(200).json({ document });
}
);

exports.modifyReject = asyncHandler(async (req, res) => { 

  const id = parseInt(req.params.id, 10);
  const user = await User.findByPk(req.userId);

  const document = await Document.findByPk(id);
  if (!document) {
    return res.status(404).json({ error: 'Document not found' });
  }

  if (user.role === document.latestUser) {
    return res.status(403).json({ error: 'You cannot reject your own modifications' });
  }

  // 1. middleman rejects modifications
  if(document.status === 'modification requested by maker' && user.role === 'middleman') {
    await document.update({ status: 'modification from maker rejected by middleman', isMiddlemanApproved: false, latestUser: 'middleman' });
    notify(document.makerId, `Modification of document with ID ${document.id} has been rejected by ${user.role} for a reason and returned to be modified.`);
    notify(document.checkerId, `Modification of document with ID ${document.id} has been rejected by ${user.role} for a reason and returned to maker to be modified.`);
  } 

  else if (document.status === 'modification requested by checker' && user.role === 'middleman') {
    await document.update({ status: 'modification from checker rejected by middleman', isMiddlemanApproved: false, latestUser: 'middleman' });
    notify(document.makerId, `Modification of document with ID ${document.id} has been rejected by ${user.role} for a reason and returned to checker to be modified.`);
    notify(document.checkerId, `Modification of document with ID ${document.id} has been rejected by ${user.role} for a reason and returned to be modified.`);
  } 

  // 2. checker rejects modifications
  else if(document.status === 'delivered to checker' && user.role === 'checker') {
    await document.update({ status: 'modification rejected by checker', latestUser: 'checker', isMakerApproved: false });
    notify(document.makerId, `Modification of document with ID ${document.id} has been rejected by ${user.role} for a reason and returned to be modified.`);
    notify(document.middlemanId, `Modification of document with ID ${document.id} has been rejected by ${user.role} for a reason and returned to maker to be modified.`);
  }

   // 3. maker rejects modifications
  else if(document.status === 'delivered to maker' && user.role === 'maker') {
    await document.update({ status: 'modification rejected by maker', latestUser: 'maker', isMakerApproved: false });
    notify(document.checkerId, `Modification of document with ID ${document.id} has been rejected by ${user.role} for a reason and returned to be modified.`);
    notify(document.middlemanId, `Modification of document with ID ${document.id} has been rejected by ${user.role} for a reason and returned to checker to be modified.`);
  } 
  
  else {
    return res.status(403).json({ error: 'It is not your turn, waiting for document to be ready for modification rejection' });
  }

  res.status(200).json({ document });
}
);

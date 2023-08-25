// 'use strict';

// const Document = require('../models/document');
// const User = require('../models/user');

// const asyncHandler = require('../utils/asyncHandler');
// const notify = require('../utils/notifications');

// exports.getById = asyncHandler(async (req, res) => {
//   const user = await User.findByPk(req.userId);

//   if (user.role !== 'maker' && user.role !== 'checker') {
//     return res.status(403).json({ error: 'Only makers or checkers can get this document' });
//   }

//   const id = parseInt(req.params.id, 10);
//   const document = await Document.findByPk(id);
//   if (!document) {
//     return res.status(404).json({ error: 'Document not found' });
//   }
//   res.status(200).json({ document });
// });

// exports.getAll = asyncHandler(async (req, res) => {
//   const user = await User.findByPk(req.userId);

//   if (user.role !== 'maker' && user.role !== 'checker') {
//     return res.status(403).json({ error: 'Only makers or checkers can get all documents' });
//   }
//   const documents = await Document.findAll();
//   res.status(200).json({ documents });
// }
// );

// exports.delete = asyncHandler(async (req, res) => {

//   const id = parseInt(req.params.id, 10);
//   const user = await User.findByPk(req.userId);

//   if (user.role !== 'maker' && user.role !== 'checker') {
//     return res.status(403).json({ error: 'Only makers or checkers can update documents' });
//   }

//   const document = await Document.findByPk(id);
//   if (!document) {
//     return res.status(404).json({ error: 'Document not found' });
//   }

//   notify(document.middlemanId, `Document with ID ${document.id} has been deleted by ${user.role}.`);
//   notify(document.checkerId, `Document with ID ${document.id} has been deleted by ${user.role}.`);
  
//   await document.destroy();

//   res.status(200).json({ message: 'Document deleted successfully' });
// }
// );

// exports.create = asyncHandler(async (req, res) => {
//   const data = { ...req.body, makerId: req.userId };
//   const user = await User.findByPk(req.userId);

//   const middleman = await User.findByPk(data.middlemanId);
//   const checker = await User.findByPk(data.checkerId);

//   if (user.role !== 'maker') {
//     return res.status(403).json({ error: 'Only makers can create documents' });
//   }

//   const document = await Document.create(data);

//   // Notify the middleman about the new document
//   notify(middleman.id, "New document created. Awaiting validation by middleman.");
//   notify(checker.id, "New document created. Awaiting validation by middleman.");

//   res.status(201).json({ document });
// });

// exports.modify = asyncHandler(async (req, res) => {

//   const id = parseInt(req.params.id, 10);
//   const data = req.body;
//   const user = await User.findByPk(req.userId);

//   if (user.role !== 'maker' && user.role !== 'checker') {
//     return res.status(403).json({ error: 'Only makers or checkers can modify documents' });
//   }

//   const document = await Document.findByPk(id);
//   if (!document) {
//     return res.status(404).json({ error: 'Document not found' });
//   }

//   // done
//   if (document.status === ('rejected by middleman and returned to maker' || 'modification rejected by middleman' || 'rejected by checker for a reason and returned to maker to be modified') && user.role === 'maker') {
//     document.status = 'modification requested by maker';
//     document.latestUser = 'maker';
//     document.isMakerApproved = true;
//     await document.update({ 
//       status: 'modification requested by maker',
//       latestUser: 'maker',
//       isMakerApproved: true,
//       monetary_value: data.monetary_value,
//       title: data.title,
//       description: data.description
//     });
//     notify(document.middlemanId, `Document with ID ${document.id} has been modified by ${user.role} and ready to be reviewed.`);
//     notify(document.checkerId, `Document with ID ${document.id} has been modified by ${user.role}. Awaiting validation by middleman.`);
//   }

//   // done
//   if (document.status === 'accepted by middleman and delivered to checker' && user.role === 'checker') {
//     document.status = 'modification requested by checker';
//     document.latestUser = 'checker';
//     document.isCheckerApproved = true;
//     await document.update({ 
//       status: 'modification requested by checker',
//       latestUser: 'checker',
//       isCheckerApproved: true,
//       monetary_value: data.monetary_value,
//       title: data.title,
//       description: data.description
//     });
//     notify(document.middlemanId, `Document with ID ${document.id} has been modified by ${user.role} and ready to be reviewed.`); 
//     notify(document.makerId, `Document with ID ${document.id} has been modified by ${user.role}. Awaiting validation by middleman.`);
//   }

//   res.status(200).json({ document });
// }
// );



// exports.deliver = asyncHandler(async (req, res) => {

//   const id = parseInt(req.params.id, 10);
//   const user = await User.findByPk(req.userId);

//   if (user.role !== 'middleman') {
//     return res.status(403).json({ error: 'Only middleman can deliver documents' });
//   }

//   const document = await Document.findByPk(id);
//   if (!document) {
//     return res.status(404).json({ error: 'Document not found' });
//   }

//   // done
//   if (document.status === ('request to create accepted by middleman' || 'modification accepted by middleman')) {
//     document.status = 'accepted by middleman and delivered to checker';
//     await document.update({ status: 'accepted by middleman and delivered to checker' });
//     notify(document.makerId, `Document with ID ${document.id} has been delivered to the checker by ${user.role} for validation.`);
//     notify(document.checkerId, `Document with ID ${document.id} has been delivered by ${user.role} for validation.`);
//   }

//   // done
//   if (document.status === 'request to create rejected by middleman') {
//     document.status = 'rejected by middleman and returned to maker';
//     await document.update({ status: 'rejected by middleman and returned to maker' });
//     notify(document.makerId, `Document with ID ${document.id} has been rejected by ${user.role} for a reason and returned to be modified.`);
//     notify(document.checkerId, `Document with ID ${document.id} has been rejected by ${user.role} for a reason and returned to maker to be modified.`);
//   }

//   // done
//   if ( document.status === 'approved by checker and ready to be returned to maker' ) {
//     document.status = 'document created and returned to maker';
//     document.latestUser = 'middleman';
//     await document.update({ status: 'document created and returned to maker', latestUser: 'middleman' });
//     notify(document.makerId, `Document with ID ${document.id} has been created and delivered by ${user.role}.`);
//     notify(document.checkerId, `Document with ID ${document.id} has been created and delivered by ${user.role} to the maker.`);
//   }

  

//   // done but do not need
//   // if (document.status === 'modification accepted by middleman') {
//   //   document.status = 'modification accepted by middleman and delivered to checker';
//   //   await document.update({ status: 'modification accepted by middleman and delivered to checker' });
//   //   notify(document.makerId, `Document with ID ${document.id} has been accepted by ${user.role} and delivered to checker.`);
//   //   notify(document.checkerId, `Document with ID ${document.id} has been accepted and delivered by ${user.role}.`);
//   // }

//   // done
//   if ( document.status === 'rejected by checker for a reason' ) {
//     document.status = 'rejected by checker for a reason and returned to maker to be modified';
//     document.latestUser = 'middleman';
//     document.isMiddlemanApproved = false;
//     await document.update({ status: 'rejected by checker for a reason and returned to maker to be modified', latestUser: 'middleman', isMiddlemanApproved: false });
//     notify(document.makerId, `Document with ID ${document.id} has been delivered by ${user.role} to be modified.`);
//     notify(document.checkerId, `Document with ID ${document.id} has been delivered to the maker by ${user.role} for modification.`);
//   }

//   if ( document.status === 'modification requested by maker' ) {
//     document.status = 'modification requested by maker and delivered to checker';
//     document.latestUser = 'middleman';
//     document.isMiddlemanApproved = true;
//     await document.update({ status: 'modification requested by maker and delivered to checker', latestUser: 'middleman', isMiddlemanApproved: true });
//     notify(document.makerId, `Document with ID ${document.id} has been delivered by ${user.role}. Awaiting validation by checker.`);
//     notify(document.checkerId, `Document with ID ${document.id} has been modified by maker, delivered by ${user.role} and ready to be reviewed.`);
//   }

//   if (document.status === 'modification accepted by checker' ) {
//     document.status = 'modification accepted by checker and middleman and delivered to maker';
//     document.latestUser = 'middleman';
//     document.isMiddlemanApproved = true;
//     await document.update({ status: 'modification accepted by checker and middleman and delivered to maker', latestUser: 'middleman', isMiddlemanApproved: true });
//     notify(document.makerId, `Modification of document with ID ${document.id} has been accepted and delivered by ${user.role}.`);
//     notify(document.checkerId, `Modification of document with ID ${document.id} has been accepted and delivered by ${user.role} to the maker.`);
//   }

//   // done
//   if (document.status === 'modification requested by checker' ) {
//     document.status = 'modification requested by checker and delivered to maker'; 
//     document.latestUser = 'middleman';
//     document.isMiddlemanApproved = true;
//     await document.update({ status: 'modification requested by checker and delivered to maker', latestUser: 'middleman', isMiddlemanApproved: true });
//     notify(document.makerId, `Modification of document with ID ${document.id} has been accepted and delivered by ${user.role}.`);
//     notify(document.checkerId, `Modification of document with ID ${document.id} has been accepted and delivered by ${user.role} to the maker.`);
//   }

//   // done
//   if (document.status === 'modification rejected by maker' ) {
//     document.status = 'modification rejected by maker and returned to checker';
//     document.latestUser = 'middleman';
//     document.isMiddlemanApproved = false;
//     await document.update({ status: 'modification rejected by maker and returned to checker', latestUser: 'middleman', isMiddlemanApproved: false });
//     notify(document.makerId, `Modification of document with ID ${document.id} has been rejected by ${user.role} for a reason and returned to be modified.`);
//     notify(document.checkerId, `Modification of document with ID ${document.id} has been rejected by ${user.role} for a reason and returned to maker to be modified.`);
//   }

//   res.status(200).json({ document });
// }
// );

// exports.accept = asyncHandler(async (req, res) => {

//   const id = parseInt(req.params.id, 10);
//   const user = await User.findByPk(req.userId);
//   const document = await Document.findByPk(id);
//   if (!document) {
//     return res.status(404).json({ error: 'Document not found' });
//   }

//   // done
//   if (document.status === 'request to create' && user.role === 'middleman') {
//     document.status = 'request to create accepted by middleman';
//     document.latestUser = 'middleman';
//     document.isMiddlemanApproved = true;
//     await document.update({ status: 'request to create accepted by middleman', latestUser: 'middleman', isMiddlemanApproved: true });
//     notify(document.makerId, `Document with ID ${document.id} has been accepted by ${user.role}. Awaiting validation by checker.`);
//     notify(document.checkerId, `Document with ID ${document.id} has been accepted by ${user.role}.`);
//   }

//   // done
//   if (document.status === 'accepted by middleman and delivered to checker' && user.role === 'checker') {
//     await document.update({ status: 'approved by checker and ready to be returned to maker', latestUser: 'checker', isCheckerApproved: true });
//     notify(document.makerId, `Document with ID ${document.id} has been accepted by ${user.role}.`);
//     notify(document.middlemanId, `Document with ID ${document.id} has been accepted by ${user.role}.`);
//   }

//   res.status(200).json({ document });
// }
// );

// exports.reject = asyncHandler(async (req, res) => {

//   const id = parseInt(req.params.id, 10);
//   const user = await User.findByPk(req.userId);
//   const document = await Document.findByPk(id);
//   if (!document) {
//     return res.status(404).json({ error: 'Document not found' });
//   }

//   // done
//   if (document.status === 'request to create' && user.role === 'middleman') {
//     document.status = 'request to create rejected by middleman';
//     document.latestUser = 'middleman';
//     document.isMiddlemanApproved = false;
//     await document.update({ status: 'request to create rejected by middleman', latestUser: 'middleman', isMiddlemanApproved: false });
//     notify(document.makerId, `Document with ID ${document.id} has been rejected by ${user.role} for a reason and returned to be modified.`);
//     notify(document.checkerId, `Document with ID ${document.id} has been rejected by ${user.role} for a reason and returned to maker to be modified.`);
//   }

//   // done
//   if (document.status === 'accepted by middleman and delivered to checker' && user.role === 'checker') {
//     await document.update({ status: 'rejected by checker for a reason', latestUser: 'checker', isCheckerApproved: false });
//     notify(document.makerId, `Document with ID ${document.id} has been rejected by ${user.role} for a reason and returned to be modified.`);
//     notify(document.middlemanId, `Document with ID ${document.id} has been rejected by ${user.role} for a reason and returned to maker to be modified.`);
//   }

//   res.status(200).json({ document });
// }
// );

// exports.modifyAccept = asyncHandler(async (req, res) => {

//   const id = parseInt(req.params.id, 10);
//   const user = await User.findByPk(req.userId);

//   const document = await Document.findByPk(id);
//   if (!document) {
//     return res.status(404).json({ error: 'Document not found' });
//   }

//   if (user.role === document.latestUser) {
//     return res.status(403).json({ error: 'You cannot accept your own modifications' });
//   }

//   // done
//   if(document.status === 'modification requested by maker' && user.role === 'middleman') {
//     await document.update({ status: 'modification accepted by middleman', latestUser: 'middleman', isMiddlemanApproved: true });
//     notify(document.makerId, `Modification of document with ID ${document.id} has been accepted by ${user.role}. Awaiting validation by checker.`);
//     notify(document.checkerId, `Modification of document with ID ${document.id} has been accepted by ${user.role}. Awaiting to be delivered by middleman.`);
//   }

//   if(document.status === 'modification requested by maker and delivered to checker' && user.role === 'checker') {
//     await document.update({ status: 'modification accepted by checker', latestUser: 'checker', isCheckerApproved: true });
//     notify(document.makerId, `Modification of document with ID ${document.id} has been accepted by ${user.role}. Awaiting validation by middleman.`);
//     notify(document.middlemanId, `Modification of document with ID ${document.id} has been accepted by ${user.role}. Awaiting validation by middleman.`);
//   }

//   // done
//   if(document.status === 'modification requested by checker and delivered to maker' && user.role === 'maker') {
//     await document.update({ status: 'modification accepted by maker', latestUser: 'maker', isMakerApproved: true });
//     notify(document.makerId, `Modification of document with ID ${document.id} has been accepted by ${user.role}. Awaiting validation by middleman.`);
//     notify(document.middlemanId, `Modification of document with ID ${document.id} has been accepted by ${user.role}. Awaiting validation by middleman.`);
//   }

//   res.status(200).json({ document });
// }
// );

// exports.modifyReject = asyncHandler(async (req, res) => { 

//   const id = parseInt(req.params.id, 10);
//   const user = await User.findByPk(req.userId);

//   if (user.role !== 'middleman' && user.role !== 'checker') {
//     return res.status(403).json({ error: 'Only middleman or checkers can reject modifications' });
//   }

//   const document = await Document.findByPk(id);
//   if (!document) {
//     return res.status(404).json({ error: 'Document not found' });
//   }

//   if(document.status !== 'pending review') {
//     return res.status(403).json({ error: 'Document is not pending review so it cannot be modified' });
//   }

//   if (user.role === document.latestUser) {
//     return res.status(403).json({ error: 'You cannot reject your own modifications' });
//   }

//   // done
//   if(document.status === 'modification requested by maker' && user.role === 'middleman') {
//     await document.update({ status: 'modification rejected by middleman', latestUser: 'middleman', isMiddlemanApproved: false });
//     notify(document.makerId, `Modification of document with ID ${document.id} has been rejected by ${user.role} for a reason and returned to be modified.`);
//     notify(document.checkerId, `Modification of document with ID ${document.id} has been rejected by ${user.role} for a reason and returned to maker to be modified.`);
//   }

//   // done
//    if(document.status === 'modification requested by checker and delivered to maker' && user.role === 'maker') {
//     await document.update({ status: 'modification rejected by maker', latestUser: 'maker', isMakerApproved: false });
//     notify(document.makerId, `Modification of document with ID ${document.id} has been rejected by ${user.role} for a reason and returned to be modified.`);
//     notify(document.middlemanId, `Modification of document with ID ${document.id} has been rejected by ${user.role} for a reason and returned to maker to be modified.`);
//   }

//   res.status(200).json({ document });
// }
// );

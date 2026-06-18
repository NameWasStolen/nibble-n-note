const express = require('express');
const groupController = require('../controllers/groupController.js');
const authMiddleware = require('../middleware/authMiddleware.js');

// Create router
const router = express.Router();

// Setting routes
// POST /api/groups
router.post('/', authMiddleware, groupController.createGroup);
// GET /api/groups
router.get('/', authMiddleware, groupController.getUserGroups);
// GET /api/groups/:id
router.get('/:id', authMiddleware, groupController.getGroupById);
// PATCH /api/groups/:id
router.patch('/:id', authMiddleware, groupController.updateGroup);
// DELETE /api/groups/:id
router.delete('/:id', authMiddleware, groupController.deleteGroup)
// POST /api/groups/:groupId/members
router.post('/:groupId/members', authMiddleware, groupController.addGroupMember);
// GET /api/groups/:groupId/members
router.get('/:groupId/members', authMiddleware, groupController.getGroupMembers);
// PATCH /api/groups/:groupId/members/:userId
router.patch('/:groupId/members/:userId', authMiddleware, groupController.updateGroupMemberRole);
// DELETE /api/groups/:groupId/members/:userId
router.delete('/:groupId/members/:userId', authMiddleware, groupController.deleteGroupMember);

module.exports = router;
const express = require('express');
const router = express.Router();

const { asyncHandler, authAdmin, authUser } = require('../auth/checkAuth');

const conversationController = require('../controller/conversation.controller');

router.post('/create', authUser, asyncHandler(conversationController.createConversation));
router.get('/get-conversation-by-user-id', authUser, asyncHandler(conversationController.getConversationByUserId));
router.get('/get-all-conversation', authAdmin, asyncHandler(conversationController.getAllConversation));
router.get(
    '/get-message-by-conversation-id/:conversationId',
    authUser,
    asyncHandler(conversationController.getMessageByConversationId),
);

module.exports = router;

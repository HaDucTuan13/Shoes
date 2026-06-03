const ConversationService = require('../services/conversation.service');

const { OK } = require('../core/success.response');

class ConversationController {
    async createConversation(req, res) {
        const { id } = req.user;

        const conversation = await ConversationService.createConversation(id);
        new OK({ message: 'success', metadata: conversation }).send(res);
    }

    async getConversationByUserId(req, res) {
        const { id } = req.user;
        const conversation = await ConversationService.getConversationByUserId(id);
        new OK({ message: 'success', metadata: conversation }).send(res);
    }

    async getAllConversation(req, res) {
        const conversations = await ConversationService.getAllConversation();
        new OK({ message: 'success', metadata: conversations }).send(res);
    }

    async getMessageByConversationId(req, res) {
        const { conversationId } = req.params;
        const messages = await ConversationService.getMessageByConversationId(conversationId);
        new OK({ message: 'success', metadata: messages }).send(res);
    }
}

module.exports = new ConversationController();

const { OK } = require('../core/success.response');

const MessageService = require('../services/message.service');

class MessageController {
    async createMessage(req, res) {
        const { id } = req.user;
        const { conversationId, content } = req.body;
        const message = await MessageService.createMessage(conversationId, id, content);
        res.json(message);
    }

    async updateMessageIsRead(req, res) {
        const { conversationId, sender } = req.body;
        const messages = await MessageService.updateMessageIsRead(conversationId, sender);
        new OK({ message: 'success', metadata: messages }).send(res);
    }
}

module.exports = new MessageController();

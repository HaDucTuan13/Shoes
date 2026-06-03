const Message = require('../models/message.model');
const Conversation = require('../models/conversation.model');

const socketService = require('../utils/socket.service');

class MessageService {
    async createMessage(conversationId, senderId, content) {
        const message = new Message({
            conversation: conversationId,
            sender: senderId,
            content,
        });
        await message.save();
        await Conversation.findByIdAndUpdate(conversationId, { lastMessage: message._id });

        const conversation = await Conversation.findById(conversationId);
        let userId;
        if (conversation.user._id.toString() === senderId.toString()) {
            userId = conversation.admin._id;
        } else {
            userId = conversation.user._id;
        }
        socketService.emitMessage(userId, 'new_message', message);

        return message;
    }

    async updateMessageIsRead(conversationId, sender) {
        const messages = await Message.find({
            conversation: conversationId,
            isRead: false,
            sender: sender,
        });

        for (const message of messages) {
            await Message.findByIdAndUpdate(message._id, { isRead: true });
        }
        return messages;
    }
}

module.exports = new MessageService();

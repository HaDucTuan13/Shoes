const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const messageChatbotSchema = new Schema(
    {
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User', // tham chiếu tới user nếu có
            required: true,
        },
        sender: {
            type: String,
            enum: ['user', 'bot'], // ai gửi
            required: true,
        },
        content: {
            type: String,
            required: true,
        },
        timestamp: {
            type: Date,
            default: Date.now,
        },
    },
    {
        timestamps: true, // có createdAt, updatedAt
    },
);

const Message = mongoose.model('MessageChatbot', messageChatbotSchema);

module.exports = Message;

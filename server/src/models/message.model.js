const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const messageSchema = new Schema(
    {
        conversation: {
            type: Schema.Types.ObjectId,
            ref: 'conversation',
            required: true,
        },
        sender: {
            type: Schema.Types.ObjectId,
            ref: 'user', // có thể là admin hoặc user
            required: true,
        },
        content: {
            type: String,
            required: true,
        },
        type: {
            type: String,
            enum: ['text', 'image', 'file'],
            default: 'text',
        },
        isRead: {
            type: Boolean,
            default: false,
        },
    },
    { timestamps: true },
);

module.exports = mongoose.model('message', messageSchema);

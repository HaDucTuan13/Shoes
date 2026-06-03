const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const conversationSchema = new Schema(
    {
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'user', // user thường
            required: true,
        },
        admin: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'user', // admin duy nhất
            required: true,
        },
        lastMessage: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'message',
        },
        lengthIsRead: {
            type: Number,
            default: 0,
        },
    },
    { timestamps: true },
);

module.exports = mongoose.model('conversation', conversationSchema);

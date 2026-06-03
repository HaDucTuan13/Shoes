const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const modelApiKey = new Schema(
    {
        userId: { type: String, require: true, ref: 'user' },
        publicKey: { type: String, require: true },
        privateKey: { type: String, require: true },
        expireAt: { type: Date, default: Date.now, expires: '7d' },
    },
    {
        timestamps: true,
    },
);

module.exports = mongoose.model('apikey', modelApiKey);

const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const modelContact = new Schema(
    {
        userId: { type: String, require: true, ref: 'user' },
        fullName: { type: String, require: true },
        email: { type: String, require: true },
        phone: { type: String, require: true },
        message: { type: String, require: true },
        status: { type: String, require: true, default: 'pending' },
    },
    {
        timestamps: true,
    },
);

module.exports = mongoose.model('contact', modelContact);

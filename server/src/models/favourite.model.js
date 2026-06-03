const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const modelFavourite = new Schema(
    {
        productId: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
        userId: { type: mongoose.Schema.Types.ObjectId, ref: 'user', required: true },
    },
    {
        timestamps: true,
    },
);

module.exports = mongoose.model('favourite', modelFavourite);

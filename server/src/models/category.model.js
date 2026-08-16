const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const modelCategory = new Schema(
    {
        categoryName: { type: String, required: true },
        parent: { type: Schema.Types.ObjectId, ref: 'category', default: null },
    },
    { timestamps: true },
);

module.exports = mongoose.model('category', modelCategory);
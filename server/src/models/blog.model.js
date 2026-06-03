const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const modelBlog = new Schema(
    {
        title: { type: String, require: true },
        content: { type: String, require: true },
        image: { type: String, require: true },
    },
    {
        timestamps: true,
    },
);

module.exports = mongoose.model('blog', modelBlog);

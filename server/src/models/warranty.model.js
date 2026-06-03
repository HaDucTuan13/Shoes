const mongoose = require('mongoose');

const warrantySchema = new mongoose.Schema({
    orderId: { type: mongoose.Schema.Types.ObjectId, ref: 'Order', required: true },
    productId: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'user', required: true },
    reason: { type: String }, // mô tả lỗi, vấn đề
    description: { type: String }, // mô tả chi tiết
    status: {
        type: String,
        enum: ['pending', 'processing', 'completed', 'rejected'],
        default: 'pending',
    },
    receivedDate: { type: Date, default: Date.now }, // ngày nhận bảo hành
    returnDate: { type: Date }, // ngày trả lại sản phẩm
    images: { type: [String] },
});

module.exports = mongoose.model('Warranty', warrantySchema);

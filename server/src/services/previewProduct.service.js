const modelPreviewProduct = require('../models/previewProduct.model');
const modelFlashSale = require('../models/flashSale.model'); // Khai báo thêm model Flash Sale để check giá

class PreviewProductService {
    async create({ userId, productId, images, rating, comment }) {
        const previewProduct = await modelPreviewProduct.create({ userId, productId, images, rating, comment });
        return previewProduct;
    }

    async getAllPreviewProduct() {
        // 1. Lấy toàn bộ danh sách xem trước kèm thông tin User và Product gốc
        const previewProducts = await modelPreviewProduct.find()
            .populate('userId')
            .populate('productId')
            .lean(); // Dùng .lean() để chuyển sang Object thuần, giúp chỉnh sửa thuộc tính dễ dàng

        // 2. Map qua từng sản phẩm để cập nhật giá trị Flash Sale (nếu có)
        const updatedPreviews = await Promise.all(
            previewProducts.map(async (item) => {
                // Kiểm tra xem sản phẩm đính kèm có tồn tại hay không
                if (item.productId && item.productId._id) {
                    const findFlashSale = await modelFlashSale.findOne({ productId: item.productId._id });
                    
                    if (findFlashSale) {
                        // Nếu có Flash Sale, đè giá trị discount mới vào đối tượng sản phẩm
                        item.productId.discount = findFlashSale.discount;
                    }
                }
                return item;
            })
        );

        return updatedPreviews;
    }
}

module.exports = new PreviewProductService();
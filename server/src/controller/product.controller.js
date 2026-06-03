const ProductService = require('../services/product.service');
const { OK } = require('../core/success.response');

class ProductController {
    async uploadImage(req, res) {
        try {
            const image = req.file;
            if (!image) {
                return res.status(400).json({ error: 'No file uploaded' });
            }

            const filename = await ProductService.uploadImage(image);
            const imageUrl = `${filename}`;

            res.json({
                success: true,
                url: imageUrl,
                data: {
                    url: imageUrl,
                    filename: filename,
                },
            });
        } catch (error) {
            console.error('Upload error:', error);
            res.status(500).json({ error: 'Upload failed' });
        }
    }
    async createProduct(req, res) {
        const {
            name,
            category,
            price,
            discount,
            description,
            sizes,
            colors,
            images,
            stock,
            isFeatured,
            status,
            variants,
        } = req.body;
        const product = await ProductService.createProduct(
            name,
            category,
            price,
            discount,
            description,
            sizes,
            colors,
            images,
            stock,
            isFeatured,
            status,
            variants,
        );
        new OK({ message: 'success', metadata: product }).send(res);
    }
    async getAllProduct(req, res) {
        const product = await ProductService.getAllProduct();
        new OK({ message: 'success', metadata: product }).send(res);
    }

    async updateProduct(req, res) {
        const { id } = req.params;
        const {
            name,
            category,
            price,
            discount,
            description,
            sizes,
            colors,
            images,
            stock,
            isFeatured,
            status,
            variants,
        } = req.body;
        const product = await ProductService.updateProduct(
            id,
            name,
            category,
            price,
            discount,
            description,
            sizes,
            colors,
            images,
            stock,
            isFeatured,
            status,
            variants,
        );
        new OK({ message: 'success', metadata: product }).send(res);
    }

    async getProductByCategory(req, res) {
        const { category } = req.params;
        const product = await ProductService.getProductByCategory(category);
        new OK({ message: 'success', metadata: product }).send(res);
    }

    async getProductById(req, res) {
        const { id } = req.params;
        const product = await ProductService.getProductById(id);
        new OK({ message: 'success', metadata: product }).send(res);
    }

    async searchProduct(req, res) {
        const { query } = req.params;
        const product = await ProductService.searchProduct(query);
        new OK({ message: 'success', metadata: product }).send(res);
    }

    async deleteProduct(req, res) {
        const { id } = req.params;
        const product = await ProductService.deleteProduct(id);
        new OK({ message: 'success', metadata: product }).send(res);
    }

    async filterProduct(req, res) {
        const { category, priceMin, priceMax, size, color, sortBy, sortOrder, page, limit } = req.query;

        const result = await ProductService.filterProduct(
            category,
            priceMin,
            priceMax,
            size,
            color,
            sortBy,
            sortOrder,
            page,
            limit,
        );

        new OK({ message: 'success', metadata: result }).send(res);
    }
}

module.exports = new ProductController();

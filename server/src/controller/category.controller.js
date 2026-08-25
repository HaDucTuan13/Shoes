const CategoryService = require('../services/category.service');
const { OK } = require('../core/success.response');

class CategoryController {
    async createCategory(req, res) {
        const { categoryName, parent } = req.body;
        const category = await CategoryService.createCategory(categoryName, parent);
        new OK({ message: 'success', metadata: category }).send(res);
    }

    async getAllCategory(req, res) {
        const category = await CategoryService.getAllCategory();
        new OK({ message: 'success', metadata: category }).send(res);
    }

    async uploadImage(req, res) {
        const image = req.file;
        if (!image) {
            return res.status(400).json({ error: 'No file uploaded' });
        }
        res.json({
            success: true,
            url: image.filename,
        });
    }

    async getCategoryTree(req, res) {
        const tree = await CategoryService.getCategoryTree();
        new OK({ message: 'success', metadata: tree }).send(res);
    }

    async updateCategory(req, res) {
        const { id, categoryName, parent } = req.body;
        const category = await CategoryService.updateCategory(id, categoryName, parent);
        new OK({ message: 'success', metadata: category }).send(res);
    }

    async deleteCategory(req, res) {
        const { id } = req.params;
        const category = await CategoryService.deleteCategory(id);
        new OK({ message: 'success', metadata: category }).send(res);
    }
}

module.exports = new CategoryController();


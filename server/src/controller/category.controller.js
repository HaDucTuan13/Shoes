const CategoryService = require('../services/category.service');
const { OK } = require('../core/success.response');

class CategoryController {
    async createCategory(req, res) {
        const { categoryName } = req.body;
        const category = await CategoryService.createCategory(categoryName);
        new OK({ message: 'success', metadata: category }).send(res);
    }

    async getAllCategory(req, res) {
        const category = await CategoryService.getAllCategory();
        new OK({ message: 'success', metadata: category }).send(res);
    }

    async updateCategory(req, res) {
        const { id, categoryName } = req.body;
        const category = await CategoryService.updateCategory(id, categoryName);
        new OK({ message: 'success', metadata: category }).send(res);
    }

    async deleteCategory(req, res) {
        const { id } = req.params;
        const category = await CategoryService.deleteCategory(id);
        new OK({ message: 'success', metadata: category }).send(res);
    }
}

module.exports = new CategoryController();

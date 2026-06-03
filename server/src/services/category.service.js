const Category = require('../models/category.model');

class CategoryService {
    async createCategory(categoryName) {
        const category = await Category.create({ categoryName });
        return category;
    }

    async getAllCategory() {
        const category = await Category.find();
        return category;
    }

    async updateCategory(id, categoryName) {
        const category = await Category.findByIdAndUpdate(id, { categoryName });
        return category;
    }

    async deleteCategory(id) {
        const category = await Category.findByIdAndDelete(id);
        return category;
    }
}

module.exports = new CategoryService();

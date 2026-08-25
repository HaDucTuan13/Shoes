const Category = require('../models/category.model');

class CategoryService {
    async createCategory(categoryName, parent = null) {
        const category = await Category.create({
            categoryName,
            parent: parent || null,
        });
        return category;
    }

    async getAllCategory() {
        const category = await Category.find()
            .populate('parent', 'categoryName')
            .sort({ createdAt: -1 });
        return category;
    }

    async getCategoryTree() {
        const allCategories = await Category.find().lean();
        const rootCategories = allCategories.filter((c) => !c.parent);

        const tree = rootCategories.map((parentCat) => {
            const children = allCategories.filter(
                (c) => c.parent && String(c.parent) === String(parentCat._id)
            );
            return {
                ...parentCat,
                children: children || [],
            };
        });

        return tree;
    }

    async updateCategory(id, categoryName, parent = null) {
        if (parent && String(parent) === String(id)) {
            throw new Error('Danh mục không thể là danh mục cha của chính nó');
        }

        const category = await Category.findByIdAndUpdate(
            id,
            {
                categoryName,
                parent: parent || null,
            },
            { new: true }
        ).populate('parent', 'categoryName');
        return category;
    }

    async deleteCategory(id) {
        // Also delete or handle children
        await Category.deleteMany({ parent: id });
        const category = await Category.findByIdAndDelete(id);
        return category;
    }
}

module.exports = new CategoryService();


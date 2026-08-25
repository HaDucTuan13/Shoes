const modelProduct = require('../models/product.model');
const modelCategory = require('../models/category.model');
const modelFlashSale = require('../models/flashSale.model');
const modelPreviewProduct = require('../models/previewProduct.model');

class ProductService {
    async uploadImage(image) {
        return image.filename;
    }

    async createProduct(
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
    ) {
        const categoryArray = Array.isArray(category)
            ? category
            : category
            ? [category]
            : [];

        const product = await modelProduct.create({
            name,
            category: categoryArray,
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
        });
        return product;
    }

    async getAllProduct() {
        const product = await modelProduct.find().populate({
            path: 'category',
            populate: { path: 'parent', select: 'categoryName' },
        });
        return product;
    }

    async updateProduct(
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
    ) {
        const categoryArray = Array.isArray(category)
            ? category
            : category
            ? [category]
            : [];

        const product = await modelProduct
            .findByIdAndUpdate(
                id,
                {
                    name,
                    category: categoryArray,
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
                },
                { new: true },
            )
            .populate({
                path: 'category',
                populate: { path: 'parent', select: 'categoryName' },
            });
        return product;
    }

    async deleteProduct(id) {
        const product = await modelProduct.findByIdAndDelete(id);
        return product;
    }

    async getProductByCategory(category) {
        // If category is a parent, query all products in parent and its subcategories
        const subCategories = await modelCategory.find({ parent: category });
        let query = {};
        if (subCategories && subCategories.length > 0) {
            const categoryIds = [category, ...subCategories.map((c) => c._id)];
            query = { category: { $in: categoryIds }, status: 'active' };
        } else {
            query = { category, status: 'active' };
        }

        const products = await modelProduct.find(query).populate({
            path: 'category',
            populate: { path: 'parent', select: 'categoryName' },
        });

        const now = new Date();
        const updatedProducts = await Promise.all(
            products.map(async (product) => {
                const productObj = product.toObject();

                const findFlashSale = await modelFlashSale.findOne({
                    productId: productObj._id,
                    startDate: { $lte: now },
                    endDate: { $gte: now },
                });
                if (findFlashSale) {
                    productObj.discount = findFlashSale.discount;
                }

                return productObj;
            })
        );

        return updatedProducts;
    }

    async getProductById(id) {
        const product = await modelProduct.findById(id).populate({
            path: 'category',
            populate: { path: 'parent', select: 'categoryName' },
        });
        if (!product) return null;

        const productObj = product.toObject();

        // Kiểm tra Flash Sale còn hiệu lực
        const now = new Date();
        const findFlashSale = await modelFlashSale.findOne({
            productId: id,
            startDate: { $lte: now },
            endDate: { $gte: now },
        });
        if (findFlashSale) {
            productObj.discount = findFlashSale.discount;
        }

        // Lấy danh sách category IDs của sản phẩm
        const categoryIds = Array.isArray(product.category)
            ? product.category.map((c) => c._id || c)
            : product.category
            ? [product.category._id || product.category]
            : [];

        // Tìm các sản phẩm liên quan có cùng danh mục (loại trừ chính nó)
        let findProductRelated = [];
        if (categoryIds.length > 0) {
            findProductRelated = await modelProduct
                .find({
                    _id: { $ne: id },
                    category: { $in: categoryIds },
                    status: 'active',
                })
                .limit(8)
                .lean();
        }

        productObj.productRelated = findProductRelated;

        const findPreviewProduct = await modelPreviewProduct
            .find({ productId: id })
            .populate('userId', 'fullName avatar')
            .lean();

        productObj.previewProduct = findPreviewProduct || [];
        return productObj;
    }
    
    async searchProduct(query) {
        // 1. Tìm tất cả sản phẩm khớp với tên
        const products = await modelProduct.find({ name: { $regex: query, $options: 'i' } });

        // 2. Duyệt qua từng sản phẩm để map thông tin Flash Sale và Sản phẩm liên quan
        const updatedProducts = await Promise.all(
            products.map(async (product) => {
                // Chuyển product sang Object thuần của JS để có thể thêm/sửa thuộc tính linh hoạt
                const productObj = product.toObject();

                // Check Flash Sale cho từng sản phẩm
                const findFlashSale = await modelFlashSale.findOne({ productId: productObj._id });
                if (findFlashSale) {
                    productObj.discount = findFlashSale.discount;
                }

                // Tìm sản phẩm liên quan cho từng sản phẩm (nếu UI tìm kiếm của bạn cần hiển thị)
                const findProductRelated = await modelProduct.find({ 
                    category: productObj.category,
                    _id: { $ne: productObj._id } // Loại trừ chính nó luôn bằng query Mongoose thay vì filter sau
                });
                
                productObj.productRelated = findProductRelated || [];

                return productObj;
            })
        );

        return updatedProducts;
    }

    async filterProduct(
        category,
        priceMin,
        priceMax,
        size,
        color,
        sortBy = 'createdAt',
        sortOrder = 'desc',
        page = 1,
        limit = 12,
    ) {
        try {
            const mongoose = require('mongoose');
            let matchQuery = { status: 'active' };

            // Category filter
            if (category && category !== 'all') {
                const categoryObjId = new mongoose.Types.ObjectId(category);
                const subCategories = await modelCategory.find({ parent: categoryObjId });
                if (subCategories && subCategories.length > 0) {
                    const categoryIds = [categoryObjId, ...subCategories.map((c) => c._id)];
                    matchQuery.category = { $in: categoryIds };
                } else {
                    matchQuery.category = categoryObjId;
                }
            }

            // Size filter
            if (size && size !== 'all') {
                matchQuery['variants.size'] = size;
            }

            // Color filter
            if (color && color !== 'all') {
                matchQuery['colors.name'] = { $regex: color, $options: 'i' };
            }

            const pipeline = [
                { $match: matchQuery },
                {
                    $addFields: {
                        discountedPrice: {
                            $cond: {
                                if: { $gt: ['$discount', 0] },
                                then: {
                                    $subtract: [
                                        '$price',
                                        { $divide: [{ $multiply: ['$price', '$discount'] }, 100] },
                                    ],
                                },
                                else: '$price',
                            },
                        },
                    },
                },
            ];

            // Price filter using the computed discountedPrice
            if (priceMin || priceMax) {
                let priceMatchQuery = {};
                if (priceMin) priceMatchQuery.$gte = Number(priceMin);
                if (priceMax) priceMatchQuery.$lte = Number(priceMax);
                pipeline.push({ $match: { discountedPrice: priceMatchQuery } });
            }

            // Lookup category to match behavior of .populate('category', 'categoryName')
            pipeline.push({
                $lookup: {
                    from: 'categories',
                    localField: 'category',
                    foreignField: '_id',
                    as: 'category',
                },
            });

            // Build sort stage
            let sortStage = {};
            switch (sortBy) {
                case 'price_asc':
                    sortStage.discountedPrice = 1;
                    break;
                case 'price_desc':
                    sortStage.discountedPrice = -1;
                    break;
                case 'name':
                    sortStage.name = 1;
                    break;
                case 'newest':
                    sortStage.createdAt = -1;
                    break;
                case 'oldest':
                    sortStage.createdAt = 1;
                    break;
                default:
                    sortStage.createdAt = -1;
            }
            pipeline.push({ $sort: sortStage });

            // Calculate pagination
            const skip = (Math.max(1, parseInt(page)) - 1) * parseInt(limit);

            // Execute query with pagination and total count via $facet
            pipeline.push({
                $facet: {
                    metadata: [{ $count: 'total' }],
                    data: [{ $skip: skip }, { $limit: parseInt(limit) }],
                },
            });

            // Execute aggregation with collation to allow case-insensitive sorting for strings like name
            const aggregationResult = await modelProduct.aggregate(pipeline).collation({ locale: 'vi', strength: 2 });

            const totalProducts = aggregationResult[0].metadata.length > 0 ? aggregationResult[0].metadata[0].total : 0;
            const products = aggregationResult[0].data;
            const totalPages = Math.ceil(totalProducts / parseInt(limit));

            // Get filter options for UI
            const categories = await modelCategory.find().populate('parent', 'categoryName').lean();

            // Get unique sizes and colors for filters
            const allProducts = await modelProduct.find({ status: 'active' });
            const uniqueSizes = [...new Set(allProducts.flatMap((p) => p.variants?.map((v) => v.size) || []))].sort();

            // Get unique colors and normalize them (group similar names)
            const allColors = allProducts.flatMap((p) => p.colors?.map((c) => c.name) || []);
            const colorMap = new Map();
            const colorCountMap = new Map();

            // Group colors by normalized name (lowercase, trimmed)
            allColors.forEach((color) => {
                if (!color) return;
                const normalized = color.toLowerCase().trim();

                if (!colorMap.has(normalized)) {
                    // Store the first occurrence (original case) as the display name
                    colorMap.set(normalized, color);
                    colorCountMap.set(normalized, 0);
                }
                colorCountMap.set(normalized, colorCountMap.get(normalized) + 1);
            });

            // Get unique colors with counts, sorted alphabetically
            const uniqueColors = Array.from(colorMap.entries())
                .map(([normalized, displayName]) => ({
                    name: displayName,
                    normalized: normalized,
                    count: colorCountMap.get(normalized),
                }))
                .sort((a, b) => a.name.localeCompare(b.name, 'vi', { sensitivity: 'base' }));

            const result = {
                products,
                pagination: {
                    currentPage: parseInt(page),
                    totalPages,
                    totalProducts,
                    hasNextPage: parseInt(page) < totalPages,
                    hasPrevPage: parseInt(page) > 1,
                    limit: parseInt(limit),
                },
                filters: {
                    categories,
                    sizes: uniqueSizes,
                    colors: uniqueColors,
                    priceRanges: [
                        { label: 'Dưới 500K', min: 0, max: 500000 },
                        { label: '500K - 1M', min: 500000, max: 1000000 },
                        { label: '1M - 2M', min: 1000000, max: 2000000 },
                        { label: '2M - 5M', min: 2000000, max: 5000000 },
                        { label: 'Trên 5M', min: 5000000, max: null },
                    ],
                },
                appliedFilters: {
                    category,
                    priceMin,
                    priceMax,
                    size,
                    color,
                    sortBy,
                    sortOrder,
                },
            };

            return result;
        } catch (error) {
            throw new Error(`Error filtering products: ${error.message}`);
        }
    }

async countProductsByQuery({ categoryName, priceMax, gender }) {
        try {
            let matchQuery = { status: 'active' };

            if (priceMax) {
                matchQuery.price = { $lt: Number(priceMax) };
            }

            if (gender === 'nam') {
                matchQuery.name = { $regex: 'Nam', $options: 'i' };
            } else if (gender === 'nu') {
                matchQuery.name = { $regex: 'Nữ', $options: 'i' };
            }

            const count = await modelProduct.countDocuments(matchQuery);
            return count;
        } catch (error) {
            console.error("Lỗi đếm sản phẩm:", error);
            return 0;
        }
    }
}

module.exports = new ProductService();

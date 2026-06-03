import { useEffect, useState } from 'react';
import CardBody from './CardBody';
import { requestGetAllCategory } from '../config/CategoryRequest';
import { requestGetProductByCategory } from '../config/ProductRequest';

function Category() {
    const [categories, setCategories] = useState([]);
    const [activeCategory, setActiveCategory] = useState();
    const [products, setProducts] = useState([]);

    // 🟢 Lấy danh sách category 1 lần
    useEffect(() => {
        const fetchCategories = async () => {
            const res = await requestGetAllCategory();
            setCategories(res.metadata);

            // Nếu chưa có activeCategory thì set mặc định là cái đầu tiên
            if (res.metadata?.length > 0) {
                setActiveCategory(res.metadata[0]._id);
            }
        };
        fetchCategories();
    }, []); // <--- chỉ chạy 1 lần

    // 🟢 Mỗi khi activeCategory thay đổi thì lấy sản phẩm
    useEffect(() => {
        if (!activeCategory) return;
        const fetchProducts = async () => {
            const res = await requestGetProductByCategory(activeCategory);
            setProducts(res.metadata);
        };
        fetchProducts();
    }, [activeCategory]);

    return (
        <div className="w-full bg-gray-50 py-8">
            <div className="w-[90%] mx-auto">
                {/* Category Navigation */}
                <div className="flex items-center justify-between mb-8">
                    {/* Left Title */}
                    <h2 className="text-xl font-bold text-gray-800">Danh mục sản phẩm</h2>

                    {/* Right Category Buttons */}
                    <div className="flex items-center gap-2">
                        {categories.map((category) => (
                            <button
                                key={category._id}
                                onClick={() => setActiveCategory(category._id)}
                                className={`px-4 py-2 rounded-md font-medium text-sm transition-colors duration-200 ${
                                    activeCategory === category._id
                                        ? 'bg-red-700 text-white'
                                        : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-200'
                                }`}
                            >
                                {category.categoryName.toUpperCase()}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Products Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-6">
                    {products.map((item) => (
                        <CardBody key={item._id} product={item} />
                    ))}
                </div>
            </div>
        </div>
    );
}

export default Category;

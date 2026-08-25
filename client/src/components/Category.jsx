import { useEffect, useState } from 'react';
import CardBody from './CardBody';
import { requestGetCategoryTree } from '../config/CategoryRequest';
import { requestGetProductByCategory } from '../config/ProductRequest';
import { Loader2, Package } from 'lucide-react';

function Category() {
    const [categoryTree, setCategoryTree] = useState([]);
    const [activeParent, setActiveParent] = useState(null);
    const [activeSub, setActiveSub] = useState(null);
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(false);

    // 🟢 Lấy cây danh mục 2 tầng
    useEffect(() => {
        const fetchCategories = async () => {
            try {
                const res = await requestGetCategoryTree();
                const tree = res.metadata || [];
                setCategoryTree(tree);

                if (tree.length > 0) {
                    setActiveParent(tree[0]);
                    setActiveSub(null);
                }
            } catch (error) {
                console.error('Error fetching category tree:', error);
            }
        };
        fetchCategories();
    }, []);

    // 🟢 Mỗi khi activeParent hoặc activeSub thay đổi thì lấy sản phẩm
    useEffect(() => {
        const targetId = activeSub ? activeSub._id : activeParent?._id;
        if (!targetId) return;

        const fetchProducts = async () => {
            setLoading(true);
            try {
                const res = await requestGetProductByCategory(targetId);
                setProducts(res.metadata || []);
            } catch (error) {
                console.error('Error fetching products by category:', error);
                setProducts([]);
            } finally {
                setLoading(false);
            }
        };
        fetchProducts();
    }, [activeParent, activeSub]);

    const handleSelectParent = (parent) => {
        setActiveParent(parent);
        setActiveSub(null); // Reset subcategory to 'all'
    };

    return (
        <div className="w-full bg-gray-50 py-12">
            <div className="w-[90%] mx-auto">
                {/* Section Header */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
                    <div>
                        <h2 className="text-2xl font-extrabold text-gray-900 tracking-tight">
                            Khám Phá Danh Mục Sản Phẩm
                        </h2>
                        <p className="text-sm text-gray-500 mt-1">
                            Chọn nhóm danh mục để tìm đôi giày hoàn hảo cho bạn
                        </p>
                    </div>

                    {/* Tier 1: Parent Category Tabs */}
                    <div className="flex items-center gap-2 flex-wrap">
                        {categoryTree.map((parent) => (
                            <button
                                key={parent._id}
                                onClick={() => handleSelectParent(parent)}
                                className={`px-5 py-2.5 rounded-xl font-bold text-sm transition-all duration-200 cursor-pointer shadow-sm ${
                                    activeParent?._id === parent._id
                                        ? 'bg-[#111827] text-white shadow-md scale-[1.02]'
                                        : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-200'
                                }`}
                            >
                                {parent.categoryName.toUpperCase()}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Tier 2: Subcategory Pills (Chỉ hiện khi danh mục cha có con) */}
                {activeParent && activeParent.children && activeParent.children.length > 0 && (
                    <div className="flex items-center gap-2 mb-8 overflow-x-auto pb-2 scrollbar-none">
                        <span className="text-xs font-semibold text-gray-500 uppercase mr-1">
                            Phân loại:
                        </span>
                        <button
                            onClick={() => setActiveSub(null)}
                            className={`px-4 py-1.5 rounded-full text-xs font-semibold transition-all duration-150 cursor-pointer ${
                                activeSub === null
                                    ? 'bg-[#111827] text-white shadow-sm'
                                    : 'bg-white text-gray-800 border border-gray-200 hover:bg-gray-100 hover:text-black'
                            }`}
                        >
                            Tất cả {activeParent.categoryName}
                        </button>
                        {activeParent.children.map((sub) => (
                            <button
                                key={sub._id}
                                onClick={() => setActiveSub(sub)}
                                className={`px-4 py-1.5 rounded-full text-xs font-semibold transition-all duration-150 cursor-pointer ${
                                    activeSub?._id === sub._id
                                        ? 'bg-[#111827] text-white shadow-sm'
                                        : 'bg-white text-gray-800 border border-gray-200 hover:bg-gray-100 hover:text-black'
                                }`}
                            >
                                {sub.categoryName}
                            </button>
                        ))}
                    </div>
                )}

                {/* Products Grid */}
                {loading ? (
                    <div className="flex flex-col items-center justify-center py-16">
                        <Loader2 className="animate-spin text-blue-600 mb-3" size={36} />
                        <span className="text-sm text-gray-500">Đang tải sản phẩm...</span>
                    </div>
                ) : products.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-6">
                        {products.map((item) => (
                            <CardBody key={item._id} product={item} />
                        ))}
                    </div>
                ) : (
                    <div className="flex flex-col items-center justify-center py-16 bg-white rounded-2xl border border-gray-200">
                        <Package className="text-gray-300 mb-3" size={48} />
                        <p className="text-gray-500 font-medium">Chưa có sản phẩm nào trong danh mục này</p>
                    </div>
                )}
            </div>
        </div>
    );
}

export default Category;


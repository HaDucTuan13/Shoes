import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate, useSearchParams } from 'react-router-dom';
import Footer from '../components/Footer';
import Header from '../components/Header';
import CardBody from '../components/CardBody';
import { requestFilterProduct } from '../config/ProductRequest';
import { requestGetAllCategory } from '../config/CategoryRequest';
import { Filter, Grid, List, SlidersHorizontal, ChevronDown, X, Package, Loader2, Star, Heart } from 'lucide-react';

function Category() {
    const location = useLocation();
    const navigate = useNavigate();
    const [searchParams, setSearchParams] = useSearchParams();

    // States
    const [products, setProducts] = useState([]);
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showMobileFilters, setShowMobileFilters] = useState(false);
    const [viewMode, setViewMode] = useState('grid'); // 'grid' or 'list'

    // Filter states
    const [filters, setFilters] = useState({
        category: searchParams.get('category') || 'all',
        priceMin: searchParams.get('priceMin') || '',
        priceMax: searchParams.get('priceMax') || '',
        size: searchParams.get('size') || 'all',
        color: searchParams.get('color') || 'all',
        sortBy: searchParams.get('sortBy') || 'newest',
        page: parseInt(searchParams.get('page')) || 1,
        limit: 12,
    });

    // Available filter options
    const [filterOptions, setFilterOptions] = useState({
        categories: [],
        sizes: [],
        colors: [],
        priceRanges: [],
    });

    // Pagination
    const [pagination, setPagination] = useState({
        currentPage: 1,
        totalPages: 1,
        totalProducts: 0,
        hasNextPage: false,
        hasPrevPage: false,
    });

    // Price ranges
    const priceRanges = [
        { label: 'Tất cả', min: '', max: '' },
        { label: 'Dưới 500K', min: 0, max: 500000 },
        { label: '500K - 1M', min: 500000, max: 1000000 },
        { label: '1M - 2M', min: 1000000, max: 2000000 },
        { label: '2M - 5M', min: 2000000, max: 5000000 },
        { label: 'Trên 5M', min: 5000000, max: '' },
    ];

    // Sort options
    const sortOptions = [
        { value: 'newest', label: 'Mới nhất' },
        { value: 'oldest', label: 'Cũ nhất' },
        { value: 'price_asc', label: 'Giá thấp đến cao' },
        { value: 'price_desc', label: 'Giá cao đến thấp' },
        { value: 'name', label: 'Tên A-Z' },
    ];

    // Fetch categories on mount
    useEffect(() => {
        const fetchCategories = async () => {
            try {
                const response = await requestGetAllCategory();
                if (response.statusCode === 200) {
                    setCategories(response.metadata);
                }
            } catch (error) {
                console.error('Error fetching categories:', error);
            }
        };
        fetchCategories();
    }, []);

    // Fetch products when filters change
    useEffect(() => {
        fetchProducts();
        updateURL();
    }, [filters]);

    const fetchProducts = async () => {
        setLoading(true);
        try {
            const response = await requestFilterProduct(filters);
            if (response.statusCode === 200) {
                setProducts(response.metadata.products);
                setPagination(response.metadata.pagination);
                setFilterOptions(response.metadata.filters);
            }
        } catch (error) {
            console.error('Error fetching products:', error);
            setProducts([]);
        } finally {
            setLoading(false);
        }
    };

    const updateURL = () => {
        const params = new URLSearchParams();
        Object.entries(filters).forEach(([key, value]) => {
            if (value && value !== 'all' && value !== '') {
                params.set(key, value);
            }
        });
        setSearchParams(params);
    };

    const handleFilterChange = (key, value) => {
        setFilters((prev) => ({
            ...prev,
            [key]: value,
            page: 1, // Reset to first page when filter changes
        }));
    };

    const handlePriceRangeChange = (range) => {
        setFilters((prev) => ({
            ...prev,
            priceMin: range.min,
            priceMax: range.max,
            page: 1,
        }));
    };

    const clearFilters = () => {
        setFilters({
            category: 'all',
            priceMin: '',
            priceMax: '',
            size: 'all',
            color: 'all',
            sortBy: 'newest',
            page: 1,
            limit: 12,
        });
    };

    const handlePageChange = (newPage) => {
        setFilters((prev) => ({
            ...prev,
            page: newPage,
        }));
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const formatPrice = (price) => {
        return new Intl.NumberFormat('vi-VN', {
            style: 'currency',
            currency: 'VND',
            minimumFractionDigits: 0,
        }).format(price);
    };

    const getActiveFiltersCount = () => {
        let count = 0;
        if (filters.category && filters.category !== 'all') count++;
        if (filters.priceMin || filters.priceMax) count++;
        if (filters.size && filters.size !== 'all') count++;
        if (filters.color && filters.color !== 'all') count++;
        return count;
    };

    const getCurrentCategoryName = () => {
        if (filters.category === 'all') return 'Tất cả sản phẩm';
        const category = categories.find((cat) => cat._id === filters.category);
        return category ? category.categoryName : 'Danh mục';
    };

    return (
        <div className="min-h-screen bg-gray-50">
            <Header />

            {/* Breadcrumb */}
            <div className="bg-white border-b">
                <div className="container mx-auto px-4 py-4">
                    <nav className="flex items-center space-x-2 text-sm text-gray-600">
                        <span onClick={() => navigate('/')} className="hover:text-red-600 cursor-pointer">
                            Trang chủ
                        </span>
                        <span>/</span>
                        <span className="text-gray-900 font-medium">{getCurrentCategoryName()}</span>
                    </nav>
                </div>
            </div>

            {/* Main Content */}
            <div className="container mx-auto px-4 py-6">
                <div className="flex flex-col lg:flex-row gap-6">
                    {/* Sidebar Filters - Desktop */}
                    <div className="hidden lg:block w-80 flex-shrink-0">
                        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 sticky top-6">
                            {/* Filter Header */}
                            <div className="flex items-center justify-between mb-6">
                                <div className="flex items-center space-x-2">
                                    <SlidersHorizontal className="text-gray-600" size={20} />
                                    <h3 className="text-lg font-bold text-gray-900">Bộ lọc</h3>
                                </div>
                                <button
                                    onClick={clearFilters}
                                    className="text-sm text-red-600 hover:text-red-700 font-medium"
                                >
                                    Xóa tất cả
                                </button>
                            </div>

                            {/* Active Filters Count */}
                            {getActiveFiltersCount() > 0 && (
                                <div className="mb-4 p-3 bg-red-50 rounded-lg">
                                    <div className="flex items-center justify-between">
                                        <span className="text-sm text-red-800">
                                            {getActiveFiltersCount()} bộ lọc đang áp dụng
                                        </span>
                                        <button onClick={clearFilters} className="text-red-600 hover:text-red-700">
                                            <X size={14} />
                                        </button>
                                    </div>
                                </div>
                            )}

                            {/* Categories Filter */}
                            <div className="mb-6">
                                <h4 className="font-semibold text-gray-900 mb-3">Danh mục</h4>
                                <div className="space-y-2">
                                    <label className="flex items-center">
                                        <input
                                            type="radio"
                                            name="category"
                                            value="all"
                                            checked={filters.category === 'all'}
                                            onChange={(e) => handleFilterChange('category', e.target.value)}
                                            className="w-4 h-4 text-red-600 border-gray-300 focus:ring-red-500"
                                        />
                                        <span className="ml-2 text-sm text-gray-700">Tất cả</span>
                                    </label>
                                    {categories.map((cat) => (
                                        <label key={cat._id} className="flex items-center">
                                            <input
                                                type="radio"
                                                name="category"
                                                value={cat._id}
                                                checked={filters.category === cat._id}
                                                onChange={(e) => handleFilterChange('category', e.target.value)}
                                                className="w-4 h-4 text-red-600 border-gray-300 focus:ring-red-500"
                                            />
                                            <span className="ml-2 text-sm text-gray-700">{cat.categoryName}</span>
                                        </label>
                                    ))}
                                </div>
                            </div>

                            {/* Price Range Filter */}
                            <div className="mb-6">
                                <h4 className="font-semibold text-gray-900 mb-3">Khoảng giá</h4>
                                <div className="space-y-2">
                                    {priceRanges.map((range, index) => (
                                        <label key={index} className="flex items-center">
                                            <input
                                                type="radio"
                                                name="priceRange"
                                                checked={
                                                    filters.priceMin === range.min && filters.priceMax === range.max
                                                }
                                                onChange={() => handlePriceRangeChange(range)}
                                                className="w-4 h-4 text-red-600 border-gray-300 focus:ring-red-500"
                                            />
                                            <span className="ml-2 text-sm text-gray-700">{range.label}</span>
                                        </label>
                                    ))}
                                </div>

                                {/* Custom Price Range */}
                            </div>

                            {/* Size Filter */}
                            {filterOptions.sizes.length > 0 && (
                                <div className="mb-6">
                                    <h4 className="font-semibold text-gray-900 mb-3">Kích cỡ</h4>
                                    <div className="grid grid-cols-4 gap-2">
                                        <button
                                            onClick={() => handleFilterChange('size', 'all')}
                                            className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                                                filters.size === 'all'
                                                    ? 'bg-red-600 text-white'
                                                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                            }`}
                                        >
                                            Tất cả
                                        </button>
                                        {filterOptions.sizes.map((size) => (
                                            <button
                                                key={size}
                                                onClick={() => handleFilterChange('size', size)}
                                                className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                                                    filters.size === size
                                                        ? 'bg-red-600 text-white'
                                                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                                }`}
                                            >
                                                {size}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Color Filter */}
                            {filterOptions.colors.length > 0 && (
                                <div className="mb-6">
                                    <h4 className="font-semibold text-gray-900 mb-3">Màu sắc</h4>
                                    <div className="space-y-2 max-h-64 overflow-y-auto">
                                        <button
                                            onClick={() => handleFilterChange('color', 'all')}
                                            className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${
                                                filters.color === 'all'
                                                    ? 'bg-red-50 text-red-700 border border-red-200'
                                                    : 'text-gray-700 hover:bg-gray-50'
                                            }`}
                                        >
                                            Tất cả màu
                                        </button>
                                        {filterOptions.colors.map((color) => {
                                            const colorName = typeof color === 'string' ? color : color.name;
                                            const colorCount =
                                                typeof color === 'object' && color.count ? color.count : null;

                                            return (
                                                <button
                                                    key={colorName}
                                                    onClick={() => handleFilterChange('color', colorName)}
                                                    className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors flex items-center justify-between ${
                                                        filters.color === colorName
                                                            ? 'bg-red-50 text-red-700 border border-red-200'
                                                            : 'text-gray-700 hover:bg-gray-50'
                                                    }`}
                                                >
                                                    <span>{colorName}</span>
                                                    {colorCount && (
                                                        <span className="text-xs text-gray-500 ml-2">
                                                            ({colorCount})
                                                        </span>
                                                    )}
                                                </button>
                                            );
                                        })}
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Main Products Area */}
                    <div className="flex-1">
                        {/* Mobile Filter Button & Sort */}
                        <div className="flex items-center justify-between mb-6 lg:hidden">
                            <button
                                onClick={() => setShowMobileFilters(true)}
                                className="flex items-center space-x-2 bg-white px-4 py-2 rounded-lg border border-gray-300 shadow-sm"
                            >
                                <Filter size={18} />
                                <span>Bộ lọc</span>
                                {getActiveFiltersCount() > 0 && (
                                    <span className="bg-red-600 text-white text-xs px-2 py-1 rounded-full">
                                        {getActiveFiltersCount()}
                                    </span>
                                )}
                            </button>
                        </div>

                        {/* Results Header */}
                        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 mb-6">
                            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                                {/* Results Info */}
                                <div className="flex items-center space-x-4">
                                    <h2 className="text-xl font-bold text-gray-900">{getCurrentCategoryName()}</h2>
                                    <div className="text-sm text-gray-600">
                                        {loading ? (
                                            <div className="flex items-center space-x-2">
                                                <Loader2 className="animate-spin" size={16} />
                                                <span>Đang tải...</span>
                                            </div>
                                        ) : (
                                            <span>{pagination.totalProducts} sản phẩm</span>
                                        )}
                                    </div>
                                </div>

                                {/* Sort & View Options */}
                                <div className="flex items-center space-x-4">
                                    {/* Sort Dropdown */}
                                    <div className="relative">
                                        <select
                                            value={filters.sortBy}
                                            onChange={(e) => handleFilterChange('sortBy', e.target.value)}
                                            className="appearance-none bg-white border border-gray-300 rounded-lg px-4 py-2 pr-8 text-sm focus:ring-2 focus:ring-red-500 focus:border-red-500"
                                        >
                                            {sortOptions.map((option) => (
                                                <option key={option.value} value={option.value}>
                                                    {option.label}
                                                </option>
                                            ))}
                                        </select>
                                        <ChevronDown
                                            className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400"
                                            size={16}
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Products Grid/List */}
                        {loading ? (
                            <div className="flex flex-col items-center justify-center py-12">
                                <Loader2 className="animate-spin text-red-600 mb-4" size={48} />
                                <p className="text-gray-600">Đang tải sản phẩm...</p>
                            </div>
                        ) : products.length > 0 ? (
                            <>
                                <div
                                    className={
                                        viewMode === 'grid'
                                            ? 'grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-6'
                                            : 'space-y-4'
                                    }
                                >
                                    {products.map((product) => (
                                        <div key={product._id} className="group">
                                            <CardBody product={product} />
                                        </div>
                                    ))}
                                </div>

                                {/* Pagination */}
                                {pagination.totalPages > 1 && (
                                    <div className="flex justify-center items-center space-x-2 mt-12">
                                        <button
                                            onClick={() => handlePageChange(pagination.currentPage - 1)}
                                            disabled={!pagination.hasPrevPage}
                                            className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                                        >
                                            Trước
                                        </button>

                                        {/* Page Numbers */}
                                        {Array.from({ length: Math.min(5, pagination.totalPages) }, (_, i) => {
                                            let pageNumber;
                                            if (pagination.totalPages <= 5) {
                                                pageNumber = i + 1;
                                            } else if (pagination.currentPage <= 3) {
                                                pageNumber = i + 1;
                                            } else if (pagination.currentPage >= pagination.totalPages - 2) {
                                                pageNumber = pagination.totalPages - 4 + i;
                                            } else {
                                                pageNumber = pagination.currentPage - 2 + i;
                                            }

                                            return (
                                                <button
                                                    key={pageNumber}
                                                    onClick={() => handlePageChange(pageNumber)}
                                                    className={`px-4 py-2 rounded-lg text-sm font-medium ${
                                                        pagination.currentPage === pageNumber
                                                            ? 'bg-red-600 text-white'
                                                            : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
                                                    }`}
                                                >
                                                    {pageNumber}
                                                </button>
                                            );
                                        })}

                                        <button
                                            onClick={() => handlePageChange(pagination.currentPage + 1)}
                                            disabled={!pagination.hasNextPage}
                                            className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                                        >
                                            Sau
                                        </button>
                                    </div>
                                )}
                            </>
                        ) : (
                            <div className="flex flex-col items-center justify-center py-12 bg-white rounded-xl shadow-sm border border-gray-200">
                                <Package className="text-gray-400 mb-4" size={64} />
                                <h3 className="text-xl font-semibold text-gray-900 mb-2">Không tìm thấy sản phẩm</h3>
                                <p className="text-gray-600 text-center mb-6">
                                    Không có sản phẩm nào phù hợp với bộ lọc của bạn. <br />
                                    Hãy thử điều chỉnh bộ lọc hoặc xóa một số tiêu chí tìm kiếm.
                                </p>
                                <button
                                    onClick={clearFilters}
                                    className="bg-red-600 text-white px-6 py-2 rounded-lg font-medium hover:bg-red-700 transition-colors"
                                >
                                    Xóa tất cả bộ lọc
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Mobile Filter Modal */}
            {showMobileFilters && (
                <div className="fixed inset-0 z-50 lg:hidden">
                    <div
                        className="absolute inset-0 bg-black bg-opacity-50"
                        onClick={() => setShowMobileFilters(false)}
                    />
                    <div className="absolute inset-y-0 left-0 w-80 bg-white shadow-xl overflow-y-auto">
                        <div className="p-6">
                            <div className="flex items-center justify-between mb-6">
                                <h3 className="text-lg font-bold text-gray-900">Bộ lọc</h3>
                                <button
                                    onClick={() => setShowMobileFilters(false)}
                                    className="text-gray-400 hover:text-gray-600"
                                >
                                    <X size={24} />
                                </button>
                            </div>

                            {/* Same filter content as desktop */}
                            {/* Categories Filter */}
                            <div className="mb-6">
                                <h4 className="font-semibold text-gray-900 mb-3">Danh mục</h4>
                                <div className="space-y-2">
                                    <label className="flex items-center">
                                        <input
                                            type="radio"
                                            name="category"
                                            value="all"
                                            checked={filters.category === 'all'}
                                            onChange={(e) => handleFilterChange('category', e.target.value)}
                                            className="w-4 h-4 text-red-600 border-gray-300 focus:ring-red-500"
                                        />
                                        <span className="ml-2 text-sm text-gray-700">Tất cả</span>
                                    </label>
                                    {categories.map((cat) => (
                                        <label key={cat._id} className="flex items-center">
                                            <input
                                                type="radio"
                                                name="category"
                                                value={cat._id}
                                                checked={filters.category === cat._id}
                                                onChange={(e) => handleFilterChange('category', e.target.value)}
                                                className="w-4 h-4 text-red-600 border-gray-300 focus:ring-red-500"
                                            />
                                            <span className="ml-2 text-sm text-gray-700">{cat.categoryName}</span>
                                        </label>
                                    ))}
                                </div>
                            </div>

                            {/* Price Range Filter */}
                            <div className="mb-6">
                                <h4 className="font-semibold text-gray-900 mb-3">Khoảng giá</h4>
                                <div className="space-y-2">
                                    {priceRanges.map((range, index) => (
                                        <label key={index} className="flex items-center">
                                            <input
                                                type="radio"
                                                name="priceRange"
                                                checked={
                                                    filters.priceMin === range.min && filters.priceMax === range.max
                                                }
                                                onChange={() => handlePriceRangeChange(range)}
                                                className="w-4 h-4 text-red-600 border-gray-300 focus:ring-red-500"
                                            />
                                            <span className="ml-2 text-sm text-gray-700">{range.label}</span>
                                        </label>
                                    ))}
                                </div>
                            </div>

                            {/* Size Filter */}
                            {filterOptions.sizes.length > 0 && (
                                <div className="mb-6">
                                    <h4 className="font-semibold text-gray-900 mb-3">Kích cỡ</h4>
                                    <div className="grid grid-cols-3 gap-2">
                                        <button
                                            onClick={() => handleFilterChange('size', 'all')}
                                            className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                                                filters.size === 'all'
                                                    ? 'bg-red-600 text-white'
                                                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                            }`}
                                        >
                                            Tất cả
                                        </button>
                                        {filterOptions.sizes.slice(0, 11).map((size) => (
                                            <button
                                                key={size}
                                                onClick={() => handleFilterChange('size', size)}
                                                className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                                                    filters.size === size
                                                        ? 'bg-red-600 text-white'
                                                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                                }`}
                                            >
                                                {size}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Color Filter - Mobile */}
                            {filterOptions.colors.length > 0 && (
                                <div className="mb-6">
                                    <h4 className="font-semibold text-gray-900 mb-3">Màu sắc</h4>
                                    <div className="space-y-2 max-h-48 overflow-y-auto">
                                        <button
                                            onClick={() => handleFilterChange('color', 'all')}
                                            className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${
                                                filters.color === 'all'
                                                    ? 'bg-red-50 text-red-700 border border-red-200'
                                                    : 'text-gray-700 hover:bg-gray-50'
                                            }`}
                                        >
                                            Tất cả màu
                                        </button>
                                        {filterOptions.colors.map((color) => {
                                            const colorName = typeof color === 'string' ? color : color.name;
                                            const colorCount =
                                                typeof color === 'object' && color.count ? color.count : null;

                                            return (
                                                <button
                                                    key={colorName}
                                                    onClick={() => handleFilterChange('color', colorName)}
                                                    className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors flex items-center justify-between ${
                                                        filters.color === colorName
                                                            ? 'bg-red-50 text-red-700 border border-red-200'
                                                            : 'text-gray-700 hover:bg-gray-50'
                                                    }`}
                                                >
                                                    <span>{colorName}</span>
                                                    {colorCount && (
                                                        <span className="text-xs text-gray-500 ml-2">
                                                            ({colorCount})
                                                        </span>
                                                    )}
                                                </button>
                                            );
                                        })}
                                    </div>
                                </div>
                            )}

                            {/* Clear & Apply Buttons */}
                            <div className="mt-6 pt-6 border-t border-gray-200 space-y-3">
                                <button
                                    onClick={clearFilters}
                                    className="w-full border border-red-600 text-red-600 py-3 rounded-lg font-medium hover:bg-red-50 transition-colors"
                                >
                                    Xóa tất cả bộ lọc
                                </button>
                                <button
                                    onClick={() => setShowMobileFilters(false)}
                                    className="w-full bg-red-600 text-white py-3 rounded-lg font-medium hover:bg-red-700 transition-colors"
                                >
                                    Áp dụng bộ lọc
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            <Footer />
        </div>
    );
}

export default Category;

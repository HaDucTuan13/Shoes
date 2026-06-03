import { useNavigate, useParams } from 'react-router-dom';
import Footer from '../components/Footer';
import Header from '../components/Header';
import { useEffect, useState } from 'react';
import { requestGetProductById } from '../config/ProductRequest';
import { ShoppingCart, Heart, Star, Minus, Plus, Check } from 'lucide-react';
import { requestAddToCart } from '../config/CartRequest';
import { toast } from 'react-toastify';
import { useStore } from '../hooks/useStore';
import CardBody from '../components/CardBody';
import { requestCreateFavourite } from '../config/FavouriteRequest';

function DetailProduct() {
    const { id } = useParams();
    const [product, setProduct] = useState({});
    const [selectedColor, setSelectedColor] = useState(null);
    const [selectedSize, setSelectedSize] = useState(null);
    const [quantity, setQuantity] = useState(1);
    const [mainImage, setMainImage] = useState('');
    const [isLoading, setIsLoading] = useState(true);
    const [reviews, setReviews] = useState([]);
    const [productRelated, setProductRelated] = useState([]);
    const [showAllReviews, setShowAllReviews] = useState(false);

    const totalRating = reviews.reduce((acc, review) => acc + review.rating, 0);
    const avgRating = reviews.length > 0 ? totalRating / reviews.length : 0;

    const { fetchCart, dataUser } = useStore();

    const fetchProductById = async () => {
        try {
            setIsLoading(true);
            const res = await requestGetProductById(id);
            setProduct(res.metadata);
            setReviews(res.metadata.previewProduct);
            setProductRelated(res.metadata.productRelated);
            if (res.metadata.colors && res.metadata.colors.length > 0) {
                setSelectedColor(res.metadata.colors[0]);
                setMainImage(res.metadata.colors[0].images);
            }
            if (res.metadata.variants && res.metadata.variants.length > 0) {
                setSelectedSize(res.metadata.variants[0]);
            }
        } catch (error) {
            console.error('Error fetching product:', error);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchProductById();
    }, [id]);

    const handleColorSelect = (color) => {
        setSelectedColor(color);
        setMainImage(color.images);
    };

    const handleSizeSelect = (size) => {
        setSelectedSize(size);
        setQuantity(1);
    };

    const handleQuantityChange = (change) => {
        const newQuantity = quantity + change;
        if (newQuantity >= 1 && newQuantity <= (selectedSize?.stock || 1)) {
            setQuantity(newQuantity);
        }
    };

    const formatPrice = (price) => {
        return new Intl.NumberFormat('vi-VN', {
            style: 'currency',
            currency: 'VND',
        }).format(price);
    };

    const calculateDiscountPrice = (originalPrice, discount) => {
        return originalPrice - (originalPrice * discount) / 100;
    };

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString('vi-VN', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
        });
    };

    const renderStars = (rating) => {
        const fullStars = Math.floor(rating);
        const hasHalfStar = rating % 1 !== 0;
        const emptyStars = 5 - fullStars - (hasHalfStar ? 1 : 0);

        return (
            <div className="flex items-center space-x-1">
                {[...Array(fullStars)].map((_, i) => (
                    <Star key={`full-${i}`} className="w-4 h-4 text-yellow-400 fill-current" />
                ))}
                {hasHalfStar && (
                    <div className="relative">
                        <Star className="w-4 h-4 text-gray-300" />
                        <Star
                            className="w-4 h-4 text-yellow-400 fill-current absolute top-0 left-0"
                            style={{ clipPath: 'inset(0 50% 0 0)' }}
                        />
                    </div>
                )}
                {[...Array(emptyStars)].map((_, i) => (
                    <Star key={`empty-${i}`} className="w-4 h-4 text-gray-300" />
                ))}
            </div>
        );
    };

    const handleAddToFavourite = async () => {
        try {
            const data = { productId: product._id };
            await requestCreateFavourite(data);
            fetchProductById();
            toast.success('Thêm vào yêu thích thành công');
        } catch (error) {
            fetchProductById();
            toast.error(error.response.data.message);
        }
    };

    const handleAddToCart = async () => {
        try {
            const data = {
                productId: product._id,
                quantity: quantity,
                size: selectedSize,
                color: selectedColor,
            };
            await requestAddToCart(data);
            fetchCart();
            toast.success('Thêm vào giỏ hàng thành công');
        } catch (error) {
            toast.error(error.response.data.message);
        }
    };

    const navigate = useNavigate();

    const handleBuyNow = async () => {
        try {
            const data = {
                productId: product._id,
                quantity: quantity,
                size: selectedSize,
                color: selectedColor,
            };
            await requestAddToCart(data);
            fetchCart();
            navigate('/cart');
        } catch (error) {
            toast.error(error.response.data.message);
        }
    };

    if (isLoading) {
        return (
            <div className="min-h-screen bg-gray-50">
                <Header />
                <div className="flex items-center justify-center min-h-[60vh]">
                    <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-red-500"></div>
                </div>
                <Footer />
            </div>
        );
    }

    if (!product || !product._id) {
        return (
            <div className="min-h-screen bg-gray-50">
                <Header />
                <div className="flex items-center justify-center min-h-[60vh]">
                    <div className="text-center">
                        <h2 className="text-2xl font-bold text-gray-800 mb-4">Sản phẩm không tồn tại</h2>
                        <p className="text-gray-600">Vui lòng kiểm tra lại đường dẫn</p>
                    </div>
                </div>
                <Footer />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50">
            <Header />

            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="bg-white rounded-lg shadow-lg overflow-hidden">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 p-8">
                        {/* Product Images */}
                        <div className="space-y-4">
                            <div className="aspect-square bg-gray-100 rounded-lg overflow-hidden">
                                <img
                                    src={`${import.meta.env.VITE_API_URL}/uploads/products/${mainImage}`}
                                    alt={product.name}
                                    className="w-full h-full object-cover"
                                />
                            </div>
                            {product.colors && product.colors.length > 1 && (
                                <div className="grid grid-cols-4 gap-2">
                                    {product.colors.map((color) => (
                                        <button
                                            key={color._id}
                                            onClick={() => handleColorSelect(color)}
                                            className={`aspect-square rounded-lg overflow-hidden border-2 ${
                                                selectedColor?._id === color._id
                                                    ? 'border-red-500'
                                                    : 'border-gray-200 hover:border-gray-300'
                                            }`}
                                        >
                                            <img
                                                src={`${import.meta.env.VITE_API_URL}/uploads/products/${color.images}`}
                                                alt={color.name}
                                                className="w-full h-full object-cover"
                                            />
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* Product Info */}
                        <div className="space-y-6">
                            <div>
                                <h1 className="text-xl font-bold text-gray-900 mb-2">{product.name}</h1>
                                <div className="flex items-center space-x-2 mb-4">
                                    {renderStars(avgRating)}
                                    <span className="text-xs text-gray-600">
                                        ({avgRating.toFixed(1)}) {reviews.length} đánh giá
                                    </span>
                                </div>
                            </div>

                            {/* Price */}
                            <div className="space-y-2">
                                <div className="flex items-center space-x-4">
                                    <span className="text-2xl font-bold text-red-600">
                                        {formatPrice(calculateDiscountPrice(product.price, product.discount))}
                                    </span>
                                    {product.discount > 0 && (
                                        <>
                                            <span className="text-lg text-gray-500 line-through">
                                                {formatPrice(product.price)}
                                            </span>
                                            <span className="bg-red-100 text-red-800 px-2 py-1 rounded-full text-xs font-medium">
                                                -{product.discount}%
                                            </span>
                                        </>
                                    )}
                                </div>
                            </div>

                            {/* Color Selection */}
                            {product.colors && product.colors.length > 0 && (
                                <div>
                                    <h3 className="text-base font-semibold text-gray-900 mb-3">Màu sắc</h3>
                                    <div className="flex flex-wrap gap-2">
                                        {product.colors.map((color) => (
                                            <button
                                                key={color._id}
                                                onClick={() => handleColorSelect(color)}
                                                className={`flex items-center space-x-2 px-3 py-2 rounded-lg border-2 transition-all ${
                                                    selectedColor?._id === color._id
                                                        ? 'border-red-500 bg-red-50 text-red-700'
                                                        : 'border-gray-200 hover:border-gray-300 text-gray-700'
                                                }`}
                                            >
                                                <span className="text-xs font-medium">{color.name}</span>
                                                {selectedColor?._id === color._id && <Check className="w-3 h-3" />}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Size Selection */}
                            {product.variants && product.variants.length > 0 && (
                                <div>
                                    <h3 className="text-base font-semibold text-gray-900 mb-3">Kích thước</h3>
                                    <div className="flex flex-wrap gap-2">
                                        {product.variants.map((variant) => (
                                            <button
                                                key={variant._id}
                                                onClick={() => handleSizeSelect(variant)}
                                                disabled={variant.stock === 0}
                                                className={`px-3 py-2 rounded-lg border-2 transition-all ${
                                                    selectedSize?._id === variant._id
                                                        ? 'border-red-500 bg-red-50 text-red-700'
                                                        : variant.stock === 0
                                                        ? 'border-gray-200 bg-gray-100 text-gray-400 cursor-not-allowed'
                                                        : 'border-gray-200 hover:border-gray-300 text-gray-700'
                                                }`}
                                            >
                                                <span className="text-xs font-medium">{variant.size}</span>
                                                {variant.stock === 0 && (
                                                    <span className="text-xs block text-red-500">Hết hàng</span>
                                                )}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Quantity */}
                            <div>
                                <h3 className="text-base font-semibold text-gray-900 mb-3">Số lượng</h3>
                                <div className="flex items-center space-x-4">
                                    <div className="flex items-center border border-gray-300 rounded-lg">
                                        <button
                                            onClick={() => handleQuantityChange(-1)}
                                            disabled={quantity <= 1}
                                            className="p-2 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
                                        >
                                            <Minus className="w-3 h-3" />
                                        </button>
                                        <input
                                            type="number"
                                            min={1}
                                            max={selectedSize?.stock || 1}
                                            value={quantity}
                                            onChange={(e) => {
                                                const val = parseInt(e.target.value);
                                                const max = selectedSize?.stock || 1;
                                                if (!isNaN(val) && val >= 1 && val <= max) {
                                                    setQuantity(val);
                                                }
                                            }}
                                            className="w-12 text-center py-2 text-sm font-medium border-x border-gray-300 focus:outline-none"
                                        />
                                        <button
                                            onClick={() => handleQuantityChange(1)}
                                            disabled={quantity >= (selectedSize?.stock || 1)}
                                            className="p-2 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
                                        >
                                            <Plus className="w-3 h-3" />
                                        </button>
                                    </div>
                                    <span className="text-xs text-gray-600">
                                        {selectedSize?.stock || 0} sản phẩm có sẵn
                                    </span>
                                </div>
                            </div>

                            {/* Action Buttons */}
                            <div className="space-y-4">
                                <div className="flex space-x-3">
                                    <button
                                        onClick={handleAddToCart}
                                        className="flex-1 bg-red-600 text-white py-2 px-4 rounded-lg font-semibold hover:bg-red-700 transition-colors flex items-center justify-center space-x-2 text-sm"
                                    >
                                        <ShoppingCart className="w-4 h-4" />
                                        <span>Thêm vào giỏ hàng</span>
                                    </button>
                                    <button
                                        onClick={handleAddToFavourite}
                                        className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                                    >
                                        <Heart
                                            className="w-4 h-4"
                                            color={product?.favourite?.includes(dataUser._id) ? 'red' : 'gray'}
                                        />
                                    </button>
                                </div>
                                <button
                                    onClick={handleBuyNow}
                                    className="w-full bg-black text-white py-2 px-4 rounded-lg font-semibold hover:bg-gray-800 transition-colors text-sm"
                                >
                                    Mua ngay
                                </button>
                            </div>

                            {/* Product Features */}
                            <div className="border-t pt-4">
                                <h3 className="text-base font-semibold text-gray-900 mb-3">Đặc điểm nổi bật</h3>
                                <ul className="space-y-1 text-xs text-gray-600">
                                    <li className="flex items-center space-x-2">
                                        <Check className="w-3 h-3 text-green-500" />
                                        <span>Chất liệu cao cấp, bền đẹp</span>
                                    </li>
                                    <li className="flex items-center space-x-2">
                                        <Check className="w-3 h-3 text-green-500" />
                                        <span>Thiết kế thời trang, dễ phối đồ</span>
                                    </li>
                                    <li className="flex items-center space-x-2">
                                        <Check className="w-3 h-3 text-green-500" />
                                        <span>Đế giày êm ái, chống trượt</span>
                                    </li>
                                    <li className="flex items-center space-x-2">
                                        <Check className="w-3 h-3 text-green-500" />
                                        <span>Bảo hành 6 tháng</span>
                                    </li>
                                </ul>
                            </div>
                        </div>
                    </div>

                    {/* Product Description */}
                    <div className="border-t bg-gray-50 p-6">
                        <h3 className="text-base font-semibold text-gray-900 mb-3">Mô tả sản phẩm</h3>
                        <div
                            className="prose max-w-none text-gray-600 text-sm"
                            dangerouslySetInnerHTML={{ __html: product.description }}
                        />
                    </div>

                    {/* Reviews Section */}
                    <div className="border-t bg-white p-6">
                        <div className="flex items-center justify-between mb-6">
                            <h3 className="text-xl font-bold text-gray-900">Đánh giá sản phẩm</h3>
                            <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-medium">
                                {reviews.length} đánh giá
                            </span>
                        </div>

                        {reviews.length === 0 ? (
                            <div className="text-center py-8">
                                <p className="text-gray-500">Chưa có đánh giá nào cho sản phẩm này</p>
                            </div>
                        ) : (
                            <div className="space-y-6">
                                {(showAllReviews ? reviews : reviews.slice(0, 3)).map((review) => (
                                    <div key={review._id} className="border border-gray-200 rounded-lg p-4 bg-gray-50">
                                        <div className="flex items-start justify-between mb-3">
                                            <div className="flex items-center space-x-3">
                                                <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center">
                                                    <span className="text-white font-semibold text-sm">
                                                        {review?.userId?.fullName
                                                            ? review.userId.fullName.charAt(0).toUpperCase()
                                                            : 'U'}
                                                    </span>
                                                </div>
                                                <div>
                                                    <h4 className="font-semibold text-gray-900 text-sm">
                                                        {review?.userId?.fullName || 'Người dùng ẩn danh'}
                                                    </h4>
                                                    {renderStars(review.rating)}
                                                </div>
                                            </div>
                                            <span className="text-xs text-gray-500">
                                                {formatDate(review.createdAt)}
                                            </span>
                                        </div>
                                        <div className="mb-4">
                                            <p className="text-gray-700 text-sm leading-relaxed">
                                                {review.comment || 'Người dùng chưa để lại bình luận'}
                                            </p>
                                        </div>
                                        {review.images && review.images.length > 0 && (
                                            <div className="flex space-x-2 mb-3">
                                                {review.images.map((image, index) => (
                                                    <img
                                                        key={index}
                                                        src={`${import.meta.env.VITE_API_URL}/uploads/previewProducts/${image}`}
                                                        alt={`Review ${index + 1}`}
                                                        className="w-16 h-16 object-cover rounded-lg border border-gray-200"
                                                    />
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                ))}

                                {reviews.length > 3 && (
                                    <div className="text-center pt-4">
                                        <button
                                            onClick={() => setShowAllReviews(!showAllReviews)}
                                            className="bg-gray-100 text-gray-700 px-6 py-2 rounded-lg hover:bg-gray-200 transition-colors text-sm font-medium"
                                        >
                                            {showAllReviews ? 'Thu gọn' : `Xem thêm ${reviews.length - 3} đánh giá`}
                                        </button>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>

                    {/* Related Products Section */}
                    <div className="bg-gray-50 p-8 rounded-2xl">
                        <div className="text-center mb-8">
                            <h2 className="text-2xl font-bold text-gray-900 mb-3">Sản Phẩm Liên Quan</h2>
                            <div className="w-20 h-1 bg-gradient-to-r from-red-500 to-pink-500 mx-auto rounded-full"></div>
                            <p className="text-gray-600 mt-3">Khám phá thêm những sản phẩm tương tự</p>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                            {productRelated.map((item) => (
                                <div
                                    key={item._id}
                                    className="transform hover:scale-105 transition-all duration-300 hover:shadow-lg"
                                >
                                    <CardBody product={item} />
                                </div>
                            ))}
                        </div>
                        {productRelated.length === 0 && (
                            <div className="text-center py-12">
                                <div className="text-gray-400 text-6xl mb-4">📦</div>
                                <h3 className="text-xl font-semibold text-gray-700 mb-2">Chưa có sản phẩm liên quan</h3>
                                <p className="text-gray-500">Hãy khám phá các sản phẩm khác trong cửa hàng</p>
                            </div>
                        )}
                    </div>
                </div>
            </main>

            <Footer />
        </div>
    );
}

export default DetailProduct;
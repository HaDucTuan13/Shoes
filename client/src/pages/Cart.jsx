import { useEffect, useState } from 'react';
import Footer from '../components/Footer';
import Header from '../components/Header';
import { requestApplyCoupon, requestRemoveItemFromCart, requestUpdateCartQuantity } from '../config/CartRequest';
import { Minus, Plus, Trash2, ShoppingBag, CreditCard, Truck, Shield, Tag, X } from 'lucide-react';
import { useStore } from '../hooks/useStore';
import { toast } from 'react-toastify';
import { Link } from 'react-router-dom';

function Cart() {
    const { cartData, fetchCart, couponData } = useStore();
    const [selectedCoupon, setSelectedCoupon] = useState(null);
    const [couponCode, setCouponCode] = useState('');
    const [isApplyingCoupon, setIsApplyingCoupon] = useState(false);

    const formatPrice = (price) => {
        return new Intl.NumberFormat('vi-VN', {
            style: 'currency',
            currency: 'VND',
        }).format(price);
    };

    const calculateDiscountPrice = (originalPrice, discount) => {
        return originalPrice - (originalPrice * discount) / 100;
    };

    const calculateTotalPrice = (products) => {
        return products.reduce((sum, product) => {
            const discountedPrice = calculateDiscountPrice(product.price, product.discount);
            return sum + discountedPrice * product.quantity;
        }, 0);
    };

    const calculateCouponDiscount = (totalPrice, coupon) => {
        if (!coupon) return 0;
        return (totalPrice * coupon.discount) / 100;
    };

    const calculateFinalTotal = (products, coupon) => {
        const subtotal = calculateTotalPrice(products);
        const couponDiscount = calculateCouponDiscount(subtotal, coupon);
        return subtotal - couponDiscount;
    };

    const handleApplyCoupon = async () => {
        if (!couponCode.trim()) {
            toast.error('Vui lòng nhập mã giảm giá');
            return;
        }

        await requestApplyCoupon({
            couponCode: couponCode.trim(),
        });

        const coupon = couponData?.find((c) => c.nameCoupon === couponCode.trim());
        if (!coupon) {
            toast.error('Mã giảm giá không hợp lệ');
            return;
        }

        const subtotal = calculateTotalPrice(cartData);
        if (subtotal < coupon.minPrice) {
            toast.error(`Đơn hàng tối thiểu ${formatPrice(coupon.minPrice)} để sử dụng mã này`);
            return;
        }

        setSelectedCoupon(coupon);
        toast.success(`Áp dụng mã giảm giá ${coupon.nameCoupon} thành công!`);
    };

    const handleRemoveCoupon = () => {
        setSelectedCoupon(null);
        setCouponCode('');
        toast.info('Đã xóa mã giảm giá');
    };

    const handleQuantityChange = async (index, change) => {
        try {
            const data = {
                itemId: cartData[index]._id,
                quantity: cartData[index].quantity + change,
            };
            await requestUpdateCartQuantity(data);
            fetchCart();
        } catch (error) {
            toast.error(error.response.data.message);
        }
    };

    const handleRemoveItem = async (index) => {
        if (!cartData) return;

        try {
            const data = {
                itemId: cartData[index]._id,
            };
            await requestRemoveItemFromCart(data);
            fetchCart();
        } catch (error) {
            toast.error(error.response.data.message);
        }
    };

    // if (isLoading) {
    //     return (
    //         <div className="min-h-screen bg-gray-50">
    //             <Header />
    //             <div className="flex items-center justify-center min-h-[60vh]">
    //                 <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-red-500"></div>
    //             </div>
    //             <Footer />
    //         </div>
    //     );
    // }

    if (!cartData) {
        return (
            <div className="min-h-screen bg-gray-50">
                <Header />
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                    <div className="text-center py-16">
                        <ShoppingBag className="w-24 h-24 text-gray-300 mx-auto mb-4" />
                        <h2 className="text-2xl font-bold text-gray-800 mb-2">Giỏ hàng trống</h2>
                        <p className="text-gray-600 mb-8">Bạn chưa có sản phẩm nào trong giỏ hàng</p>
                        <button className="bg-red-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-red-700 transition-colors">
                            Tiếp tục mua sắm
                        </button>
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
                <div className="mb-6">
                    <h1 className="text-2xl font-bold text-gray-900">Giỏ hàng của bạn</h1>
                    <p className="text-gray-600 text-sm mt-1">{cartData.length} sản phẩm trong giỏ hàng</p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Cart Items */}
                    <div className="lg:col-span-2 space-y-6">
                        <div className="bg-white rounded-lg shadow-sm overflow-hidden">
                            <div className="p-4 border-b border-gray-200">
                                <h2 className="text-lg font-semibold text-gray-900">Sản phẩm</h2>
                            </div>

                            <div className="divide-y divide-gray-200">
                                {cartData.map((product, index) => (
                                    <div key={`${product._id}-${index}`} className="p-4">
                                        <div className="flex items-center space-x-4">
                                            {/* Product Image */}
                                            <div className="flex-shrink-0">
                                                <img
                                                    src={`${import.meta.env.VITE_API_URL}/uploads/products/${
                                                        product.image
                                                    }`}
                                                    alt={product.name}
                                                    className="w-20 h-20 object-cover rounded-lg"
                                                />
                                            </div>

                                            {/* Product Info */}
                                            <div className="flex-1 min-w-0">
                                                <h3 className="text-sm font-medium text-gray-900 truncate">
                                                    {product.name}
                                                </h3>
                                                <div className="mt-1 flex items-center space-x-4 text-xs text-gray-500">
                                                    <span>Màu: {product.color}</span>
                                                    <span>Size: {product.size}</span>
                                                </div>
                                                <div className="mt-2">
                                                    <div className="flex items-center space-x-2">
                                                        <span className="text-sm font-semibold text-red-600">
                                                            {formatPrice(
                                                                calculateDiscountPrice(product.price, product.discount),
                                                            )}
                                                        </span>
                                                        {product.discount > 0 && (
                                                            <>
                                                                <span className="text-xs text-gray-500 line-through">
                                                                    {formatPrice(product.price)}
                                                                </span>
                                                                <span className="bg-red-100 text-red-800 px-1 py-0.5 rounded text-xs font-medium">
                                                                    -{product.discount}%
                                                                </span>
                                                            </>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Quantity Controls */}
                                            <div className="flex items-center space-x-2">
                                                <button
                                                    onClick={() => handleQuantityChange(index, -1)}
                                                    className="p-1 rounded-full hover:bg-gray-100 transition-colors"
                                                >
                                                    <Minus className="w-4 h-4" />
                                                </button>
                                                <span className="w-8 text-center text-sm font-medium">
                                                    {product.quantity}
                                                </span>
                                                <button
                                                    onClick={() => handleQuantityChange(index, 1)}
                                                    className="p-1 rounded-full hover:bg-gray-100 transition-colors"
                                                >
                                                    <Plus className="w-4 h-4" />
                                                </button>
                                            </div>

                                            {/* Total Price */}
                                            <div className="text-right">
                                                <div className="text-sm font-semibold text-gray-900">
                                                    {formatPrice(
                                                        calculateDiscountPrice(product.price, product.discount) *
                                                            product.quantity,
                                                    )}
                                                </div>
                                            </div>

                                            {/* Remove Button */}
                                            <button
                                                onClick={() => handleRemoveItem(index)}
                                                className="p-2 text-gray-400 hover:text-red-500 transition-colors"
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Coupon Section */}
                        <div className="bg-white rounded-lg shadow-sm p-6">
                            <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                                <Tag className="w-5 h-5 mr-2 text-red-600" />
                                Mã giảm giá
                            </h2>

                            {!selectedCoupon ? (
                                <div className="space-y-4">
                                    <div className="flex space-x-2">
                                        <input
                                            type="text"
                                            value={couponCode}
                                            onChange={(e) => setCouponCode(e.target.value)}
                                            placeholder="Nhập mã giảm giá"
                                            className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
                                        />
                                        <button
                                            onClick={handleApplyCoupon}
                                            disabled={isApplyingCoupon}
                                            className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50"
                                        >
                                            {isApplyingCoupon ? 'Đang áp dụng...' : 'Áp dụng'}
                                        </button>
                                    </div>

                                    {/* Available Coupons */}
                                    {couponData && couponData.length > 0 && (
                                        <div>
                                            <p className="text-sm text-gray-600 mb-2">Mã giảm giá có sẵn:</p>
                                            <div className="space-y-2">
                                                {couponData.map((coupon) => (
                                                    <div
                                                        key={coupon._id}
                                                        className="flex items-center justify-between p-3 bg-gray-50 rounded-lg cursor-pointer hover:bg-gray-100 transition-colors"
                                                        onClick={() => setCouponCode(coupon.nameCoupon)}
                                                    >
                                                        <div>
                                                            <div className="font-medium text-gray-900">
                                                                {coupon.nameCoupon}
                                                            </div>
                                                            <div className="text-sm text-gray-600">
                                                                Giảm {coupon.discount}% - Tối thiểu{' '}
                                                                {formatPrice(coupon.minPrice)}
                                                            </div>
                                                        </div>
                                                        <div className="text-sm text-red-600 font-medium">
                                                            -{coupon.discount}%
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            ) : (
                                <div className="flex items-center justify-between p-4 bg-green-50 border border-green-200 rounded-lg">
                                    <div className="flex items-center space-x-3">
                                        <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                                            <Tag className="w-4 h-4 text-green-600" />
                                        </div>
                                        <div>
                                            <div className="font-medium text-green-900">
                                                {selectedCoupon.nameCoupon}
                                            </div>
                                            <div className="text-sm text-green-600">
                                                Giảm {selectedCoupon.discount}% - Tiết kiệm{' '}
                                                {formatPrice(
                                                    calculateCouponDiscount(
                                                        calculateTotalPrice(cartData),
                                                        selectedCoupon,
                                                    ),
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                    <button
                                        onClick={handleRemoveCoupon}
                                        className="p-1 text-green-600 hover:text-green-800 transition-colors"
                                    >
                                        <X className="w-4 h-4" />
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Order Summary */}
                    <div className="lg:col-span-1">
                        <div className="bg-white rounded-lg shadow-sm p-6 sticky top-4">
                            <h2 className="text-lg font-semibold text-gray-900 mb-4">Tóm tắt đơn hàng</h2>

                            {/* Price Breakdown */}
                            <div className="space-y-3 mb-6">
                                <div className="flex justify-between text-sm">
                                    <span className="text-gray-600"> Tạm tính ({cartData.length} sản phẩm)</span>
                                    <span className="font-medium">{formatPrice(calculateTotalPrice(cartData))}</span>
                                </div>

                                {selectedCoupon && (
                                    <div className="flex justify-between text-sm">
                                        <span className="text-gray-600">Giảm giá ({selectedCoupon.nameCoupon})</span>
                                        <span className="font-medium text-green-600">
                                            -
                                            {formatPrice(
                                                calculateCouponDiscount(calculateTotalPrice(cartData), selectedCoupon),
                                            )}
                                        </span>
                                    </div>
                                )}

                                <div className="flex justify-between text-sm">
                                    <span className="text-gray-600">Phí vận chuyển</span>
                                    <span className="font-medium text-green-600">Miễn phí</span>
                                </div>
                                <div className="border-t border-gray-200 pt-3">
                                    <div className="flex justify-between text-base font-semibold">
                                        <span>Tổng cộng</span>
                                        <span className="text-red-600">
                                            {formatPrice(calculateFinalTotal(cartData, selectedCoupon))}
                                        </span>
                                    </div>
                                </div>
                            </div>

                            {/* Checkout Button */}
                            <Link to="/checkout">
                                <button className="w-full bg-red-600 text-white py-3 px-4 rounded-lg font-semibold hover:bg-red-700 transition-colors mb-4">
                                    Tiến hành thanh toán
                                </button>
                            </Link>

                            {/* Security Features */}
                            <div className="space-y-3 text-xs text-gray-500">
                                <div className="flex items-center space-x-2">
                                    <Shield className="w-4 h-4" />
                                    <span>Thanh toán an toàn</span>
                                </div>
                                <div className="flex items-center space-x-2">
                                    <Truck className="w-4 h-4" />
                                    <span>Giao hàng nhanh chóng</span>
                                </div>
                                <div className="flex items-center space-x-2">
                                    <CreditCard className="w-4 h-4" />
                                    <span>Hỗ trợ nhiều phương thức thanh toán</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Continue Shopping */}
                <div className="mt-8 text-center">
                    <button className="text-red-600 hover:text-red-700 font-medium text-sm">← Tiếp tục mua sắm</button>
                </div>
            </main>

            <Footer />
        </div>
    );
}

export default Cart;

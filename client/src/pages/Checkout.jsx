import { useEffect, useState } from 'react';
import Footer from '../components/Footer';
import Header from '../components/Header';
import { useStore } from '../hooks/useStore';
import { requestGetCart, requestUpdateInfoCart } from '../config/CartRequest';
import { CreditCard, MapPin, Phone, User, Package, Tag, CheckCircle, Smartphone, Wallet } from 'lucide-react';
import { requestCreatePayment } from '../config/PaymentsRequest';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';

function Checkout() {
    const [cartData, setCartData] = useState([]);
    const [couponData, setCouponData] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [formData, setFormData] = useState({
        fullName: '',
        phone: '',
        address: '',
    });
    const [paymentMethod, setPaymentMethod] = useState('cod');

    useEffect(() => {
        const fetchCart = async () => {
            try {
                setIsLoading(true);
                const res = await requestGetCart();
                setCartData(res.metadata.items);
                setCouponData(res.metadata.coupon);
            } catch (error) {
                console.error('Error fetching cart:', error);
            } finally {
                setIsLoading(false);
            }
        };
        fetchCart();
    }, []);

    const formatPrice = (price) => {
        return new Intl.NumberFormat('vi-VN', {
            style: 'currency',
            currency: 'VND',
        }).format(price);
    };

    const calculateSubtotal = () => {
        return cartData.reduce((sum, item) => sum + item.subtotal, 0);
    };

    const calculateCouponDiscount = () => {
        const appliedCoupon = cartData.find((item) => item.coupon);
        return appliedCoupon ? appliedCoupon.coupon.discountAmount : 0;
    };

    const calculateTotal = () => {
        return calculateSubtotal() - calculateCouponDiscount();
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({
            ...prev,
            [name]: value,
        }));
    };

    const navigate = useNavigate();

    const handleSubmit = async () => {
        if (!formData.fullName || !formData.phone || !formData.address) {
            toast.error('Vui lòng nhập đầy đủ thông tin');
            return;
        }

        const data = {
            fullName: formData.fullName,
            phone: formData.phone,
            address: formData.address,
        };

        try {
            await requestUpdateInfoCart(data);
            if (paymentMethod === 'cod') {
                const res = await requestCreatePayment({ paymentMethod });
                navigate(`/payment/success/${res.metadata._id}`);
            } else if (paymentMethod === 'momo') {
                const res = await requestCreatePayment({ paymentMethod });
                window.location.href = res.metadata.payUrl;
            } else if (paymentMethod === 'vnpay') {
                const res = await requestCreatePayment({ paymentMethod });
                window.location.href = res.metadata;
            }
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

    return (
        <div className="min-h-screen bg-gray-50">
            <Header />

            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="mb-6">
                    <h1 className="text-2xl font-bold text-gray-900">Thanh toán</h1>
                    <p className="text-gray-600 text-sm mt-1">Hoàn tất đơn hàng của bạn</p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Customer Information Form */}
                    <div className="lg:col-span-2 space-y-6">
                        {/* Customer Details */}
                        <div className="bg-white rounded-lg shadow-sm p-6">
                            <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                                <User className="w-5 h-5 mr-2 text-red-600" />
                                Thông tin giao hàng
                            </h2>

                            <form onSubmit={handleSubmit} className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Họ và tên *</label>
                                    <input
                                        type="text"
                                        name="fullName"
                                        value={formData.fullName}
                                        onChange={handleInputChange}
                                        required
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
                                        placeholder="Nhập họ và tên"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Số điện thoại *
                                    </label>
                                    <input
                                        type="tel"
                                        name="phone"
                                        value={formData.phone}
                                        onChange={handleInputChange}
                                        required
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
                                        placeholder="Nhập số điện thoại"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Địa chỉ giao hàng *
                                    </label>
                                    <textarea
                                        name="address"
                                        value={formData.address}
                                        onChange={handleInputChange}
                                        required
                                        rows={3}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
                                        placeholder="Nhập địa chỉ giao hàng chi tiết"
                                    />
                                </div>
                            </form>
                        </div>

                        {/* Payment Method */}
                        <div className="bg-white rounded-lg shadow-sm p-6">
                            <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                                <CreditCard className="w-5 h-5 mr-2 text-red-600" />
                                Phương thức thanh toán
                            </h2>

                            <div className="space-y-3">
                                <label className="flex items-center p-3 border-2 border-red-200 bg-red-50 rounded-lg cursor-pointer hover:bg-red-100">
                                    <input
                                        type="radio"
                                        name="payment"
                                        value="cod"
                                        className="mr-3"
                                        defaultChecked
                                        onChange={(e) => setPaymentMethod(e.target.value)}
                                    />
                                    <div className="flex items-center justify-between w-full">
                                        <div className="flex items-center">
                                            <MapPin className="w-5 h-5 mr-2 text-red-600" />
                                            <span className="font-medium text-red-800">
                                                Thanh toán khi nhận hàng (COD)
                                            </span>
                                        </div>
                                        <span className="text-xs text-red-600 font-medium">Khuyến nghị</span>
                                    </div>
                                </label>

                                <label className="flex items-center p-3 border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50">
                                    <input
                                        type="radio"
                                        name="payment"
                                        value="momo"
                                        className="mr-3"
                                        onChange={(e) => setPaymentMethod(e.target.value)}
                                    />
                                    <div className="flex items-center justify-between w-full">
                                        <div className="flex items-center">
                                            <Smartphone className="w-5 h-5 mr-2 text-pink-600" />
                                            <span className="font-medium">Ví điện tử MoMo</span>
                                        </div>
                                        <span className="text-xs text-gray-500">Nhanh chóng & An toàn</span>
                                    </div>
                                </label>

                                <label className="flex items-center p-3 border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50">
                                    <input
                                        type="radio"
                                        name="payment"
                                        value="vnpay"
                                        className="mr-3"
                                        onChange={(e) => setPaymentMethod(e.target.value)}
                                    />
                                    <div className="flex items-center justify-between w-full">
                                        <div className="flex items-center">
                                            <Wallet className="w-5 h-5 mr-2 text-blue-600" />
                                            <span className="font-medium">VNPay</span>
                                        </div>
                                        <span className="text-xs text-gray-500">Đa dạng phương thức</span>
                                    </div>
                                </label>

                                <label className="flex items-center p-3 border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50">
                                    <input
                                        type="radio"
                                        name="payment"
                                        value="bank"
                                        className="mr-3"
                                        onChange={(e) => setPaymentMethod(e.target.value)}
                                    />
                                    <div className="flex items-center">
                                        <CreditCard className="w-5 h-5 mr-2 text-gray-600" />
                                        <span className="font-medium">Chuyển khoản ngân hàng</span>
                                    </div>
                                </label>
                            </div>

                            {/* Payment Note */}
                            <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                                <div className="flex items-start space-x-2">
                                    <div className="w-5 h-5 bg-blue-100 rounded-full flex items-center justify-center mt-0.5">
                                        <span className="text-blue-600 text-xs font-bold">i</span>
                                    </div>
                                    <div className="text-xs text-blue-800">
                                        <p className="font-medium mb-1">Lưu ý về thanh toán:</p>
                                        <ul className="space-y-1 text-blue-700">
                                            <li>
                                                • <strong>COD:</strong> Thanh toán bằng tiền mặt khi nhận hàng
                                            </li>
                                            <li>
                                                • <strong>MoMo:</strong> Thanh toán qua ứng dụng MoMo
                                            </li>
                                            <li>
                                                • <strong>VNPay:</strong> Hỗ trợ thẻ ATM, Internet Banking, QR Code
                                            </li>
                                            <li>
                                                • <strong>Chuyển khoản:</strong> Chuyển khoản trực tiếp vào tài khoản
                                                ngân hàng
                                            </li>
                                        </ul>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Order Items */}
                        <div className="bg-white rounded-lg shadow-sm p-6">
                            <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                                <Package className="w-5 h-5 mr-2 text-red-600" />
                                Sản phẩm đã chọn
                            </h2>

                            <div className="space-y-4">
                                {cartData.map((item, index) => (
                                    <div
                                        key={item._id}
                                        className="flex items-center space-x-4 p-3 bg-gray-50 rounded-lg"
                                    >
                                        <img
                                            src={`${import.meta.env.VITE_API_URL}/uploads/products/${item.image}`}
                                            alt={item.name}
                                            className="w-16 h-16 object-cover rounded-lg"
                                        />
                                        <div className="flex-1">
                                            <h3 className="font-medium text-gray-900 text-sm">{item.name}</h3>
                                            <div className="text-xs text-gray-500 mt-1">
                                                <span>Màu: {item.color}</span>
                                                <span className="mx-2">•</span>
                                                <span>Size: {item.size}</span>
                                                <span className="mx-2">•</span>
                                                <span>Số lượng: {item.quantity}</span>
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <div className="text-sm font-semibold text-gray-900">
                                                {formatPrice(item.priceAfterDiscount * item.quantity)}
                                            </div>
                                            {item.discount > 0 && (
                                                <div className="text-xs text-gray-500 line-through">
                                                    {formatPrice(item.price * item.quantity)}
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Order Summary */}
                    <div className="lg:col-span-1">
                        <div className="bg-white rounded-lg shadow-sm p-6 sticky top-4">
                            <h2 className="text-lg font-semibold text-gray-900 mb-4">Tóm tắt đơn hàng</h2>

                            {/* Price Breakdown */}
                            <div className="space-y-3 mb-6">
                                <div className="flex justify-between text-sm">
                                    <span className="text-gray-600">Tạm tính ({cartData.length} sản phẩm)</span>
                                    <span className="font-medium">{formatPrice(calculateSubtotal())}</span>
                                </div>

                                {calculateCouponDiscount() > 0 && (
                                    <div className="flex justify-between text-sm">
                                        <span className="text-gray-600 flex items-center">
                                            <Tag className="w-4 h-4 mr-1" />
                                            Giảm giá
                                        </span>
                                        <span className="font-medium text-green-600">
                                            -{formatPrice(calculateCouponDiscount())}
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
                                        <span className="text-red-600">{formatPrice(calculateTotal())}</span>
                                    </div>
                                </div>
                            </div>

                            {/* Place Order Button */}
                            <button
                                onClick={handleSubmit}
                                className="w-full bg-red-600 text-white py-3 px-4 rounded-lg font-semibold hover:bg-red-700 transition-colors mb-4 flex items-center justify-center"
                            >
                                <CheckCircle className="w-5 h-5 mr-2" />
                                Đặt hàng
                            </button>

                            {/* Security Features */}
                            <div className="space-y-3 text-xs text-gray-500">
                                <div className="flex items-center space-x-2">
                                    <CheckCircle className="w-4 h-4 text-green-500" />
                                    <span>Thanh toán an toàn</span>
                                </div>
                                <div className="flex items-center space-x-2">
                                    <Package className="w-4 h-4 text-green-500" />
                                    <span>Giao hàng nhanh chóng</span>
                                </div>
                                <div className="flex items-center space-x-2">
                                    <Phone className="w-4 h-4 text-green-500" />
                                    <span>Hỗ trợ 24/7</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </main>

            <Footer />
        </div>
    );
}

export default Checkout;

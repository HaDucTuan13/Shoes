import { Eye, Heart, ShoppingCart } from 'lucide-react';
import { Link } from 'react-router-dom';
import { requestCreateFavourite } from '../config/FavouriteRequest';
import { toast } from 'react-toastify';
import { requestAddToCart } from '../config/CartRequest';
import { useStore } from '../hooks/useStore';

function discountPrice(price, discount) {
    return price - (price * discount) / 100;
}

function CardBody({ product }) {
    const sumStock = product?.variants?.reduce((acc, curr) => acc + curr.stock, 0);
    const hasDiscount = product?.discount > 0;
    const finalPrice = hasDiscount ? discountPrice(product?.price, product?.discount) : product?.price;

    const { fetchCart } = useStore();

    return (
        <div className="w-full relative group bg-white rounded-xl shadow-sm hover:shadow-xl transition-all duration-300 overflow-hidden border border-gray-100">
            {/* Product Image Container */}
            <div>
                <Link to={`/product/${product?._id}`}>
                    <img
                        src={`${import.meta.env.VITE_URL_IMAGE}/uploads/products/${product?.colors?.[0]?.images}`}
                        alt={product?.name}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                    />
                </Link>

                {/* Discount Badge */}
                {hasDiscount && (
                    <div className="absolute top-3 left-3">
                        <div className="bg-red-500 text-white px-2 py-1 rounded-full text-xs font-bold shadow-lg">
                            -{product?.discount}%
                        </div>
                    </div>
                )}

                {/* Featured Badge */}
                {product?.isFeatured && (
                    <div className="absolute top-3 right-3">
                        <div className="bg-yellow-400 text-yellow-900 px-2 py-1 rounded-full text-xs font-bold shadow-lg">
                            HOT
                        </div>
                    </div>
                )}

                {/* Hover Overlay */}
            </div>

            {/* Product Info */}
            <div className="p-5">
                {/* Product Name */}
                <h3 className="font-semibold text-gray-900 text-base mb-3 line-clamp-2 leading-relaxed  transition-colors duration-200">
                    {product?.name}
                </h3>

                {/* Price Section */}
                <div className="space-y-2">
                    <div className="flex items-center gap-2">
                        {hasDiscount && (
                            <span className="text-gray-400 text-sm line-through">
                                {product?.price?.toLocaleString()} VND
                            </span>
                        )}
                        <span className="text-red-600 font-bold text-lg">{finalPrice?.toLocaleString()} VND</span>
                    </div>

                    {/* Stock Status */}
                    <div className="flex items-center justify-between">
                        <div
                            className={`px-3 py-1 rounded-full text-xs font-medium ${
                                sumStock === 0
                                    ? 'bg-red-100 text-red-600'
                                    : sumStock < 10
                                    ? 'bg-yellow-100 text-yellow-600'
                                    : 'bg-green-100 text-green-600'
                            }`}
                        >
                            {sumStock === 0 ? 'Hết hàng' : sumStock < 10 ? 'Sắp hết' : 'Còn hàng'}
                        </div>

                        {sumStock > 0 && <span className="text-xs text-gray-500">{sumStock} sản phẩm</span>}
                    </div>
                </div>
            </div>
        </div>
    );
}

export default CardBody;

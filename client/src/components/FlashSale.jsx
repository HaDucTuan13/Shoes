import Slider from 'react-slick';
import 'slick-carousel/slick/slick.css';
import 'slick-carousel/slick/slick-theme.css';
import { useEffect, useState } from 'react';
import { requestGetFlashSaleByDate } from '../config/FlashSale';
import { Link } from 'react-router-dom';

function FlashSale() {
    const [flashSale, setFlashSale] = useState([]);
    const [timeLeft, setTimeLeft] = useState({});

    useEffect(() => {
        const fetchFlashSale = async () => {
            const res = await requestGetFlashSaleByDate();
            setFlashSale(res.metadata);
        };
        fetchFlashSale();
    }, []);

    // Countdown timer for flash sales
    useEffect(() => {
        const timer = setInterval(() => {
            const now = new Date().getTime();
            const newTimeLeft = {};

            flashSale.forEach((sale) => {
                const endTime = new Date(sale.endDate).getTime();
                const distance = endTime - now;

                if (distance > 0) {
                    newTimeLeft[sale._id] = {
                        days: Math.floor(distance / (1000 * 60 * 60 * 24)),
                        hours: Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
                        minutes: Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60)),
                        seconds: Math.floor((distance % (1000 * 60)) / 1000),
                    };
                } else {
                    newTimeLeft[sale._id] = null;
                }
            });

            setTimeLeft(newTimeLeft);
        }, 1000);

        return () => clearInterval(timer);
    }, [flashSale]);

    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('vi-VN', {
            style: 'currency',
            currency: 'VND',
        }).format(amount);
    };

    const calculateDiscountPrice = (originalPrice, discount) => {
        return originalPrice - (originalPrice * discount) / 100;
    };

    const sliderSettings = {
        dots: false,
        infinite: true,
        speed: 500,
        slidesToShow: 5,
        slidesToScroll: 2,
        autoplay: true,
        autoplaySpeed: 4000,
        pauseOnHover: true,
        responsive: [
            {
                breakpoint: 1024,
                settings: {
                    slidesToShow: 3,
                    slidesToScroll: 2,
                },
            },
            {
                breakpoint: 768,
                settings: {
                    slidesToShow: 2,
                    slidesToScroll: 1,
                },
            },
            {
                breakpoint: 480,
                settings: {
                    slidesToShow: 1,
                    slidesToScroll: 1,
                },
            },
        ],
    };

    return (
        <div className="bg-[#ed1d24] text-white py-8">
            <div className="w-[90%] mx-auto ">
                {/* Header */}
                <div className="flex items-center mb-6 text-center justify-center">
                    <div className="flex items-center space-x-2 ">
                        <div className="text-yellow-300 text-2xl">⚡</div>
                        <h2 className="text-2xl font-bold ">SIÊU KHUYẾN MÃI</h2>
                    </div>
                </div>

                {/* Products Slider */}
                <div className="mb-6">
                    <Slider {...sliderSettings}>
                        {flashSale.map((sale) => {
                            const product = sale.productId;
                            const discountPrice = calculateDiscountPrice(product.price, sale.discount);
                            const timer = timeLeft[sale._id];

                            return (
                                <div className="px-2" key={sale._id}>
                                    <div className="bg-white rounded-lg shadow-lg overflow-hidden hover:shadow-xl transition-shadow duration-300 cursor-pointer group">
                                        {/* Product Image */}
                                        <div className="relative">
                                            <Link to={`/product/${product._id}`}>
                                                <img
                                                    src={`${import.meta.env.VITE_URL_IMAGE}/uploads/products/${
                                                        product.colors[0]?.images
                                                    }`}
                                                    alt={product.name}
                                                    className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
                                                    onError={(e) => {
                                                        e.target.src =
                                                            'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAMIAAADDCAYAAADQvc6UAAABRWlDQ1BJQ0MgUHJvZmlsZQAAKJFjYGASSSwoyGFhYGDIzSspCnJ3UoiIjFJgf8LAwSDCIMogwMCcmFxc4BgQ4ANUwgCjUcG3awyMIPqyLsis7PPOq3QdDFcvjV3jOD1boQVTPQrgSkktTgbSf4A4LbmgqISBgTEFyFYuLykAsTuAbJEioKOA7DkgdjqEvQHEToKwj4DVhAQ5A9k3gGyB5IxEoBmML4BsnSQk8XQkNtReEOBxcfXxUQg1Mjc0dyHgXNJBSWpFCYh2zi+oLMpMzyhRcASGUqqCZ16yno6CkYGRAQMDKMwhqj/fAIcloxgHQqxAjIHBEugw5sUIsSQpBobtQPdLciLEVJYzMPBHMDBsayhILEqEO4DxG0txmrERhM29nYGBddr//5/DGRjYNRkY/l7////39v///y4Dmn+LgeHANwDrkl1AuO+pmgAAADhlWElmTU0AKgAAAAgAAYdpAAQAAAABAAAAGgAAAAAAAqACAAQAAAABAAAAwqADAAQAAAABAAAAwwAAAAD9b/HnAAAHlklEQVR4Ae3dP3Ik1RUG8E+UDNmyJUu2ZMmSLVmSBUuWLFmyZMmSJVmyZMuSJUu2bMmSJVuyZMmWLVmyZMvSbMmSLdmyJUuyZEmWJUu2ZMmSJUt2ZEuWLNmyJUuWbNmSJUuWLFmy9U=';
                                                    }}
                                                />
                                            </Link>

                                            {/* Discount Badge */}
                                            <div className="absolute top-2 left-2">
                                                <div className="bg-yellow-400 text-red-800 px-2 py-1 rounded-full text-xs font-bold flex items-center">
                                                    <span className="mr-1">🔥</span>-{sale.discount}%
                                                </div>
                                            </div>

                                            {/* Flash Sale Badge */}
                                            <div className="absolute top-2 right-2">
                                                <div className="bg-red-600 text-white px-2 py-1 rounded text-xs font-bold animate-pulse">
                                                    FLASH SALE
                                                </div>
                                            </div>
                                        </div>

                                        {/* Product Info */}
                                        <div className="p-4 text-gray-800">
                                            {/* Product Name */}
                                            <h3 className="font-semibold text-sm mb-2 line-clamp-2 min-h-[2.5rem]">
                                                {product.name}
                                            </h3>

                                            {/* Colors Available */}
                                            <div className="flex items-center mb-2">
                                                <span className="text-xs text-gray-500 mr-2">Màu:</span>
                                                <div className="flex space-x-1">
                                                    {product.colors.slice(0, 3).map((color, index) => (
                                                        <div key={color._id}>
                                                            <span className="text-xs text-gray-500">{color.name}</span>
                                                        </div>
                                                    ))}
                                                    {product.colors.length > 3 && (
                                                        <div className="w-4 h-4 rounded-full bg-gray-200 flex items-center justify-center">
                                                            <span className="text-xs text-gray-600">
                                                                +{product.colors.length - 3}
                                                            </span>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>

                                            {/* Sizes Available */}
                                            {product.variants && product.variants.length > 0 && (
                                                <div className="flex items-center mb-3">
                                                    <span className="text-xs text-gray-500 mr-2">Size:</span>
                                                    <div className="flex space-x-1">
                                                        {product.variants.slice(0, 3).map((variant) => (
                                                            <span
                                                                key={variant._id}
                                                                className="text-xs bg-gray-100 px-2 py-1 rounded"
                                                            >
                                                                {variant.size}
                                                            </span>
                                                        ))}
                                                        {product.variants.length > 3 && (
                                                            <span className="text-xs text-gray-500">...</span>
                                                        )}
                                                    </div>
                                                </div>
                                            )}

                                            {/* Price */}
                                            <div className="mb-3">
                                                <div className="flex items-center space-x-2">
                                                    <span className="text-lg font-bold text-red-600">
                                                        {formatCurrency(discountPrice)}
                                                    </span>
                                                    <span className="text-sm text-gray-500 line-through">
                                                        {formatCurrency(product.price)}
                                                    </span>
                                                </div>
                                                <div className="text-xs text-green-600 font-medium">
                                                    Tiết kiệm {formatCurrency(product.price - discountPrice)}
                                                </div>
                                            </div>

                                            {/* Countdown Timer */}
                                            {timer && (
                                                <div className="bg-red-50 border border-red-200 rounded p-2">
                                                    <div className="text-xs text-red-700 font-medium mb-1 text-center">
                                                        ⏰ Kết thúc sau:
                                                    </div>
                                                    <div className="flex justify-center space-x-1 text-xs">
                                                        {timer.days > 0 && (
                                                            <div className="bg-red-600 text-white px-1 py-1 rounded min-w-[20px] text-center">
                                                                {timer.days}d
                                                            </div>
                                                        )}
                                                        <div className="bg-red-600 text-white px-1 py-1 rounded min-w-[20px] text-center">
                                                            {String(timer.hours).padStart(2, '0')}h
                                                        </div>
                                                        <div className="bg-red-600 text-white px-1 py-1 rounded min-w-[20px] text-center">
                                                            {String(timer.minutes).padStart(2, '0')}m
                                                        </div>
                                                        <div className="bg-red-600 text-white px-1 py-1 rounded min-w-[20px] text-center">
                                                            {String(timer.seconds).padStart(2, '0')}s
                                                        </div>
                                                    </div>
                                                </div>
                                            )}

                                            {/* Stock Info */}
                                            {product.variants && (
                                                <div className="mt-2">
                                                    <div className="text-xs text-gray-500">
                                                        Còn lại:{' '}
                                                        {product.variants.reduce(
                                                            (total, variant) => total + variant.stock,
                                                            0,
                                                        )}{' '}
                                                        sản phẩm
                                                    </div>
                                                    <div className="w-full bg-gray-200 rounded-full h-1.5 mt-1">
                                                        <div
                                                            className="bg-red-600 h-1.5 rounded-full"
                                                            style={{
                                                                width: `${Math.min(
                                                                    100,
                                                                    (product.variants.reduce(
                                                                        (total, variant) => total + variant.stock,
                                                                        0,
                                                                    ) /
                                                                        20) *
                                                                        100,
                                                                )}%`,
                                                            }}
                                                        ></div>
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </Slider>
                </div>
            </div>

            <style jsx>{`
                .bg-red-700 .slick-dots {
                    bottom: -40px;
                }

                .bg-red-700 .slick-dots li button:before {
                    color: white;
                    font-size: 12px;
                    opacity: 0.5;
                }

                .bg-red-700 .slick-dots li.slick-active button:before {
                    color: white;
                    opacity: 1;
                }

                .line-clamp-2 {
                    display: -webkit-box;
                    -webkit-line-clamp: 2;
                    -webkit-box-orient: vertical;
                    overflow: hidden;
                }
            `}</style>
        </div>
    );
}

export default FlashSale;

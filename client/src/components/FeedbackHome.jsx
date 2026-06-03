import { Rate, Typography, Card } from 'antd';
import { Star, Quote } from 'lucide-react';
import Slider from 'react-slick';
import 'slick-carousel/slick/slick.css';
import 'slick-carousel/slick/slick-theme.css';
import { useEffect, useState } from 'react';
import { requestGetAllPreviewProduct } from '../config/PreviewProduct';

const { Title, Text } = Typography;

function FeedbackHome() {
    // Mock data for feedback

    const [previewProduct, setPreviewProduct] = useState([]);

    useEffect(() => {
        const fetchPreviewProduct = async () => {
            const res = await requestGetAllPreviewProduct();
            setPreviewProduct(res.metadata);
        };
        fetchPreviewProduct();
    }, []);

    const feedback = [
        {
            _id: '1',
            userId: {
                fullName: 'Nguyễn Văn An',
                avatar: null,
            },
            rating: 5,
            content:
                'Giày rất chất lượng, đúng như mô tả. Giao hàng nhanh, đóng gói cẩn thận. Tôi sẽ mua lại ở shop này!',
            createdAt: '2024-01-15T10:30:00Z',
            productId: {
                title: 'Giày Nike Air Force 1 White',
                images: ['nike-af1.jpg'],
                destination: 'Giày thể thao',
            },
        },
        {
            _id: '2',
            userId: {
                fullName: 'Trần Thị Bình',
                avatar: null,
            },
            rating: 5,
            content: 'Shop tư vấn rất nhiệt tình, giày đẹp đúng như hình. Size chuẩn, mang rất thoải mái. Recommend!',
            createdAt: '2024-01-10T14:20:00Z',
            productId: {
                title: 'Giày Adidas Ultraboost 22',
                images: ['adidas-ultra.jpg'],
                destination: 'Giày chạy bộ',
            },
        },
        {
            _id: '3',
            userId: {
                fullName: 'Lê Minh Cường',
                avatar: null,
            },
            rating: 4,
            content: 'Giày đẹp, chất lượng tốt. Giá cả hợp lý. Duy nhất là giao hàng hơi lâu một chút nhưng vẫn ok.',
            createdAt: '2024-01-08T16:45:00Z',
            productId: {
                title: 'Giày Vans Old Skool Black',
                images: ['vans-oldskool.jpg'],
                destination: 'Giày lifestyle',
            },
        },
        {
            _id: '4',
            userId: {
                fullName: 'Phạm Thu Hà',
                avatar: null,
            },
            rating: 5,
            content: 'Lần đầu mua online nhưng rất hài lòng. Giày đúng size, đẹp như hình. Sẽ giới thiệu cho bạn bè.',
            createdAt: '2024-01-05T09:15:00Z',
            productId: {
                title: 'Giày Converse Chuck Taylor',
                images: ['converse-chuck.jpg'],
                destination: 'Giày canvas',
            },
        },
        {
            _id: '5',
            userId: {
                fullName: 'Hoàng Đức Minh',
                avatar: null,
            },
            rating: 5,
            content: 'Shop uy tín, giày chính hãng 100%. Mang đi chơi được khen nhiều. Sẽ ủng hộ shop dài dài!',
            createdAt: '2024-01-03T11:30:00Z',
            productId: {
                title: 'Giày New Balance 574',
                images: ['nb-574.jpg'],
                destination: 'Giày retro',
            },
        },
        {
            _id: '6',
            userId: {
                fullName: 'Võ Thị Mai',
                avatar: null,
            },
            rating: 4,
            content: 'Giày đẹp, form dáng chuẩn. Chất liệu da mềm mại. Giá hơi cao nhưng xứng đáng với chất lượng.',
            createdAt: '2024-01-01T20:00:00Z',
            productId: {
                title: 'Giày Puma Suede Classic',
                images: ['puma-suede.jpg'],
                destination: 'Giày da lộn',
            },
        },
    ];

    const sliderSettings = {
        dots: true,
        infinite: true,
        speed: 500,
        slidesToShow: 3,
        slidesToScroll: 1,
        autoplay: true,
        autoplaySpeed: 4000,
        pauseOnHover: true,
        responsive: [
            {
                breakpoint: 1024,
                settings: {
                    slidesToShow: 2,
                    slidesToScroll: 1,
                },
            },
            {
                breakpoint: 640,
                settings: {
                    slidesToShow: 1,
                    slidesToScroll: 1,
                },
            },
        ],
    };

    const formatDate = (dateString) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('vi-VN');
    };

    return (
        <div className="py-16 bg-gradient-to-br from-blue-50 via-white to-purple-50">
            <div className="container mx-auto px-4">
                {/* Section Header */}
                <div className="text-center mb-12">
                    <div className="inline-flex items-center gap-3 bg-[#FF3B2F] text-white px-6 py-3 rounded-full shadow-lg mb-4">
                        <Star className="w-5 h-5" />
                        <span className="font-semibold">Đánh giá từ khách hàng</span>
                    </div>
                    <Title level={2} className="text-3xl md:text-4xl font-bold text-gray-800 mb-4">
                        Trải nghiệm tuyệt vời cùng chúng tôi
                    </Title>
                    <Text className="text-gray-600 text-lg max-w-2xl mx-auto">
                        Hàng nghìn khách hàng đã tin tưởng và lựa chọn sản phẩm giày của chúng tôi
                    </Text>
                </div>

                {/* Feedback Carousel */}
                <div className="feedback-carousel">
                    <style jsx>{`
                        .feedback-carousel .slick-dots {
                            bottom: -50px !important;
                        }

                        .feedback-carousel .slick-dots li button:before {
                            font-size: 12px !important;
                            color: #3b82f6 !important;
                            opacity: 0.5 !important;
                        }

                        .feedback-carousel .slick-dots li.slick-active button:before {
                            opacity: 1 !important;
                            color: #3b82f6 !important;
                        }

                        .feedback-carousel .slick-prev,
                        .feedback-carousel .slick-next {
                            width: 40px !important;
                            height: 40px !important;
                            z-index: 10 !important;
                        }

                        .feedback-carousel .slick-prev {
                            left: -20px !important;
                        }

                        .feedback-carousel .slick-next {
                            right: -20px !important;
                        }

                        .feedback-carousel .slick-prev:before,
                        .feedback-carousel .slick-next:before {
                            font-size: 20px !important;
                            color: #3b82f6 !important;
                        }

                        .line-clamp-4 {
                            display: -webkit-box;
                            -webkit-line-clamp: 4;
                            -webkit-box-orient: vertical;
                            overflow: hidden;
                        }

                        .line-clamp-1 {
                            display: -webkit-box;
                            -webkit-line-clamp: 1;
                            -webkit-box-orient: vertical;
                            overflow: hidden;
                        }
                    `}</style>
                    <Slider {...sliderSettings}>
                        {previewProduct.map((review) => (
                            <div key={review._id} className="px-3">
                                <Card className="h-full shadow-lg border-0 rounded-2xl overflow-hidden hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
                                    <div className="relative">
                                        {/* Quote Icon */}
                                        <div className="absolute top-0 right-0 w-12 h-12 bg-[#FF3B2F] rounded-bl-2xl flex items-center justify-center">
                                            <Quote className="w-5 h-5 text-white" />
                                        </div>

                                        {/* User Info */}
                                        <div className="flex items-center gap-4 mb-4">
                                            <div className="w-12 h-12 bg-[#FF3B2F] rounded-full flex items-center justify-center shadow-lg">
                                                <span className="text-white font-bold text-lg">
                                                    {review.userId?.fullName?.charAt(0)?.toUpperCase() || 'U'}
                                                </span>
                                            </div>
                                            <div className="flex-1">
                                                <h4 className="font-bold text-gray-800 text-sm">
                                                    {review.userId?.fullName || 'Khách hàng'}
                                                </h4>
                                                <div className="flex items-center gap-2">
                                                    <Rate disabled value={review.rating} className="text-xs" />
                                                    <span className="text-xs text-gray-500">
                                                        {formatDate(review.createdAt)}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Review Content */}
                                        <div className="mb-4">
                                            <p className="text-gray-700 text-sm leading-relaxed line-clamp-4">
                                                "{review.comment}"
                                            </p>
                                        </div>

                                        {/* Product Info */}
                                        {review.productId && (
                                            <div className="bg-gradient-to-r from-gray-50 to-blue-50 rounded-xl p-3 border border-gray-100">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-10 h-10 bg-gray-200 rounded-lg flex items-center justify-center">
                                                        <span className="text-xs">👟</span>
                                                    </div>
                                                    <div className="flex-1 min-w-0">
                                                        <h5 className="font-semibold text-gray-800 text-xs line-clamp-1">
                                                            {review.productId.name}
                                                        </h5>
                                                        <p className="text-xs text-gray-500">
                                                            📍 {review.productId.category.name}
                                                        </p>
                                                    </div>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </Card>
                            </div>
                        ))}
                    </Slider>
                </div>
            </div>
        </div>
    );
}

export default FeedbackHome;

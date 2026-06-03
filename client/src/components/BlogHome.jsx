import { Card, Typography, Button } from 'antd';
import { Calendar, User, ArrowRight, BookOpen } from 'lucide-react';
import { Link } from 'react-router-dom';

const { Title, Text } = Typography;

function BlogHome() {
    // Mock data for blogs
    const blogs = [
        {
            _id: '1',
            title: 'Top 10 đôi giày sneaker hot nhất năm 2024',
            content:
                '<p>Năm 2024 đánh dấu sự trở lại mạnh mẽ của nhiều mẫu giày sneaker iconic. Từ những thiết kế retro được tái sinh đến những công nghệ tiên tiến nhất, thị trường giày sneaker năm nay thực sự đa dạng và phong phú. Hãy cùng khám phá những đôi giày được yêu thích nhất trong năm qua...</p>',
            image: 'sneaker-2024.jpg',
            createdAt: '2024-01-20T10:00:00Z',
            author: 'Admin',
        },
        {
            _id: '2',
            title: 'Cách chọn size giày chuẩn nhất cho từng thương hiệu',
            content:
                '<p>Việc chọn size giày phù hợp là vô cùng quan trọng để đảm bảo sự thoải mái khi sử dụng. Mỗi thương hiệu giày lại có bảng size khác nhau, điều này thường gây khó khăn cho người mua. Trong bài viết này, chúng tôi sẽ hướng dẫn bạn cách đo chân và chọn size chuẩn nhất...</p>',
            image: 'size-guide.jpg',
            createdAt: '2024-01-18T14:30:00Z',
            author: 'Admin',
        },
        {
            _id: '3',
            title: 'Xu hướng giày thể thao nữ 2024: Từ minimalist đến chunky',
            content:
                '<p>Thời trang giày thể thao nữ năm 2024 chứng kiến sự đa dạng về phong cách từ tối giản đến cá tính. Những thiết kế chunky sneaker vẫn giữ vững vị thế trong khi các mẫu giày minimalist cũng ngày càng được ưa chuộng. Hãy cùng tìm hiểu những xu hướng nổi bật nhất...</p>',
            image: 'women-sneaker-trend.jpg',
            createdAt: '2024-01-15T09:15:00Z',
            author: 'Admin',
        },
        {
            _id: '4',
            title: 'Bí quyết bảo quản giày da và giày vải đúng cách',
            content:
                '<p>Giày là một trong những món đồ quan trọng nhất trong tủ đồ của chúng ta. Để giữ cho đôi giày luôn như mới và kéo dài tuổi thọ, việc bảo quản đúng cách là điều cần thiết. Mỗi loại chất liệu giày lại cần những phương pháp chăm sóc khác nhau...</p>',
            image: 'shoe-care.jpg',
            createdAt: '2024-01-12T16:45:00Z',
            author: 'Admin',
        },
        {
            _id: '5',
            title: 'Nike vs Adidas: Cuộc chiến của những ông lớn',
            content:
                '<p>Cuộc cạnh tranh giữa Nike và Adidas đã kéo dài hàng thập kỷ và vẫn tiếp tục gay cấn đến ngày hôm nay. Cả hai thương hiệu đều có những điểm mạnh riêng biệt và thu hút những nhóm khách hàng khác nhau. Hãy cùng phân tích sự khác biệt giữa hai ông lớn này...</p>',
            image: 'nike-vs-adidas.jpg',
            createdAt: '2024-01-10T11:20:00Z',
            author: 'Admin',
        },
        {
            _id: '6',
            title: 'Giày chạy bộ tốt nhất cho người mới bắt đầu',
            content:
                '<p>Việc lựa chọn đôi giày chạy bộ phù hợp là bước đầu tiên quan trọng cho những người mới bắt đầu tập luyện. Một đôi giày tốt không chỉ giúp bạn chạy thoải mái mà còn bảo vệ đôi chân khỏi chấn thương. Dưới đây là những gợi ý về các mẫu giày chạy bộ tốt nhất...</p>',
            image: 'running-shoes.jpg',
            createdAt: '2024-01-08T13:00:00Z',
            author: 'Admin',
        },
    ];

    // Helper function to extract text from HTML content
    const extractTextFromHTML = (htmlContent, maxLength = 150) => {
        if (!htmlContent) return '';

        // Remove HTML tags
        const textContent = htmlContent.replace(/<[^>]*>/g, '');

        if (textContent.length <= maxLength) {
            return textContent;
        }

        // Truncate and add ellipsis
        const truncatedText = textContent.substring(0, maxLength);
        const lastSpaceIndex = truncatedText.lastIndexOf(' ');
        const finalText = lastSpaceIndex > 0 ? truncatedText.substring(0, lastSpaceIndex) : truncatedText;

        return finalText + '...';
    };

    const formatDate = (dateString) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('vi-VN');
    };

    const getTimeAgo = (dateString) => {
        const date = new Date(dateString);
        const now = new Date();
        const diffTime = Math.abs(now - date);
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

        if (diffDays === 1) return '1 ngày trước';
        if (diffDays < 7) return `${diffDays} ngày trước`;
        if (diffDays < 30) return `${Math.floor(diffDays / 7)} tuần trước`;
        return `${Math.floor(diffDays / 30)} tháng trước`;
    };

    return (
        <div className="py-16 bg-gradient-to-br from-gray-50 via-white to-blue-50">
            <div className="container mx-auto px-4">
                {/* Section Header */}
                <div className="text-center mb-12">
                    <div className="inline-flex items-center gap-3 bg-[#FF3B2F] text-white px-6 py-3 rounded-full shadow-lg mb-4">
                        <BookOpen className="w-5 h-5" />
                        <span className="font-semibold">Blog giày sneaker</span>
                    </div>
                    <Title level={2} className="text-3xl md:text-4xl font-bold text-gray-800 mb-4">
                        Khám phá thế giới giày cùng chúng tôi
                    </Title>
                    <Text className="text-gray-600 text-lg max-w-2xl mx-auto">
                        Những câu chuyện, kinh nghiệm và mẹo hay về giày sneaker, xu hướng thời trang và cách chăm sóc
                        giày
                    </Text>
                </div>

                {/* Blog Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {blogs.map((blog) => (
                        <div key={blog._id} className="group">
                            <Card
                                className="h-full shadow-lg border-0 rounded-2xl overflow-hidden hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1"
                                bodyStyle={{ padding: 0 }}
                            >
                                {/* Blog Image */}
                                <div className="relative overflow-hidden">
                                    <img
                                        src={`https://images.unsplash.com/photo-1549298916-b41d501d3772?w=400&h=250&fit=crop`}
                                        alt={blog.title}
                                        className="w-full h-48 object-cover group-hover:scale-110 transition-transform duration-500"
                                    />
                                    {/* Overlay */}
                                    <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>

                                    {/* Date Badge */}
                                    <div className="absolute top-4 left-4 bg-white/90 backdrop-blur-sm px-3 py-1 rounded-full shadow-md">
                                        <div className="flex items-center gap-1 text-xs text-gray-700">
                                            <Calendar className="w-3 h-3" />
                                            <span>{formatDate(blog.createdAt)}</span>
                                        </div>
                                    </div>
                                </div>

                                {/* Blog Content */}
                                <div className="p-6">
                                    {/* Title */}
                                    <h3 className="font-bold text-gray-800 text-lg mb-3 line-clamp-2 leading-tight group-hover:text-[#FF3B2F] transition-colors duration-300">
                                        {blog.title}
                                    </h3>

                                    {/* Content Preview */}
                                    <p className="text-gray-600 text-sm leading-relaxed mb-4 line-clamp-3">
                                        {extractTextFromHTML(blog.content)}
                                    </p>

                                    {/* Meta Info */}
                                    <div className="flex items-center justify-between mb-4">
                                        <div className="flex items-center gap-2 text-xs text-gray-500">
                                            <User className="w-3 h-3" />
                                            <span>{blog.author}</span>
                                        </div>
                                        <div className="text-xs text-gray-500">{getTimeAgo(blog.createdAt)}</div>
                                    </div>

                                    {/* Read More Button */}
                                    <Link to={`/blog/${blog._id}`}>
                                        <Button
                                            type="text"
                                            className="w-full h-10 bg-gradient-to-r from-[#FF3B2F] to-[#FF6F4A] text-white border-0 rounded-lg hover:from-[#E62E24] hover:to-[#FF5A3D] font-medium shadow-md hover:shadow-lg transform hover:scale-[1.02] transition-all duration-300"
                                        >
                                            <div className="flex items-center justify-center gap-2">
                                                <span>Đọc thêm</span>
                                                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform duration-300" />
                                            </div>
                                        </Button>
                                    </Link>
                                </div>
                            </Card>
                        </div>
                    ))}
                </div>

                {/* View All Button */}
                {blogs.length > 6 && (
                    <div className="text-center mt-12">
                        <Link to="/blogs">
                            <Button
                                size="large"
                                className="bg-white border-2 border-[#FF3B2F] text-[#FF3B2F] hover:bg-[#FF3B2F] hover:text-white font-semibold px-8 py-2 h-12 rounded-full shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300"
                            >
                                <div className="flex items-center gap-2">
                                    <span>Xem tất cả bài viết</span>
                                    <ArrowRight className="w-5 h-5" />
                                </div>
                            </Button>
                        </Link>
                    </div>
                )}
            </div>

            {/* Custom Styles */}
            <style jsx>{`
                .line-clamp-2 {
                    display: -webkit-box;
                    -webkit-line-clamp: 2;
                    -webkit-box-orient: vertical;
                    overflow: hidden;
                }

                .line-clamp-3 {
                    display: -webkit-box;
                    -webkit-line-clamp: 3;
                    -webkit-box-orient: vertical;
                    overflow: hidden;
                }
            `}</style>
        </div>
    );
}

export default BlogHome;

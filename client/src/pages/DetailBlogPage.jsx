import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import Header from '../components/Header';
import Footer from '../components/Footer';
import { Spin, Button, Card, Divider } from 'antd';
import { ArrowLeftOutlined, CalendarOutlined } from '@ant-design/icons';
import { requestGetBlogById } from '../config/BlogRequest';

function DetailBlogPage() {
    const { id } = useParams();
    const [blog, setBlog] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchBlogDetail = async () => {
            setLoading(true);
            try {
                const res = await requestGetBlogById(id);
                setBlog(res.metadata);
            } catch (error) {
                console.error('Lỗi khi tải chi tiết bài viết:', error);
                setError('Không thể tải bài viết. Vui lòng thử lại sau.');
            } finally {
                setLoading(false);
            }
        };

        if (id) {
            fetchBlogDetail();
        }
    }, [id]);

    // Format ngày tháng
    const formatDate = (dateString) => {
        if (!dateString) return '';
        const options = { year: 'numeric', month: 'long', day: 'numeric' };
        return new Date(dateString).toLocaleDateString('vi-VN', options);
    };

    if (loading) {
        return (
            <div className="min-h-screen flex flex-col">
                <Header />
                <div className="flex-1 flex justify-center items-center">
                    <Spin size="large" tip="Đang tải bài viết..." />
                </div>
                <Footer />
            </div>
        );
    }

    if (error || !blog) {
        return (
            <div className="min-h-screen flex flex-col">
                <Header />
                <div className="flex-1 flex flex-col justify-center items-center">
                    <div className="text-xl text-red-500 mb-4">{error || 'Không tìm thấy bài viết'}</div>
                    <Link to="/blog">
                        <Button type="primary" icon={<ArrowLeftOutlined />}>
                            Quay lại danh sách bài viết
                        </Button>
                    </Link>
                </div>
                <Footer />
            </div>
        );
    }

    return (
        <div className="min-h-screen flex flex-col">
            <Header />

            <main className="flex-1 bg-gray-50 py-12 pt-25">
                <div className="container mx-auto px-4 max-w-4xl">
                    <Link to="/blog" className="inline-block mb-6">
                        <Button icon={<ArrowLeftOutlined />}>Quay lại danh sách bài viết</Button>
                    </Link>

                    <Card className="shadow-lg rounded-lg overflow-hidden">
                        {/* Ảnh đại diện */}
                        <div className="h-80 overflow-hidden -mx-6 -mt-6 mb-6">
                            <img
                                src={
                                    `${import.meta.env.VITE_API_URL}/uploads/blogs/${blog.image}` ||
                                    'https://via.placeholder.com/1200x600'
                                }
                                alt={blog.title}
                                className="w-full h-full object-cover"
                            />
                        </div>

                        {/* Tiêu đề và thông tin */}
                        <h1 className="text-3xl font-bold mb-4">{blog.title}</h1>

                        <div className="flex items-center text-gray-500 mb-6">
                            <CalendarOutlined className="mr-2" />
                            <span>Đăng ngày: {formatDate(blog.createdAt)}</span>
                            {blog.updatedAt && blog.updatedAt !== blog.createdAt && (
                                <span className="ml-4">(Cập nhật: {formatDate(blog.updatedAt)})</span>
                            )}
                        </div>

                        <Divider />

                        {/* Nội dung bài viết */}
                        <div
                            className="blog-content prose prose-lg max-w-none"
                            dangerouslySetInnerHTML={{ __html: blog.content }}
                        />
                    </Card>
                </div>
            </main>

            <Footer />
        </div>
    );
}

export default DetailBlogPage;

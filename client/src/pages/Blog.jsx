import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';

import { Card, Row, Col, Spin, Empty, Pagination, Input } from 'antd';
import { SearchOutlined, CalendarOutlined } from '@ant-design/icons';
import { requestGetAllBlog } from '../config/BlogRequest';
import Header from '../components/Header';
import Footer from '../components/Footer';

const { Meta } = Card;
const { Search } = Input;

function ListBlogPage() {
    useEffect(() => {
        document.title = 'Bài viết';
    }, []);

    const [blogs, setBlogs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchText, setSearchText] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const pageSize = 9;

    useEffect(() => {
        fetchBlogs();
    }, []);

    const fetchBlogs = async () => {
        setLoading(true);
        try {
            const res = await requestGetAllBlog();
            setBlogs(res.metadata || []);
        } catch (error) {
            console.error('Lỗi khi tải bài viết:', error);
        } finally {
            setLoading(false);
        }
    };

    // Lọc bài viết theo từ khóa tìm kiếm
    const filteredBlogs = blogs.filter((blog) => blog.title.toLowerCase().includes(searchText.toLowerCase()));

    // Phân trang
    const paginatedBlogs = filteredBlogs.slice((currentPage - 1) * pageSize, currentPage * pageSize);

    // Format ngày tháng
    const formatDate = (dateString) => {
        const options = { year: 'numeric', month: 'long', day: 'numeric' };
        return new Date(dateString).toLocaleDateString('vi-VN', options);
    };

    return (
        <div>
            <header>
                <Header />
            </header>

            <main className="flex-1 bg-gray-50 py-12">
                <div className="container mx-auto px-4">
                    {/* Tìm kiếm */}
                    <div className="mb-8">
                        <Search
                            placeholder="Tìm kiếm bài viết..."
                            enterButton={<SearchOutlined />}
                            size="large"
                            onChange={(e) => setSearchText(e.target.value)}
                            className="max-w-md"
                        />
                    </div>

                    {/* Danh sách bài viết */}
                    {loading ? (
                        <div className="flex justify-center items-center py-20">
                            <Spin size="large" />
                        </div>
                    ) : filteredBlogs.length === 0 ? (
                        <Empty description="Không tìm thấy bài viết nào" />
                    ) : (
                        <>
                            <Row gutter={[24, 24]}>
                                {paginatedBlogs.map((blog) => (
                                    <Col xs={24} sm={12} lg={8} key={blog._id}>
                                        <Card
                                            hoverable
                                            className="h-full flex flex-col"
                                            cover={
                                                <div className="h-48 overflow-hidden">
                                                    <img
                                                        alt={blog.title}
                                                        src={
                                                            `${import.meta.env.VITE_API_URL}/uploads/blogs/${
                                                                blog.image
                                                            }` || 'https://via.placeholder.com/800x400'
                                                        }
                                                        className="w-full h-full object-cover"
                                                    />
                                                </div>
                                            }
                                        >
                                            <Meta
                                                title={<div className="text-lg font-bold">{blog.title}</div>}
                                                description={
                                                    <div>
                                                        <div className="text-gray-500 mb-3 flex items-center">
                                                            <CalendarOutlined className="mr-1" />
                                                            {formatDate(blog.createdAt)}
                                                        </div>
                                                        <div
                                                            className="line-clamp-3 text-gray-700"
                                                            dangerouslySetInnerHTML={{ __html: blog.content }}
                                                        />
                                                        <div className="mt-4">
                                                            <a
                                                                href={`/blog/${blog._id}`}
                                                                className="text-blue-600 hover:text-blue-800 font-medium"
                                                            >
                                                                Đọc tiếp
                                                            </a>
                                                        </div>
                                                    </div>
                                                }
                                            />
                                        </Card>
                                    </Col>
                                ))}
                            </Row>

                            {/* Phân trang */}
                            {filteredBlogs.length > pageSize && (
                                <div className="mt-10 flex justify-center">
                                    <Pagination
                                        current={currentPage}
                                        pageSize={pageSize}
                                        total={filteredBlogs.length}
                                        onChange={(page) => setCurrentPage(page)}
                                        showSizeChanger={false}
                                    />
                                </div>
                            )}
                        </>
                    )}
                </div>
            </main>

            <footer>
                <Footer />
            </footer>
        </div>
    );
}

export default ListBlogPage;

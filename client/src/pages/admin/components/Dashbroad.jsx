import { useState, useEffect } from 'react';
import {
    Card, Row, Col, Statistic, Table, Avatar, Tag,
    Progress, Spin, Typography, Space, Button, Rate,
    Modal, List, DatePicker, Empty,
} from 'antd';
import {
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
    ResponsiveContainer, PieChart, Pie, Cell,
} from 'recharts';
import {
    TrendingUp, ShoppingCart, Users, Package, DollarSign,
    Star, MessageSquare, Calendar, Award, Activity, RefreshCw,
} from 'lucide-react';
import moment from 'moment';
import dayjs from 'dayjs';
import { requestGetDashboardAdmin, requestGetRevenueByMonth } from '../../../config/UserRequest';

const { Title, Text } = Typography;
const CHART_COLORS = ['#3b82f6', '#ef4444', '#10b981', '#f59e0b', '#8b5cf6', '#06b6d4', '#84cc16'];

function Dashboard({ onNavigate }) {
    const [loading, setLoading] = useState(true);
    const [dashboardData, setDashboardData] = useState({
        overview: {},
        revenueByDay: [],
        orderStatus: [],
        topProducts: [],
        recentReviews: [],
        recentOrders: [],
        paymentMethods: [],
    });

    const [reviewsModalOpen, setReviewsModalOpen] = useState(false);
    const [selectedMonth, setSelectedMonth] = useState(dayjs());
    const [monthlyRevenue, setMonthlyRevenue] = useState(null);
    const [monthLoading, setMonthLoading] = useState(false);

    useEffect(() => { fetchDashboardData(); }, []);

    const fetchDashboardData = async () => {
        setLoading(true);
        try {
            const response = await requestGetDashboardAdmin();
            if (response?.metadata) setDashboardData(response.metadata);
        } catch (error) {
            console.error('Error fetching dashboard:', error);
        } finally {
            setLoading(false);
        }
    };

    const fetchMonthlyRevenue = async (date) => {
        setMonthLoading(true);
        try {
            const month = date.month() + 1;
            const year = date.year();
            const res = await requestGetRevenueByMonth(month, year);
            setMonthlyRevenue(res.metadata);
        } catch (error) {
            console.error(error);
        } finally {
            setMonthLoading(false);
        }
    };

    const formatCurrency = (amount) =>
        new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount || 0);

    const getStatusColor = (status) => ({
        pending: 'orange', confirmed: 'blue', shipped: 'cyan',
        delivered: 'green', cancelled: 'red',
    }[status] || 'default');

    const getStatusText = (status) => ({
        pending: 'Chờ xử lý', confirmed: 'Đã xác nhận', shipped: 'Đang giao',
        delivered: 'Đã giao', cancelled: 'Đã hủy',
    }[status] || status);

    const getPaymentMethodText = (method) => ({
        momo: 'MoMo', vnpay: 'VNPay', cod: 'COD', bank: 'Ngân hàng',
    }[method] || method);

    const orderColumns = [
        {
            title: 'Mã đơn', dataIndex: 'id', key: 'id',
            render: (id) => <Text strong className="text-xs">{String(id).slice(-8)}</Text>,
        },
        {
            title: 'Khách hàng', dataIndex: 'user', key: 'user',
            render: (user, record) => (
                <Space size="small">
                    <Avatar size="small" icon={<Users size={12} />} />
                    <div>
                        <div className="text-xs font-medium">{user}</div>
                        <Text type="secondary" style={{ fontSize: 10 }}>{record.userEmail}</Text>
                    </div>
                </Space>
            ),
        },
        {
            title: 'Tổng tiền', dataIndex: 'totalPrice', key: 'totalPrice',
            render: (price) => <Text strong className="text-xs">{formatCurrency(price)}</Text>,
        },
        {
            title: 'Trạng thái', dataIndex: 'status', key: 'status',
            render: (status) => (
                <Tag color={getStatusColor(status)} className="text-xs">{getStatusText(status)}</Tag>
            ),
        },
        {
            title: 'Thời gian', dataIndex: 'createdAt', key: 'createdAt',
            render: (date) => <Text className="text-xs">{moment(date).format('DD/MM HH:mm')}</Text>,
        },
    ];

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen bg-gray-50">
                <div className="text-center">
                    <Spin size="large" />
                    <div className="mt-4"><Text>Đang tải dữ liệu dashboard...</Text></div>
                </div>
            </div>
        );
    }

    return (
        <div className="p-6 bg-gray-50 min-h-screen">

            {/* Header */}
            <div className="mb-8 flex items-center justify-between">
                <div>
                    <Title level={2} className="!mb-1 flex items-center gap-3">
                        <div className="p-2 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg">
                            <Activity className="text-white" size={24} />
                        </div>
                        Dashboard Quản Trị
                    </Title>
                    <Text type="secondary">
                        Cập nhật lần cuối: {moment().format('DD/MM/YYYY HH:mm')}
                    </Text>
                </div>
                <Button type="primary" icon={<RefreshCw size={14} />} onClick={fetchDashboardData} loading={loading}>
                    Làm mới
                </Button>
            </div>

            {/* Thống kê tổng quan — click để chuyển trang */}
            <Row gutter={[16, 16]} className="mb-8">
                <Col xs={24} sm={12} lg={6}>
                    <Card className="text-center shadow-sm hover:shadow-lg transition-all border-0">
                        <div className="flex justify-center mb-3">
                            <div className="p-4 bg-gradient-to-r from-blue-400 to-blue-600 rounded-2xl shadow-lg">
                                <DollarSign className="text-white" size={28} />
                            </div>
                        </div>
                        <Statistic
                            title="Tổng Doanh Thu"
                            value={dashboardData.overview.totalRevenue || 0}
                            formatter={(v) => formatCurrency(v)}
                            valueStyle={{ color: '#1890ff', fontWeight: 'bold', fontSize: '1.4rem' }}
                        />
                    </Card>
                </Col>
                <Col xs={24} sm={12} lg={6}>
                    <Card
                        className="text-center shadow-sm hover:shadow-lg transition-all border-0 cursor-pointer"
                        onClick={() => onNavigate('order')}
                    >
                        <div className="flex justify-center mb-3">
                            <div className="p-4 bg-gradient-to-r from-green-400 to-green-600 rounded-2xl shadow-lg">
                                <ShoppingCart className="text-white" size={28} />
                            </div>
                        </div>
                        <Statistic
                            title="Tổng Đơn Hàng"
                            value={dashboardData.overview.totalOrders || 0}
                            valueStyle={{ color: '#52c41a', fontWeight: 'bold', fontSize: '1.4rem' }}
                        />
                        <Text type="secondary" className="text-xs mt-1 block">Nhấn để quản lý →</Text>
                    </Card>
                </Col>
                <Col xs={24} sm={12} lg={6}>
                    <Card
                        className="text-center shadow-sm hover:shadow-lg transition-all border-0 cursor-pointer"
                        onClick={() => onNavigate('product')}
                    >
                        <div className="flex justify-center mb-3">
                            <div className="p-4 bg-gradient-to-r from-orange-400 to-orange-600 rounded-2xl shadow-lg">
                                <Users className="text-white" size={28} />
                            </div>
                        </div>
                        <Statistic
                            title="Khách Hàng"
                            value={dashboardData.overview.totalUsers || 0}
                            valueStyle={{ color: '#fa8c16', fontWeight: 'bold', fontSize: '1.4rem' }}
                        />
                        <Text type="secondary" className="text-xs mt-1 block">Nhấn để quản lý →</Text>
                    </Card>
                </Col>
                <Col xs={24} sm={12} lg={6}>
                    <Card
                        className="text-center shadow-sm hover:shadow-lg transition-all border-0 cursor-pointer"
                        onClick={() => onNavigate('product')}
                    >
                        <div className="flex justify-center mb-3">
                            <div className="p-4 bg-gradient-to-r from-purple-400 to-purple-600 rounded-2xl shadow-lg">
                                <Package className="text-white" size={28} />
                            </div>
                        </div>
                        <Statistic
                            title="Sản Phẩm"
                            value={dashboardData.overview.totalProducts || 0}
                            valueStyle={{ color: '#722ed1', fontWeight: 'bold', fontSize: '1.4rem' }}
                        />
                        <Text type="secondary" className="text-xs mt-1 block">Nhấn để quản lý →</Text>
                    </Card>
                </Col>
            </Row>

            {/* Doanh thu theo tháng */}
            <Row gutter={[16, 16]} className="mb-8">
                <Col xs={24}>
                    <Card
                        title={
                            <Space>
                                <Calendar className="text-purple-500" size={18} />
                                <Text strong>Doanh Thu Theo Tháng</Text>
                            </Space>
                        }
                        className="shadow-sm border-0"
                    >
                        <div className="flex items-center gap-3 mb-6 flex-wrap">
                            <DatePicker.MonthPicker
                                value={selectedMonth}
                                onChange={(date) => { setSelectedMonth(date); setMonthlyRevenue(null); }}
                                placeholder="Chọn tháng"
                                format="MM/YYYY"
                                allowClear={false}
                            />
                            <Button
                                type="primary"
                                loading={monthLoading}
                                onClick={() => fetchMonthlyRevenue(selectedMonth)}
                            >
                                Xem doanh thu
                            </Button>
                            {monthlyRevenue && (
                                <Button onClick={() => setMonthlyRevenue(null)}>Xóa kết quả</Button>
                            )}
                        </div>

                        {!monthlyRevenue && (
                            <div className="flex flex-col items-center py-10 text-gray-400">
                                <Calendar size={44} className="mb-2 opacity-25" />
                                <Text type="secondary">Chọn tháng và bấm "Xem doanh thu" để xem chi tiết từng ngày</Text>
                            </div>
                        )}

                        {monthlyRevenue && (
                            <>
                                <Row gutter={16} className="mb-5">
                                    <Col xs={24} sm={12}>
                                        <Card className="bg-blue-50 border-blue-200">
                                            <Statistic
                                                title={`Tổng doanh thu tháng ${monthlyRevenue.month}/${monthlyRevenue.year}`}
                                                value={monthlyRevenue.totalRevenue}
                                                formatter={(v) => formatCurrency(v)}
                                                valueStyle={{ color: '#1890ff', fontWeight: 'bold' }}
                                            />
                                        </Card>
                                    </Col>
                                    <Col xs={24} sm={12}>
                                        <Card className="bg-green-50 border-green-200">
                                            <Statistic
                                                title={`Tổng đơn hàng tháng ${monthlyRevenue.month}/${monthlyRevenue.year}`}
                                                value={monthlyRevenue.totalOrders}
                                                suffix="đơn"
                                                valueStyle={{ color: '#52c41a', fontWeight: 'bold' }}
                                            />
                                        </Card>
                                    </Col>
                                </Row>

                                {monthlyRevenue.data?.some((d) => d.revenue > 0) ? (
                                    <ResponsiveContainer width="100%" height={260}>
                                        <BarChart data={monthlyRevenue.data} margin={{ top: 10, right: 20, left: 20, bottom: 5 }}>
                                            <defs>
                                                <linearGradient id="monthGradient" x1="0" y1="0" x2="0" y2="1">
                                                    <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.85} />
                                                    <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0.45} />
                                                </linearGradient>
                                            </defs>
                                            <XAxis dataKey="day" tick={{ fontSize: 10 }} axisLine={false} tickLine={false} />
                                            <YAxis tickFormatter={(v) => `${(v / 1000000).toFixed(1)}M`} tick={{ fontSize: 11 }} axisLine={false} tickLine={false} />
                                            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                                            <Tooltip
                                                formatter={(v) => [formatCurrency(v), 'Doanh thu']}
                                                contentStyle={{ backgroundColor: 'white', border: '1px solid #e8e8e8', borderRadius: '8px' }}
                                            />
                                            <Bar dataKey="revenue" fill="url(#monthGradient)" radius={[4, 4, 0, 0]} />
                                        </BarChart>
                                    </ResponsiveContainer>
                                ) : (
                                    <Empty description={`Không có đơn hàng trong tháng ${monthlyRevenue.month}/${monthlyRevenue.year}`} />
                                )}
                            </>
                        )}
                    </Card>
                </Col>
            </Row>

            {/* Biểu đồ 7 ngày và trạng thái đơn */}
            <Row gutter={[16, 16]} className="mb-8">
                <Col xs={24} lg={16}>
                    <Card
                        title={<Space><TrendingUp className="text-blue-500" size={18} /><Text strong>Doanh Thu 7 Ngày Gần Đây</Text></Space>}
                        className="h-full shadow-sm border-0"
                    >
                        {dashboardData.revenueByDay?.length > 0 ? (
                            <ResponsiveContainer width="100%" height={300}>
                                <BarChart data={dashboardData.revenueByDay} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                                    <defs>
                                        <linearGradient id="colorBarRevenue" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.8} />
                                            <stop offset="95%" stopColor="#3b82f6" stopOpacity={0.5} />
                                        </linearGradient>
                                    </defs>
                                    <XAxis dataKey="day" tick={{ fontSize: 12 }} axisLine={false} tickLine={false} />
                                    <YAxis tickFormatter={(v) => `${(v / 1000000).toFixed(1)}M`} tick={{ fontSize: 12 }} axisLine={false} tickLine={false} />
                                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                                    <Tooltip
                                        formatter={(v) => [formatCurrency(v), 'Doanh thu']}
                                        labelFormatter={(label, payload) => {
                                            const d = payload?.[0]?.payload;
                                            return d ? `${d.dayName}, ${label}` : label;
                                        }}
                                        contentStyle={{ backgroundColor: 'white', border: '1px solid #e8e8e8', borderRadius: '8px' }}
                                    />
                                    <Bar dataKey="revenue" fill="url(#colorBarRevenue)" radius={[4, 4, 0, 0]} />
                                </BarChart>
                            </ResponsiveContainer>
                        ) : (
                            <div className="flex items-center justify-center h-72">
                                <Empty description="Chưa có dữ liệu 7 ngày gần đây" />
                            </div>
                        )}
                    </Card>
                </Col>

                <Col xs={24} lg={8}>
                    <Card
                        title={<Space><ShoppingCart className="text-green-500" size={18} /><Text strong>Trạng Thái Đơn Hàng</Text></Space>}
                        extra={<Button type="link" size="small" onClick={() => onNavigate('order')}>Quản lý →</Button>}
                        className="h-full shadow-sm border-0"
                    >
                        <ResponsiveContainer width="100%" height={300}>
                            <PieChart>
                                <Pie
                                    data={dashboardData.orderStatus || []}
                                    cx="50%" cy="50%"
                                    labelLine={false}
                                    label={({ status, percent }) =>
                                        percent > 0 ? `${getStatusText(status)} (${(percent * 100).toFixed(0)}%)` : ''
                                    }
                                    outerRadius={90} innerRadius={30}
                                    dataKey="count" nameKey="status"
                                >
                                    {(dashboardData.orderStatus || []).map((_, index) => (
                                        <Cell key={`cell-${index}`} fill={CHART_COLORS[index % CHART_COLORS.length]} />
                                    ))}
                                </Pie>
                                <Tooltip
                                    formatter={(value, name) => [value + ' đơn', getStatusText(name)]}
                                    contentStyle={{ backgroundColor: 'white', border: '1px solid #e8e8e8', borderRadius: '8px' }}
                                />
                            </PieChart>
                        </ResponsiveContainer>
                    </Card>
                </Col>
            </Row>

            {/* Top sản phẩm và phương thức thanh toán */}
            <Row gutter={[16, 16]} className="mb-8">
                <Col xs={24} lg={12}>
                    <Card
                        title={<Space><Award className="text-yellow-500" size={18} /><Text strong>Top Sản Phẩm Bán Chạy</Text></Space>}
                        extra={<Button type="link" size="small" onClick={() => onNavigate('product')}>Xem tất cả →</Button>}
                        className="shadow-sm border-0"
                    >
                        <div className="space-y-3">
                            {(dashboardData.topProducts || []).map((product, index) => (
                                <div
                                    key={product.id}
                                    className="flex items-center justify-between p-3 bg-gray-50 rounded-xl border hover:shadow-md transition-all cursor-pointer"
                                    onClick={() => onNavigate('product')}
                                >
                                    <Space>
                                        <div className="relative">
                                            <Avatar
                                                size={48}
                                                src={`${import.meta.env.VITE_API_URL}/uploads/products/${product.image}`}
                                                className="border-2 border-gray-200"
                                            />
                                            <div className="absolute -top-2 -left-2 bg-gradient-to-r from-yellow-400 to-orange-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs font-bold">
                                                {index + 1}
                                            </div>
                                        </div>
                                        <div>
                                            <Text strong className="block text-sm">{product.name}</Text>
                                            <Text type="secondary" className="text-xs">
                                                Đã bán: <Text strong className="text-blue-600">{product.totalSold}</Text> đôi
                                            </Text>
                                        </div>
                                    </Space>
                                    <div className="text-right">
                                        <Text strong className="text-green-600 block text-sm">{formatCurrency(product.revenue)}</Text>
                                        <Progress
                                            percent={Math.min((product.totalSold / 250) * 100, 100)}
                                            size="small" showInfo={false} className="w-20"
                                            strokeColor={{ '0%': '#108ee9', '100%': '#87d068' }}
                                        />
                                    </div>
                                </div>
                            ))}
                            {(!dashboardData.topProducts || dashboardData.topProducts.length === 0) && (
                                <Empty description="Chưa có dữ liệu sản phẩm" />
                            )}
                        </div>
                    </Card>
                </Col>

                <Col xs={24} lg={12}>
                    <Card
                        title={<Space><DollarSign className="text-blue-500" size={18} /><Text strong>Phương Thức Thanh Toán</Text></Space>}
                        className="shadow-sm border-0"
                    >
                        <ResponsiveContainer width="100%" height={260}>
                            <BarChart data={dashboardData.paymentMethods || []}>
                                <defs>
                                    <linearGradient id="colorBar" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#10b981" stopOpacity={0.8} />
                                        <stop offset="95%" stopColor="#10b981" stopOpacity={0.5} />
                                    </linearGradient>
                                </defs>
                                <XAxis dataKey="method" tickFormatter={(v) => getPaymentMethodText(v)} tick={{ fontSize: 12 }} axisLine={false} />
                                <YAxis tickFormatter={(v) => `${(v / 1000000).toFixed(1)}M`} tick={{ fontSize: 12 }} axisLine={false} />
                                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                                <Tooltip
                                    formatter={(v) => [formatCurrency(v), 'Doanh thu']}
                                    labelFormatter={(label) => getPaymentMethodText(label)}
                                    contentStyle={{ backgroundColor: 'white', border: '1px solid #e8e8e8', borderRadius: '8px' }}
                                />
                                <Bar dataKey="revenue" fill="url(#colorBar)" radius={[8, 8, 0, 0]} />
                            </BarChart>
                        </ResponsiveContainer>
                    </Card>
                </Col>
            </Row>

            {/* Đánh giá và đơn hàng mới */}
            <Row gutter={[16, 16]}>
                <Col xs={24} lg={10}>
                    <Card
                        title={<Space><Star className="text-yellow-500" size={18} /><Text strong>Đánh Giá Gần Đây</Text></Space>}
                        extra={
                            <Button type="link" size="small" onClick={() => setReviewsModalOpen(true)}>
                                Xem tất cả →
                            </Button>
                        }
                        className="shadow-sm border-0"
                    >
                        <div className="space-y-4 max-h-72 overflow-y-auto">
                            {(dashboardData.recentReviews || []).slice(0, 3).map((review) => (
                                <div key={review.id} className="border-b border-gray-100 pb-3 last:border-b-0">
                                    <div className="flex items-start space-x-3">
                                        <Avatar
                                            src={`${import.meta.env.VITE_API_URL}/uploads/avatars/${review.userAvatar}`}
                                            icon={<Users size={13} />}
                                            size={36}
                                        />
                                        <div className="flex-1">
                                            <div className="flex items-center justify-between mb-1">
                                                <Text strong className="text-sm">{review.user}</Text>
                                                <Text type="secondary" className="text-xs">{moment(review.createdAt).fromNow()}</Text>
                                            </div>
                                            <Text type="secondary" className="text-xs block mb-1">
                                                <Package size={10} className="inline mr-1" />{review.product}
                                            </Text>
                                            <Rate disabled defaultValue={review.rating} style={{ fontSize: 11 }} />
                                            <div className="mt-1 text-sm bg-gray-50 p-2 rounded text-gray-700">
                                                "{review.comment}"
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                            {(!dashboardData.recentReviews || dashboardData.recentReviews.length === 0) && (
                                <Empty description="Chưa có đánh giá nào" />
                            )}
                        </div>
                    </Card>
                </Col>

                <Col xs={24} lg={14}>
                    <Card
                        title={<Space><Calendar className="text-blue-500" size={18} /><Text strong>Đơn Hàng Mới Nhất</Text></Space>}
                        extra={<Button type="link" size="small" onClick={() => onNavigate('order')}>Quản lý đơn hàng →</Button>}
                        className="shadow-sm border-0"
                    >
                        <Table
                            dataSource={dashboardData.recentOrders || []}
                            columns={orderColumns}
                            pagination={false}
                            size="small"
                            scroll={{ y: 280 }}
                            locale={{ emptyText: 'Chưa có đơn hàng nào' }}
                            rowKey="id"
                        />
                    </Card>
                </Col>
            </Row>

            {/* Modal: tất cả đánh giá */}
            <Modal
                title={<Space><Star className="text-yellow-500" size={16} /><span>Tất cả đánh giá gần đây</span></Space>}
                open={reviewsModalOpen}
                onCancel={() => setReviewsModalOpen(false)}
                footer={<Button onClick={() => setReviewsModalOpen(false)}>Đóng</Button>}
                width={620}
            >
                <List
                    dataSource={dashboardData.recentReviews || []}
                    locale={{ emptyText: 'Chưa có đánh giá nào' }}
                    renderItem={(review) => (
                        <List.Item>
                            <List.Item.Meta
                                avatar={
                                    <Avatar
                                        src={`${import.meta.env.VITE_API_URL}/uploads/avatars/${review.userAvatar}`}
                                        icon={<Users size={13} />}
                                    />
                                }
                                title={
                                    <div className="flex items-center justify-between">
                                        <span className="font-medium">{review.user}</span>
                                        <Rate disabled defaultValue={review.rating} style={{ fontSize: 11 }} />
                                    </div>
                                }
                                description={
                                    <div>
                                        <Text type="secondary" className="text-xs">
                                            {review.product} • {moment(review.createdAt).format('DD/MM/YYYY HH:mm')}
                                        </Text>
                                        <div className="mt-1 text-sm bg-gray-50 p-2 rounded">"{review.comment}"</div>
                                    </div>
                                }
                            />
                        </List.Item>
                    )}
                />
            </Modal>

            {/* Alert liên hệ */}
            {dashboardData.overview.pendingContacts > 0 && (
                <div className="fixed bottom-6 right-6 z-50">
                    <Card className="shadow-2xl border-l-4 border-l-orange-500 bg-gradient-to-r from-orange-50 to-yellow-50">
                        <Space>
                            <div className="p-2 bg-orange-500 rounded-full">
                                <MessageSquare className="text-white" size={15} />
                            </div>
                            <div>
                                <Text strong className="text-orange-800">
                                    Có {dashboardData.overview.pendingContacts} liên hệ mới
                                </Text>
                                <Button
                                    type="link" size="small"
                                    className="p-0 ml-2 text-orange-600 font-medium"
                                    onClick={() => onNavigate('contact')}
                                >
                                    Xem ngay →
                                </Button>
                            </div>
                        </Space>
                    </Card>
                </div>
            )}
        </div>
    );
}

export default Dashboard;
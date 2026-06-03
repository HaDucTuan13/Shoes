import { useState, useEffect } from 'react';
import {
    Card,
    Row,
    Col,
    Statistic,
    Table,
    Avatar,
    Tag,
    Progress,
    Spin,
    Typography,
    Space,
    Button,
    Rate,
    Badge,
} from 'antd';
import {
    LineChart,
    Line,
    AreaChart,
    Area,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    PieChart,
    Pie,
    Cell,
    BarChart,
    Bar,
} from 'recharts';
import {
    TrendingUp,
    TrendingDown,
    ShoppingCart,
    Users,
    Package,
    DollarSign,
    Star,
    MessageSquare,
    Eye,
    Calendar,
    Award,
    Activity,
    AlertCircle,
    RefreshCw,
} from 'lucide-react';
import moment from 'moment';
import { requestGetDashboardAdmin } from '../../../config/UserRequest';

const { Title, Text } = Typography;

// Màu cho biểu đồ
const CHART_COLORS = ['#3b82f6', '#ef4444', '#10b981', '#f59e0b', '#8b5cf6', '#06b6d4', '#84cc16'];

function Dashboard() {
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

    useEffect(() => {
        fetchDashboardData();
    }, []);

    const fetchDashboardData = async () => {
        setLoading(true);
        try {
            const response = await requestGetDashboardAdmin();
            console.log('Dashboard API response:', response);

            if (response && response.metadata) {
                console.log('Using real data from API');
                setDashboardData(response.metadata);
            } else {
                console.log('No data from API, using mock data');
                // Mock data for demo if API doesn't return data
                // Mock data for demo if API doesn't return data
                setDashboardData({
                    overview: {
                        totalProducts: 156,
                        totalUsers: 2834,
                        totalCategories: 12,
                        totalOrders: 1247,
                        totalRevenue: 45680000,
                        revenueGrowth: 12.5,
                        pendingContacts: 18,
                    },
                    revenueByDay: [
                        { day: '8/10', dayName: 'T2', revenue: 1250000, orders: 3 },
                        { day: '9/10', dayName: 'T3', revenue: 2100000, orders: 5 },
                        { day: '10/10', dayName: 'T4', revenue: 1800000, orders: 4 },
                        { day: '11/10', dayName: 'T5', revenue: 2500000, orders: 7 },
                        { day: '12/10', dayName: 'T6', revenue: 3200000, orders: 8 },
                        { day: '13/10', dayName: 'T7', revenue: 2800000, orders: 6 },
                        { day: '14/10', dayName: 'CN', revenue: 1150000, orders: 3 },
                    ],
                    orderStatus: [
                        { status: 'pending', count: 45 },
                        { status: 'confirmed', count: 120 },
                        { status: 'shipped', count: 89 },
                        { status: 'delivered', count: 340 },
                        { status: 'cancelled', count: 23 },
                    ],
                    topProducts: [
                        { id: '1', name: 'Nike Air Force 1', totalSold: 245, revenue: 12250000, image: 'product1.jpg' },
                        { id: '2', name: 'Adidas Stan Smith', totalSold: 198, revenue: 9900000, image: 'product2.jpg' },
                        { id: '3', name: 'Vans Old Skool', totalSold: 167, revenue: 8350000, image: 'product3.jpg' },
                    ],
                    recentReviews: [
                        {
                            id: '1',
                            user: 'Nguyễn Văn A',
                            userAvatar: 'avatar1.jpg',
                            product: 'Nike Air Max 90',
                            rating: 5,
                            comment: 'Sản phẩm chất lượng tuyệt vời!',
                            createdAt: new Date(),
                        },
                    ],
                    recentOrders: [
                        {
                            id: 'ORD001',
                            user: 'Trần Thị B',
                            userEmail: 'tran@example.com',
                            totalPrice: 1250000,
                            status: 'confirmed',
                            paymentMethod: 'momo',
                            createdAt: new Date(),
                            itemsCount: 2,
                        },
                    ],
                    paymentMethods: [
                        { method: 'momo', count: 456, revenue: 18500000 },
                        { method: 'vnpay', count: 234, revenue: 12200000 },
                        { method: 'cod', count: 189, revenue: 8900000 },
                    ],
                });
            }
        } catch (error) {
            console.error('Error fetching dashboard data:', error);
            // Set mock data on error
            setDashboardData({
                overview: {
                    totalProducts: 0,
                    totalUsers: 0,
                    totalCategories: 0,
                    totalOrders: 0,
                    totalRevenue: 0,
                    revenueGrowth: 0,
                    pendingContacts: 0,
                },
                revenueByDay: [],
                orderStatus: [],
                topProducts: [],
                recentReviews: [],
                recentOrders: [],
                paymentMethods: [],
            });
        } finally {
            setLoading(false);
        }
    };

    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('vi-VN', {
            style: 'currency',
            currency: 'VND',
        }).format(amount || 0);
    };

    const getStatusColor = (status) => {
        const colors = {
            pending: 'orange',
            confirmed: 'blue',
            shipped: 'cyan',
            delivered: 'green',
            cancelled: 'red',
        };
        return colors[status] || 'default';
    };

    const getStatusText = (status) => {
        const texts = {
            pending: 'Chờ xử lý',
            confirmed: 'Đã xác nhận',
            shipped: 'Đang giao',
            delivered: 'Đã giao',
            cancelled: 'Đã hủy',
        };
        return texts[status] || status;
    };

    const getPaymentMethodText = (method) => {
        const texts = {
            momo: 'MoMo',
            vnpay: 'VNPay',
            cod: 'COD',
        };
        return texts[method] || method;
    };

    // Columns cho bảng đơn hàng gần đây
    const orderColumns = [
        {
            title: 'Mã đơn',
            dataIndex: 'id',
            key: 'id',
            render: (id) => (
                <Text strong className="text-xs">
                    {String(id).slice(-8)}
                </Text>
            ),
        },
        {
            title: 'Khách hàng',
            dataIndex: 'user',
            key: 'user',
            render: (user, record) => (
                <Space size="small">
                    <Avatar size="small" icon={<Users />} />
                    <div>
                        <div className="text-xs font-medium">{user}</div>
                        <Text type="secondary" style={{ fontSize: 10 }}>
                            {record.userEmail}
                        </Text>
                    </div>
                </Space>
            ),
        },
        {
            title: 'Tổng tiền',
            dataIndex: 'totalPrice',
            key: 'totalPrice',
            render: (price) => (
                <Text strong className="text-xs">
                    {formatCurrency(price)}
                </Text>
            ),
        },
        {
            title: 'Trạng thái',
            dataIndex: 'status',
            key: 'status',
            render: (status) => (
                <Tag color={getStatusColor(status)} className="text-xs">
                    {getStatusText(status)}
                </Tag>
            ),
        },
        {
            title: 'Thời gian',
            dataIndex: 'createdAt',
            key: 'createdAt',
            render: (date) => <Text className="text-xs">{moment(date).format('DD/MM HH:mm')}</Text>,
        },
    ];

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen bg-gray-50">
                <div className="text-center">
                    <Spin size="large" />
                    <div className="mt-4">
                        <Text>Đang tải dữ liệu dashboard...</Text>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="p-6 bg-gray-50 min-h-screen">
            {/* Header */}
            <div className="mb-8">
                <div className="flex items-center justify-between">
                    <div>
                        <Title level={2} className="!mb-2 flex items-center">
                            <div className="p-2 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg mr-3">
                                <Activity className="text-white" size={28} />
                            </div>
                            Dashboard Quản Trị
                        </Title>
                        <Text type="secondary" className="text-base">
                            Tổng quan hoạt động kinh doanh • Cập nhật lần cuối: {moment().format('DD/MM/YYYY HH:mm')}
                        </Text>
                        <br />
                        <Text type="secondary" className="text-xs">
                            📊 <strong>Biểu đồ cột 7 ngày:</strong> Thống kê doanh thu hàng ngày.
                            {/* Console (F12) để debug */}
                        </Text>
                    </div>
                    <Button
                        type="primary"
                        icon={<RefreshCw size={16} />}
                        onClick={fetchDashboardData}
                        loading={loading}
                        className="flex items-center"
                    >
                        Làm mới
                    </Button>
                </div>
            </div>

            {/* Thống kê tổng quan */}
            <Row gutter={[16, 16]} className="mb-8">
                <Col xs={24} sm={12} lg={6}>
                    <Card className="text-center shadow-sm hover:shadow-lg transition-all duration-300 border-0">
                        <div className="flex items-center justify-center mb-4">
                            <div className="p-4 bg-gradient-to-r from-blue-400 to-blue-600 rounded-2xl shadow-lg">
                                <DollarSign className="text-white" size={28} />
                            </div>
                        </div>
                        <Statistic
                            title="Tổng Doanh Thu"
                            value={dashboardData.overview.totalRevenue || 0}
                            formatter={(value) => formatCurrency(value)}
                            valueStyle={{ color: '#1890ff', fontWeight: 'bold', fontSize: '1.5rem' }}
                        />
                    </Card>
                </Col>

                <Col xs={24} sm={12} lg={6}>
                    <Card className="text-center shadow-sm hover:shadow-lg transition-all duration-300 border-0">
                        <div className="flex items-center justify-center mb-4">
                            <div className="p-4 bg-gradient-to-r from-green-400 to-green-600 rounded-2xl shadow-lg">
                                <ShoppingCart className="text-white" size={28} />
                            </div>
                        </div>
                        <Statistic
                            title="Tổng Đơn Hàng"
                            value={dashboardData.overview.totalOrders || 0}
                            valueStyle={{ color: '#52c41a', fontWeight: 'bold', fontSize: '1.5rem' }}
                        />
                    </Card>
                </Col>

                <Col xs={24} sm={12} lg={6}>
                    <Card className="text-center shadow-sm hover:shadow-lg transition-all duration-300 border-0">
                        <div className="flex items-center justify-center mb-4">
                            <div className="p-4 bg-gradient-to-r from-orange-400 to-orange-600 rounded-2xl shadow-lg">
                                <Users className="text-white" size={28} />
                            </div>
                        </div>
                        <Statistic
                            title="Khách Hàng"
                            value={dashboardData.overview.totalUsers || 0}
                            valueStyle={{ color: '#fa8c16', fontWeight: 'bold', fontSize: '1.5rem' }}
                        />
                    </Card>
                </Col>

                <Col xs={24} sm={12} lg={6}>
                    <Card className="text-center shadow-sm hover:shadow-lg transition-all duration-300 border-0">
                        <div className="flex items-center justify-center mb-4">
                            <div className="p-4 bg-gradient-to-r from-purple-400 to-purple-600 rounded-2xl shadow-lg">
                                <Package className="text-white" size={28} />
                            </div>
                        </div>
                        <Statistic
                            title="Sản Phẩm"
                            value={dashboardData.overview.totalProducts || 0}
                            valueStyle={{ color: '#722ed1', fontWeight: 'bold', fontSize: '1.5rem' }}
                        />
                    </Card>
                </Col>
            </Row>

            {/* Biểu đồ doanh thu và trạng thái đơn hàng */}
            <Row gutter={[16, 16]} className="mb-8">
                <Col xs={24} lg={16}>
                    <Card
                        title={
                            <Space>
                                <TrendingUp className="text-blue-500" size={20} />
                                <Text strong>Doanh Thu 7 Ngày Gần Đây</Text>
                            </Space>
                        }
                        className="h-full shadow-sm border-0"
                    >
                        {dashboardData.revenueByDay && dashboardData.revenueByDay.length > 0 ? (
                            <ResponsiveContainer width="100%" height={320}>
                                <BarChart
                                    data={dashboardData.revenueByDay}
                                    margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                                >
                                    <defs>
                                        <linearGradient id="colorBarRevenue" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.8} />
                                            <stop offset="95%" stopColor="#3b82f6" stopOpacity={0.6} />
                                        </linearGradient>
                                    </defs>
                                    <XAxis dataKey="day" tick={{ fontSize: 12 }} axisLine={false} tickLine={false} />
                                    <YAxis
                                        tickFormatter={(value) => `${(value / 1000000).toFixed(1)}M`}
                                        tick={{ fontSize: 12 }}
                                        axisLine={false}
                                        tickLine={false}
                                    />
                                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                                    <Tooltip
                                        formatter={(value, name) => [
                                            formatCurrency(value),
                                            name === 'revenue' ? 'Doanh thu' : name === 'orders' ? 'Đơn hàng' : name,
                                        ]}
                                        labelFormatter={(label, payload) => {
                                            const data = payload?.[0]?.payload;
                                            return data ? `${data.dayName}, ${label}` : `Ngày ${label}`;
                                        }}
                                        contentStyle={{
                                            backgroundColor: 'white',
                                            border: '1px solid #e8e8e8',
                                            borderRadius: '8px',
                                            boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                                        }}
                                    />
                                    <Bar
                                        dataKey="revenue"
                                        fill="url(#colorBarRevenue)"
                                        radius={[4, 4, 0, 0]}
                                        name="revenue"
                                    />
                                </BarChart>
                            </ResponsiveContainer>
                        ) : (
                            <div className="flex flex-col items-center justify-center h-80">
                                <div className="text-gray-400 text-6xl mb-4">📊</div>
                                <Text type="secondary" className="text-center">
                                    Chưa có dữ liệu doanh thu 7 ngày gần đây
                                    <br />
                                    <Text type="secondary" className="text-xs">
                                        Dữ liệu sẽ hiển thị khi có đơn hàng thành công trong 7 ngày gần đây
                                    </Text>
                                </Text>
                                <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-lg text-center max-w-md">
                                    <Text className="text-xs text-green-800">
                                        <strong>📊 Biểu đồ cột 7 ngày gần đây!</strong>
                                        <br />
                                        • Query dữ liệu theo ngày thay vì tháng
                                        <br />
                                        • Hiển thị đầy đủ 7 ngày (kể cả ngày không có đơn hàng)
                                        <br />
                                        • Sử dụng BarChart thay vì AreaChart
                                        <br />
                                        <strong>🔄 Nhấn "Làm mới" để thấy kết quả</strong>
                                    </Text>
                                </div>
                            </div>
                        )}
                    </Card>
                </Col>

                <Col xs={24} lg={8}>
                    <Card
                        title={
                            <Space>
                                <ShoppingCart className="text-green-500" size={20} />
                                <Text strong>Trạng Thái Đơn Hàng</Text>
                            </Space>
                        }
                        className="h-full shadow-sm border-0"
                    >
                        <ResponsiveContainer width="100%" height={320}>
                            <PieChart>
                                <Pie
                                    data={dashboardData.orderStatus || []}
                                    cx="50%"
                                    cy="50%"
                                    labelLine={false}
                                    label={({ status, percent }) =>
                                        percent > 0 ? `${getStatusText(status)} (${(percent * 100).toFixed(0)}%)` : ''
                                    }
                                    outerRadius={90}
                                    innerRadius={30}
                                    fill="#8884d8"
                                    dataKey="count"
                                >
                                    {(dashboardData.orderStatus || []).map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={CHART_COLORS[index % CHART_COLORS.length]} />
                                    ))}
                                </Pie>
                                <Tooltip
                                    contentStyle={{
                                        backgroundColor: 'white',
                                        border: '1px solid #e8e8e8',
                                        borderRadius: '8px',
                                        boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                                    }}
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
                        title={
                            <Space>
                                <Award className="text-yellow-500" size={20} />
                                <Text strong>Top Sản Phẩm Bán Chạy</Text>
                            </Space>
                        }
                        className="shadow-sm border-0"
                        extra={
                            <Button type="link" size="small">
                                Xem tất cả
                            </Button>
                        }
                    >
                        <div className="space-y-4">
                            {(dashboardData.topProducts || []).map((product, index) => (
                                <div
                                    key={product.id}
                                    className="flex items-center justify-between p-4 bg-gradient-to-r from-gray-50 to-white rounded-xl border hover:shadow-md transition-all"
                                >
                                    <Space size="large">
                                        <div className="relative">
                                            <Avatar
                                                size={56}
                                                src={`${import.meta.env.VITE_API_URL}/uploads/products/${
                                                    product.image
                                                }`}
                                                className="border-2 border-gray-200"
                                            />
                                            <div className="absolute -top-2 -left-2 bg-gradient-to-r from-yellow-400 to-orange-500 text-white rounded-full w-7 h-7 flex items-center justify-center text-xs font-bold shadow-lg">
                                                {index + 1}
                                            </div>
                                        </div>
                                        <div>
                                            <Text strong className="block text-base">
                                                {product.name}
                                            </Text>
                                            <Text type="secondary" className="text-sm">
                                                Đã bán:{' '}
                                                <Text strong className="text-blue-600">
                                                    {product.totalSold}
                                                </Text>{' '}
                                                đôi
                                            </Text>
                                        </div>
                                    </Space>
                                    <div className="text-right">
                                        <Text strong className="text-green-600 block text-base">
                                            {formatCurrency(product.revenue)}
                                        </Text>
                                        <Progress
                                            percent={Math.min((product.totalSold / 250) * 100, 100)}
                                            size="small"
                                            showInfo={false}
                                            className="w-24"
                                            strokeColor={{
                                                '0%': '#108ee9',
                                                '100%': '#87d068',
                                            }}
                                        />
                                    </div>
                                </div>
                            ))}
                            {(!dashboardData.topProducts || dashboardData.topProducts.length === 0) && (
                                <div className="text-center py-8">
                                    <AlertCircle className="text-gray-400 mx-auto mb-2" size={48} />
                                    <Text type="secondary">Chưa có dữ liệu sản phẩm</Text>
                                </div>
                            )}
                        </div>
                    </Card>
                </Col>

                <Col xs={24} lg={12}>
                    <Card
                        title={
                            <Space>
                                <DollarSign className="text-blue-500" size={20} />
                                <Text strong>Phương Thức Thanh Toán</Text>
                            </Space>
                        }
                        className="shadow-sm border-0"
                    >
                        <ResponsiveContainer width="100%" height={280}>
                            <BarChart data={dashboardData.paymentMethods || []}>
                                <XAxis
                                    dataKey="method"
                                    tickFormatter={(value) => getPaymentMethodText(value)}
                                    tick={{ fontSize: 12 }}
                                    axisLine={false}
                                />
                                <YAxis
                                    tickFormatter={(value) => `${value / 1000000}M`}
                                    tick={{ fontSize: 12 }}
                                    axisLine={false}
                                />
                                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                                <Tooltip
                                    formatter={(value) => [formatCurrency(value), 'Doanh thu']}
                                    labelFormatter={(label) => getPaymentMethodText(label)}
                                    contentStyle={{
                                        backgroundColor: 'white',
                                        border: '1px solid #e8e8e8',
                                        borderRadius: '8px',
                                        boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                                    }}
                                />
                                <Bar dataKey="revenue" fill="url(#colorBar)" radius={[8, 8, 0, 0]}>
                                    <defs>
                                        <linearGradient id="colorBar" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#10b981" stopOpacity={0.8} />
                                            <stop offset="95%" stopColor="#10b981" stopOpacity={0.6} />
                                        </linearGradient>
                                    </defs>
                                </Bar>
                            </BarChart>
                        </ResponsiveContainer>
                    </Card>
                </Col>
            </Row>

            {/* Đánh giá gần đây và đơn hàng mới */}
            <Row gutter={[16, 16]}>
                <Col xs={24} lg={10}>
                    <Card
                        title={
                            <Space>
                                <Star className="text-yellow-500" size={20} />
                                <Text strong>Đánh Giá Gần Đây</Text>
                            </Space>
                        }
                        extra={
                            <Button type="link" size="small">
                                Xem tất cả
                            </Button>
                        }
                        className="shadow-sm border-0"
                    >
                        <div className="space-y-4 max-h-80 overflow-y-auto">
                            {(dashboardData.recentReviews || []).map((review) => (
                                <div key={review.id} className="border-b border-gray-100 pb-4 last:border-b-0">
                                    <div className="flex items-start space-x-3">
                                        <Avatar
                                            src={`${import.meta.env.VITE_API_URL}/uploads/avatars/${review.userAvatar}`}
                                            icon={<Users />}
                                            size="large"
                                        />
                                        <div className="flex-1">
                                            <div className="flex items-center justify-between mb-2">
                                                <Text strong>{review.user}</Text>
                                                <Text type="secondary" className="text-xs">
                                                    {moment(review.createdAt).fromNow()}
                                                </Text>
                                            </div>
                                            <Text type="secondary" className="text-sm block mb-2">
                                                <Package size={12} className="inline mr-1" />
                                                {review.product}
                                            </Text>
                                            <Rate disabled defaultValue={review.rating} size="small" />
                                            <Text className="block mt-2 text-sm bg-gray-50 p-2 rounded">
                                                "{review.comment}"
                                            </Text>
                                        </div>
                                    </div>
                                </div>
                            ))}
                            {(!dashboardData.recentReviews || dashboardData.recentReviews.length === 0) && (
                                <div className="text-center py-8">
                                    <Star className="text-gray-400 mx-auto mb-2" size={48} />
                                    <Text type="secondary">Chưa có đánh giá nào</Text>
                                </div>
                            )}
                        </div>
                    </Card>
                </Col>

                <Col xs={24} lg={14}>
                    <Card
                        title={
                            <Space>
                                <Calendar className="text-blue-500" size={20} />
                                <Text strong>Đơn Hàng Mới Nhất</Text>
                            </Space>
                        }
                        extra={
                            <Button type="link" size="small">
                                Quản lý đơn hàng
                            </Button>
                        }
                        className="shadow-sm border-0"
                    >
                        <Table
                            dataSource={dashboardData.recentOrders || []}
                            columns={orderColumns}
                            pagination={false}
                            size="small"
                            scroll={{ y: 320 }}
                            locale={{ emptyText: 'Chưa có đơn hàng nào' }}
                        />
                    </Card>
                </Col>
            </Row>

            {/* Alert cho liên hệ chờ xử lý */}
            {dashboardData.overview.pendingContacts > 0 && (
                <div className="fixed bottom-6 right-6 z-50">
                    <Card className="shadow-2xl border-l-4 border-l-orange-500 bg-gradient-to-r from-orange-50 to-yellow-50">
                        <Space>
                            <div className="p-2 bg-orange-500 rounded-full">
                                <MessageSquare className="text-white" size={16} />
                            </div>
                            <div>
                                <Text strong className="text-orange-800">
                                    Có {dashboardData.overview.pendingContacts} liên hệ mới
                                </Text>
                                <Button type="link" size="small" className="p-0 ml-2 text-orange-600 font-medium">
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

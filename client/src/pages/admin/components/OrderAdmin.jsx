import { useEffect, useState } from 'react';
import {
    Table,
    Tag,
    Button,
    Modal,
    Descriptions,
    Image,
    Input,
    Select,
    Space,
    Card,
    Divider,
    Typography,
    Badge,
    Tooltip,
    message,
} from 'antd';
import {
    Eye,
    Edit,
    Search,
    Filter,
    Package,
    User,
    Calendar,
    DollarSign,
    Truck,
    CheckCircle,
    XCircle,
    Clock,
    ShoppingBag,
} from 'lucide-react';
import dayjs from 'dayjs';
import { requestGetAllOrder, requestUpdateOrderStatus } from '../../../config/PaymentsRequest';

const { Title, Text } = Typography;
const { Search: AntSearch } = Input;
const { Option } = Select;

function OrderAdmin() {
    const [orders, setOrders] = useState([]);
    const [filteredOrders, setFilteredOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedOrder, setSelectedOrder] = useState(null);
    const [isModalVisible, setIsModalVisible] = useState(false);
    const [searchText, setSearchText] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');

    useEffect(() => {
        fetchOrders();
    }, []);

    useEffect(() => {
        filterOrders();
    }, [orders, searchText, statusFilter]);

    const fetchOrders = async () => {
        try {
            setLoading(true);
            const res = await requestGetAllOrder();
            setOrders(res.metadata || []);
        } catch (error) {
            message.error('Lỗi khi tải danh sách đơn hàng');
        } finally {
            setLoading(false);
        }
    };

    const filterOrders = () => {
        let filtered = orders;

        if (searchText) {
            filtered = filtered.filter(
                (order) =>
                    order._id.toLowerCase().includes(searchText.toLowerCase()) ||
                    order.user?.fullName?.toLowerCase().includes(searchText.toLowerCase()) ||
                    order.user?.email?.toLowerCase().includes(searchText.toLowerCase()),
            );
        }

        if (statusFilter !== 'all') {
            filtered = filtered.filter((order) => order.status === statusFilter);
        }

        setFilteredOrders(filtered);
    };

    const getStatusColor = (status) => {
        const statusColors = {
            pending: 'orange',
            confirmed: 'blue',
            shipped: 'purple',
            delivered: 'green',
            cancelled: 'red',
        };
        return statusColors[status] || 'default';
    };

    const getStatusIcon = (status) => {
        const icons = {
            pending: <Clock className="w-4 h-4" />,
            confirmed: <CheckCircle className="w-4 h-4" />,
            shipped: <Truck className="w-4 h-4" />,
            delivered: <Package className="w-4 h-4" />,
            cancelled: <XCircle className="w-4 h-4" />,
        };
        return icons[status] || <Clock className="w-4 h-4" />;
    };

    const getStatusText = (status) => {
        const statusTexts = {
            pending: 'Chờ xác nhận',
            confirmed: 'Đã xác nhận',
            shipped: 'Đang giao hàng',
            delivered: 'Đã giao hàng',
            cancelled: 'Đã hủy',
        };
        return statusTexts[status] || status;
    };

    const updateOrderStatus = async (orderId, newStatus) => {
        try {
            await requestUpdateOrderStatus(orderId, newStatus);

            setOrders((prevOrders) =>
                prevOrders.map((order) => (order._id === orderId ? { ...order, status: newStatus } : order)),
            );
            message.success('Cập nhật trạng thái đơn hàng thành công');
        } catch (error) {
            console.error('Error updating order status:', error);
            message.error('Lỗi khi cập nhật trạng thái đơn hàng');
        }
    };

    const formatPrice = (price) => {
        return new Intl.NumberFormat('vi-VN', {
            style: 'currency',
            currency: 'VND',
        }).format(price);
    };

    const showOrderDetails = (order) => {
        setSelectedOrder(order);
        setIsModalVisible(true);
    };

    const columns = [
        {
            title: 'Mã đơn hàng',
            dataIndex: '_id',
            key: '_id',
            width: 200,
            render: (id) => (
                <Text code className="text-blue-600">
                    {id.slice(-8)}
                </Text>
            ),
        },
        {
            title: 'Khách hàng',
            dataIndex: 'user',
            key: 'user',
            width: 200,
            render: (user) => (
                <div className="flex items-center space-x-2">
                    <User className="w-4 h-4 text-gray-500" />
                    <div>
                        <div className="font-medium">{user?.fullName}</div>
                        <div className="text-sm text-gray-500">{user?.email}</div>
                    </div>
                </div>
            ),
        },

        {
            title: 'Tổng tiền',
            dataIndex: 'totalPrice',
            key: 'totalPrice',
            width: 120,
            align: 'right',
            render: (price, record) => (
                <div>
                    <div className="font-semibold text-green-600">{formatPrice(record.finalPrice || price)}</div>
                    {record.coupon && (
                        <Tag color="red" size="small">
                            Giảm {record.coupon.discount}%
                        </Tag>
                    )}
                </div>
            ),
        },

        {
            title: 'Ngày đặt',
            dataIndex: 'createdAt',
            key: 'createdAt',
            width: 120,
            render: (date) => (
                <div className="flex items-center space-x-1">
                    <Calendar className="w-4 h-4 text-gray-500" />
                    <span>{dayjs(date).format('DD/MM/YYYY')}</span>
                </div>
            ),
        },
        {
            title: 'Trạng thái',
            dataIndex: 'status',
            key: 'status',
            width: 150,
            render: (status) => (
                <Tag className="flex items-center" color={getStatusColor(status)}>
                    {getStatusText(status)}
                </Tag>
            ),
        },
        {
            title: 'Hành động',
            key: 'actions',
            width: 120,
            align: 'center',
            render: (_, record) => (
                <Space>
                    <Tooltip title="Xem chi tiết">
                        <Button
                            type="primary"
                            icon={<Eye className="w-4 h-4" />}
                            onClick={() => showOrderDetails(record)}
                            size="small"
                        />
                    </Tooltip>
                    <Select
                        value={record.status}
                        className="w-32"
                        onChange={(value) => updateOrderStatus(record._id, value)}
                        size="small"
                    >
                        <Option value="pending">
                            <Space>
                                <Clock className="w-3 h-3" />
                                Chờ xác nhận
                            </Space>
                        </Option>
                        <Option value="confirmed">
                            <Space>
                                <CheckCircle className="w-3 h-3" />
                                Đã xác nhận
                            </Space>
                        </Option>
                        <Option value="shipped">
                            <Space>
                                <Truck className="w-3 h-3" />
                                Đang giao hàng
                            </Space>
                        </Option>
                        <Option value="delivered">
                            <Space>
                                <Package className="w-3 h-3" />
                                Đã giao hàng
                            </Space>
                        </Option>
                        <Option value="cancelled">
                            <Space>
                                <XCircle className="w-3 h-3" />
                                Đã hủy
                            </Space>
                        </Option>
                    </Select>
                </Space>
            ),
        },
    ];

    return (
        <div className="p-6 bg-gray-50 min-h-screen">
            <Card className="shadow-sm">
                <div className="mb-6">
                    <Title level={2} className="flex items-center space-x-2 mb-4">
                        <Package className="w-8 h-8 text-blue-600" />
                        <span>Quản lý đơn hàng</span>
                    </Title>

                    <div className="flex flex-col sm:flex-row gap-4 mb-4">
                        <AntSearch
                            placeholder="Tìm kiếm theo mã đơn hàng, tên khách hàng, email..."
                            allowClear
                            className="flex-1"
                            prefix={<Search className="w-4 h-4 text-gray-400" />}
                            onChange={(e) => setSearchText(e.target.value)}
                        />

                        <Select
                            value={statusFilter}
                            onChange={setStatusFilter}
                            className="w-56"
                            placeholder="Lọc theo trạng thái"
                            suffixIcon={<Filter className="w-4 h-4" />}
                        >
                            <Option value="all">
                                <Space>
                                    <Package className="w-4 h-4" />
                                    Tất cả trạng thái
                                </Space>
                            </Option>
                            <Option value="pending">
                                <Space>
                                    <Clock className="w-4 h-4" />
                                    Chờ xác nhận
                                </Space>
                            </Option>
                            <Option value="confirmed">
                                <Space>
                                    <CheckCircle className="w-4 h-4" />
                                    Đã xác nhận
                                </Space>
                            </Option>
                            <Option value="shipped">
                                <Space>
                                    <Truck className="w-4 h-4" />
                                    Đang giao hàng
                                </Space>
                            </Option>
                            <Option value="delivered">
                                <Space>
                                    <Package className="w-4 h-4" />
                                    Đã giao hàng
                                </Space>
                            </Option>
                            <Option value="cancelled">
                                <Space>
                                    <XCircle className="w-4 h-4" />
                                    Đã hủy
                                </Space>
                            </Option>
                        </Select>
                    </div>
                </div>

                <Table
                    columns={columns}
                    dataSource={filteredOrders}
                    loading={loading}
                    rowKey="_id"
                    pagination={{
                        total: filteredOrders.length,
                        pageSize: 10,
                        showSizeChanger: true,
                        showQuickJumper: true,
                        showTotal: (total, range) => `${range[0]}-${range[1]} của ${total} đơn hàng`,
                    }}
                    scroll={{ x: 1200 }}
                    className="bg-white rounded-lg"
                />
            </Card>

            {/* Order Details Modal */}
            <Modal
                title={
                    <div className="flex items-center space-x-2">
                        <Eye className="w-5 h-5 text-blue-600" />
                        <span>Chi tiết đơn hàng #{selectedOrder?._id.slice(-8)}</span>
                    </div>
                }
                open={isModalVisible}
                onCancel={() => setIsModalVisible(false)}
                footer={null}
                width={800}
                className="order-details-modal"
            >
                {selectedOrder && (
                    <div className="space-y-6">
                        {/* Order Info */}
                        <Card title="Thông tin đơn hàng" size="small">
                            <Descriptions column={2}>
                                <Descriptions.Item label="Mã đơn hàng">
                                    <Text code>{selectedOrder._id}</Text>
                                </Descriptions.Item>
                                <Descriptions.Item label="Ngày đặt">
                                    {dayjs(selectedOrder.createdAt).format('DD/MM/YYYY HH:mm')}
                                </Descriptions.Item>
                                <Descriptions.Item label="Trạng thái">
                                    <Tag
                                        color={getStatusColor(selectedOrder.status)}
                                        icon={getStatusIcon(selectedOrder.status)}
                                    >
                                        {getStatusText(selectedOrder.status)}
                                    </Tag>
                                </Descriptions.Item>
                                <Descriptions.Item label="Phương thức thanh toán">
                                    <Tag color="blue">{selectedOrder.paymentMethod?.toUpperCase()}</Tag>
                                </Descriptions.Item>
                            </Descriptions>
                        </Card>

                        {/* Customer Info */}
                        <Card title="Thông tin khách hàng" size="small">
                            <Descriptions column={2}>
                                <Descriptions.Item label="Họ tên">{selectedOrder.user?.fullName}</Descriptions.Item>
                                <Descriptions.Item label="Email">{selectedOrder.user?.email}</Descriptions.Item>
                                <Descriptions.Item label="Số điện thoại">
                                    {selectedOrder.user?.phone || 'Chưa cập nhật'}
                                </Descriptions.Item>
                            </Descriptions>
                        </Card>

                        {/* Order Items */}
                        <Card title="Sản phẩm đặt hàng" size="small">
                            <div className="space-y-4">
                                {selectedOrder.items?.map((item, index) => (
                                    <div key={index} className="flex items-center space-x-4 p-4 bg-gray-50 rounded-lg">
                                        <div className="w-16 h-16 bg-gray-200 rounded-lg flex items-center justify-center">
                                            <img
                                                src={`${import.meta.env.VITE_API_URL}/uploads/products/${item.image}`}
                                                alt={item.name}
                                            />
                                        </div>
                                        <div className="flex-1">
                                            <div className="font-medium">{item.name}</div>
                                            <div className="text-sm text-gray-500">
                                                Màu: {item.color} | Size: {item.size}
                                            </div>
                                            <div className="text-sm">Số lượng: {item.quantity} sản phẩm</div>
                                        </div>
                                        <div className="text-right">
                                            <div className="font-semibold">{formatPrice(item.subtotal)}</div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </Card>

                        {/* Order Summary */}
                        <Card title="Tổng kết đơn hàng" size="small">
                            <div className="space-y-2">
                                <div className="flex justify-between">
                                    <span>Tổng tiền hàng:</span>
                                    <span>{formatPrice(selectedOrder.totalPrice)}</span>
                                </div>
                                {selectedOrder.coupon && (
                                    <div className="flex justify-between text-red-600">
                                        <span>Giảm giá ({selectedOrder.coupon.code}):</span>
                                        <span>-{formatPrice(selectedOrder.coupon.discountAmount)}</span>
                                    </div>
                                )}
                                <Divider className="my-2" />
                                <div className="flex justify-between text-lg font-semibold">
                                    <span>Thành tiền:</span>
                                    <span className="text-green-600">{formatPrice(selectedOrder.finalPrice)}</span>
                                </div>
                            </div>
                        </Card>
                    </div>
                )}
            </Modal>
        </div>
    );
}

export default OrderAdmin;

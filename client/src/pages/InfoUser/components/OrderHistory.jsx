import { useEffect, useState } from 'react';
import { requestGetOrderHistory } from '../../../config/PaymentsRequest';
import {
    Card,
    Table,
    Tag,
    Image,
    Collapse,
    Descriptions,
    Empty,
    Spin,
    Modal,
    Rate,
    Input,
    Button,
    Upload,
    message,
    Form,
} from 'antd';
import {
    ShoppingBag,
    CreditCard,
    Clock,
    CheckCircle,
    XCircle,
    Truck,
    Package,
    Calendar,
    User,
    Phone,
    Mail,
    Ticket,
    Star,
    Camera,
    MessageSquare,
} from 'lucide-react';
import { requestCreatePreviewProduct } from '../../../config/PreviewProduct';

const { Panel } = Collapse;
const { TextArea } = Input;

function OrderHistory() {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [reviewModalVisible, setReviewModalVisible] = useState(false);
    const [selectedOrder, setSelectedOrder] = useState(null);
    const [selectedProduct, setSelectedProduct] = useState(null);
    const [reviewForm] = Form.useForm();

    useEffect(() => {
        const fetchOrderHistory = async () => {
            try {
                const res = await requestGetOrderHistory();
                setOrders(res.metadata);
            } catch (error) {
                console.error('Error fetching order history:', error);
            } finally {
                setLoading(false);
            }
        };
        fetchOrderHistory();
    }, []);

    const getStatusColor = (status) => {
        switch (status) {
            case 'pending':
                return 'orange';
            case 'confirmed':
                return 'blue';
            case 'shipping':
                return 'cyan';
            case 'delivered':
                return 'green';
            case 'cancelled':
                return 'red';
            default:
                return 'default';
        }
    };

    const getStatusIcon = (status) => {
        switch (status) {
            case 'pending':
                return <Clock className="w-4 h-4" />;
            case 'confirmed':
                return <CheckCircle className="w-4 h-4" />;
            case 'shipping':
                return <Truck className="w-4 h-4" />;
            case 'delivered':
                return <Package className="w-4 h-4" />;
            case 'cancelled':
                return <XCircle className="w-4 h-4" />;
            default:
                return <Clock className="w-4 h-4" />;
        }
    };

    const getStatusText = (status) => {
        switch (status) {
            case 'pending':
                return 'Đang xử lý';
            case 'confirmed':
                return 'Đã xác nhận';
            case 'shipping':
                return 'Đang giao';
            case 'delivered':
                return 'Đã giao';
            case 'cancelled':
                return 'Đã hủy';
            default:
                return 'Không xác định';
        }
    };

    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('vi-VN', {
            style: 'currency',
            currency: 'VND',
        }).format(amount);
    };

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString('vi-VN', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
        });
    };

    const openReviewModal = (order, product) => {
        setSelectedOrder(order);
        setSelectedProduct(product);
        setReviewModalVisible(true);
        reviewForm.resetFields();
    };

    const closeReviewModal = () => {
        setReviewModalVisible(false);
        setSelectedOrder(null);
        setSelectedProduct(null);
        reviewForm.resetFields();
    };

    const submitReview = async (values) => {
        try {
            const formData = new FormData();
            formData.append('productId', selectedProduct.idProduct);
            formData.append('rating', values.rating);
            formData.append('comment', values.comment);
            values.images?.fileList?.forEach((file) => {
                formData.append('images', file.originFileObj);
            });
            await requestCreatePreviewProduct(formData);

            message.success('Đánh giá của bạn đã được gửi thành công!');
            closeReviewModal();

            // Refresh orders to update review status
            // fetchOrderHistory();
        } catch (error) {
            console.error('Error submitting review:', error);
            message.error('Có lỗi xảy ra khi gửi đánh giá. Vui lòng thử lại!');
        }
    };

    const itemColumns = [
        {
            title: 'Sản phẩm',
            dataIndex: 'name',
            key: 'name',
            render: (text, record) => (
                <div className="flex items-center space-x-3">
                    <Image
                        width={60}
                        height={60}
                        src={`${import.meta.env.VITE_API_URL}/uploads/products/${record.image}`}
                        alt={text}
                        className="rounded-lg object-cover"
                        fallback="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAMIAAADDCAYAAADQvc6UAAABRWlDQ1BJQ0MgUHJvZmlsZQAAKJFjYGASSSwoyGFhYGDIzSspCnJ3UoiIjFJgf8LAwSDCIMogwMCcmFxc4BgQ4ANUwgCjUcG3awyMIPqyLsis7PPOq3QdDFcvjV3jOD1boQVTPQrgSkktTgbSf4A4LbmgqISBgTEFyFYuLykAsTuAbJEioKOA7DkgdjqEvQHEToKwj4DVhAQ5A9k3gGyB5IxEoBmML4BsnSQk8XQkNtReEOBxcfXxUQg1Mjc0dyHgXNJBSWpFCYh2zi+oLMpMzyhRcASGUqqCZ16yno6CkYGRAQMDKMwhqj/fAIcloxgHQqxAjIHBEugw5sUIsSQpBobtQPdLciLEVJYzMPBHMDBsayhILEqEO4DxG0txmrERhM29nYGBddr//5/DGRjYNRkY/l7////39v///y4Dmn+LgeHANwDrkl1AuO+pmgAAADhlWElmTU0AKgAAAAgAAYdpAAQAAAABAAAAGgAAAAAAAqACAAQAAAABAAAAwqADAAQAAAABAAAAwwAAAAD9b/HnAAAHlklEQVR4Ae3dP3Ik1RUG8E+UDNmyJUu2ZMmSLVmSBUuWLFmyZMmSJVmyZMuSJUu2bMmSJVuyZMmWLVmyZMvSbMmSLdmyJUuyZEmWJUu2ZMmSJUt2ZEuWLNmyJUuWbNmSJUuWLFmy9U="
                    />
                    <div>
                        <div className="font-medium text-gray-900 max-w-xs truncate">{text}</div>
                        <div className="text-sm text-gray-500">
                            Màu: {record.color} | Size: {record.size}
                        </div>
                        {record.discount > 0 && (
                            <Tag color="red" className="text-xs">
                                Giảm {record.discount}%
                            </Tag>
                        )}
                    </div>
                </div>
            ),
            width: 300,
        },
        {
            title: 'Đơn giá',
            dataIndex: 'price',
            key: 'price',
            render: (price, record) => (
                <div className="text-right">
                    {record.discount > 0 ? (
                        <>
                            <div className="text-sm text-gray-400 line-through">{formatCurrency(price)}</div>
                            <div className="font-semibold text-red-500">
                                {formatCurrency(record.priceAfterDiscount)}
                            </div>
                        </>
                    ) : (
                        <div className="font-semibold">{formatCurrency(price)}</div>
                    )}
                </div>
            ),
            width: 120,
        },
        {
            title: 'Số lượng',
            dataIndex: 'quantity',
            key: 'quantity',
            render: (quantity) => <div className="text-center font-medium">{quantity}</div>,
            width: 80,
        },
        {
            title: 'Thành tiền',
            dataIndex: 'subtotal',
            key: 'subtotal',
            render: (subtotal) => (
                <div className="text-right font-semibold text-blue-600">{formatCurrency(subtotal)}</div>
            ),
            width: 120,
        },
        {
            title: 'Hành động',
            key: 'action',
            render: (text, record) => {
                // Tìm order từ context để check status
                const currentOrder = orders.find((order) => order.items.some((item) => item._id === record._id));
                console.log(record);

                if (!record?.previewProduct?._id) {
                    return (
                        <Button
                            type="primary"
                            size="small"
                            icon={<Star className="w-4 h-4" />}
                            onClick={() => openReviewModal(currentOrder, record)}
                            className="bg-yellow-500 hover:bg-yellow-600 border-yellow-500 hover:border-yellow-600"
                        >
                            Đánh giá
                        </Button>
                    );
                } else {
                    return <span className="text-gray-400 text-sm">Đã đánh giá</span>;
                }
            },
            width: 100,
        },
    ];

    if (loading) {
        return (
            <div className="flex justify-center items-center h-64">
                <Spin size="large" />
            </div>
        );
    }

    if (orders.length === 0) {
        return <Empty description="Bạn chưa có đơn hàng nào" className="py-16" />;
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center space-x-2 mb-6">
                <ShoppingBag className="w-6 h-6 text-blue-600" />
                <h2 className="text-2xl font-bold text-gray-900">Lịch sử đơn hàng</h2>
                <Tag color="blue">{orders.length} đơn hàng</Tag>
            </div>

            <Collapse accordion className="bg-white">
                {orders.map((order) => (
                    <Panel
                        header={
                            <div className="flex items-center justify-between w-full pr-4">
                                <div className="flex items-center space-x-4">
                                    <div>
                                        <div className="font-semibold text-gray-900">
                                            Đơn hàng #{order._id.slice(-8)}
                                        </div>
                                        <div className="flex items-center space-x-2 text-sm text-gray-500">
                                            <Calendar className="w-4 h-4" />
                                            <span>{formatDate(order.createdAt)}</span>
                                        </div>
                                    </div>
                                </div>
                                <div className="flex items-center space-x-3">
                                    <Tag
                                        color={getStatusColor(order.status)}
                                        icon={getStatusIcon(order.status)}
                                        className="flex items-center space-x-1"
                                    >
                                        {getStatusText(order.status)}
                                    </Tag>
                                    <div className="text-right">
                                        <div className="font-bold text-lg text-blue-600">
                                            {formatCurrency(order.finalPrice)}
                                        </div>
                                        {order.totalPrice !== order.finalPrice && (
                                            <div className="text-sm text-gray-400 line-through">
                                                {formatCurrency(order.totalPrice)}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        }
                        key={order._id}
                    >
                        <div className="space-y-6">
                            {/* Thông tin khách hàng và đơn hàng */}
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                                <Card
                                    title={
                                        <div className="flex items-center space-x-2">
                                            <User className="w-5 h-5" />
                                            <span>Thông tin khách hàng</span>
                                        </div>
                                    }
                                    size="small"
                                >
                                    <Descriptions column={1} size="small">
                                        <Descriptions.Item
                                            label={
                                                <span className="flex items-center space-x-1">
                                                    <User className="w-4 h-4" />
                                                    <span>Tên</span>
                                                </span>
                                            }
                                        >
                                            {order.user.fullName}
                                        </Descriptions.Item>
                                        <Descriptions.Item
                                            label={
                                                <span className="flex items-center space-x-1">
                                                    <Mail className="w-4 h-4" />
                                                    <span>Email</span>
                                                </span>
                                            }
                                        >
                                            {order.user.email}
                                        </Descriptions.Item>
                                        <Descriptions.Item
                                            label={
                                                <span className="flex items-center space-x-1">
                                                    <Phone className="w-4 h-4" />
                                                    <span>Điện thoại</span>
                                                </span>
                                            }
                                        >
                                            {order.user.phone}
                                        </Descriptions.Item>
                                    </Descriptions>
                                </Card>

                                <Card
                                    title={
                                        <div className="flex items-center space-x-2">
                                            <CreditCard className="w-5 h-5" />
                                            <span>Thông tin thanh toán</span>
                                        </div>
                                    }
                                    size="small"
                                >
                                    <Descriptions column={1} size="small">
                                        <Descriptions.Item label="Phương thức">
                                            <Tag color={order.paymentMethod === 'cod' ? 'orange' : 'blue'}>
                                                {order.paymentMethod === 'cod'
                                                    ? 'Thanh toán khi nhận hàng'
                                                    : 'Chuyển khoản'}
                                            </Tag>
                                        </Descriptions.Item>
                                        <Descriptions.Item label="Tổng tiền hàng">
                                            {formatCurrency(order.totalPrice)}
                                        </Descriptions.Item>
                                        {order.coupon && (
                                            <Descriptions.Item
                                                label={
                                                    <span className="flex items-center space-x-1">
                                                        <Ticket className="w-4 h-4" />
                                                        <span>Mã giảm giá</span>
                                                    </span>
                                                }
                                            >
                                                <div>
                                                    <Tag color="red">{order.coupon.code}</Tag>
                                                    <span className="text-red-500">
                                                        -{formatCurrency(order.coupon.discountAmount)} (
                                                        {order.coupon.discount}%)
                                                    </span>
                                                </div>
                                            </Descriptions.Item>
                                        )}
                                        <Descriptions.Item label="Thành tiền">
                                            <span className="text-lg font-bold text-blue-600">
                                                {formatCurrency(order.finalPrice)}
                                            </span>
                                        </Descriptions.Item>
                                    </Descriptions>
                                </Card>
                            </div>

                            {/* Chi tiết sản phẩm */}
                            <Card
                                title={
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center space-x-2">
                                            <Package className="w-5 h-5" />
                                            <span>Chi tiết sản phẩm</span>
                                        </div>
                                        <Tag color="blue">{order.items.length} sản phẩm</Tag>
                                    </div>
                                }
                                className="overflow-hidden"
                            >
                                <Table
                                    columns={itemColumns}
                                    dataSource={order.items}
                                    pagination={false}
                                    rowKey="_id"
                                    size="small"
                                />
                            </Card>
                        </div>
                    </Panel>
                ))}
            </Collapse>

            {/* Review Modal */}
            <Modal
                title={
                    <div className="flex items-center space-x-2">
                        <Star className="w-5 h-5 text-yellow-500" />
                        <span>Đánh giá sản phẩm</span>
                    </div>
                }
                open={reviewModalVisible}
                onCancel={closeReviewModal}
                footer={null}
                width={600}
                className="review-modal"
            >
                {selectedProduct && (
                    <div className="space-y-6">
                        {/* Product Info */}
                        <div className="flex items-center space-x-4 p-4 bg-gray-50 rounded-lg">
                            <Image
                                width={80}
                                height={80}
                                src={`${import.meta.env.VITE_API_URL}/uploads/products/${selectedProduct.image}`}
                                alt={selectedProduct.name}
                                className="rounded-lg object-cover"
                                fallback="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAMIAAADDCAYAAADQvc6UAAABRWlDQ1BJQ0MgUHJvZmlsZQAAKJFjYGASSSwoyGFhYGDIzSspCnJ3UoiIjFJgf8LAwSDCIMogwMCcmFxc4BgQ4ANUwgCjUcG3awyMIPqyLsis7PPOq3QdDFcvjV3jOD1boQVTPQrgSkktTgbSf4A4LbmgqISBgTEFyFYuLykAsTuAbJEioKOA7DkgdjqEvQHEToKwj4DVhAQ5A9k3gGyB5IxEoBmML4BsnSQk8XQkNtReEOBxcfXxUQg1Mjc0dyHgXNJBSWpFCYh2zi+oLMpMzyhRcASGUqqCZ16yno6CkYGRAQMDKMwhqj/fAIcloxgHQqxAjIHBEugw5sUIsSQpBobtQPdLciLEVJYzMPBHMDBsayhILEqEO4DxG0txmrERhM29nYGBddr//5/DGRjYNRkY/l7////39v///y4Dmn+LgeHANwDrkl1AuO+pmgAAADhlWElmTU0AKgAAAAgAAYdpAAQAAAABAAAAGgAAAAAAAqACAAQAAAABAAAAwqADAAQAAAABAAAAwwAAAAD9b/HnAAAHlklEQVR4Ae3dP3Ik1RUG8E+UDNmyJUu2ZMmSLVmSBUuWLFmyZMmSJVmyZMuSJUu2bMmSJVuyZMmWLVmyZMvSbMmSLdmyJUuyZEmWJUu2ZMmSJUt2ZEuWLNmyJUuWbNmSJUuWLFmy9U="
                            />
                            <div className="flex-1">
                                <h4 className="font-semibold text-lg text-gray-900">{selectedProduct.name}</h4>
                                <div className="text-sm text-gray-500">
                                    Màu: {selectedProduct.color} | Size: {selectedProduct.size}
                                </div>
                                <div className="font-medium text-blue-600 mt-1">
                                    {formatCurrency(selectedProduct.priceAfterDiscount || selectedProduct.price)}
                                </div>
                            </div>
                        </div>

                        {/* Review Form */}
                        <Form form={reviewForm} layout="vertical" onFinish={submitReview} className="space-y-4">
                            {/* Rating */}
                            <Form.Item
                                label={
                                    <span className="flex items-center space-x-2">
                                        <Star className="w-4 h-4" />
                                        <span>Đánh giá chất lượng</span>
                                    </span>
                                }
                                name="rating"
                                rules={[{ required: true, message: 'Vui lòng chọn số sao đánh giá!' }]}
                            >
                                <Rate allowHalf className="text-2xl" />
                            </Form.Item>

                            {/* Comment */}
                            <Form.Item
                                label={
                                    <span className="flex items-center space-x-2">
                                        <MessageSquare className="w-4 h-4" />
                                        <span>Nhận xét của bạn</span>
                                    </span>
                                }
                                name="comment"
                                rules={[
                                    { required: true, message: 'Vui lòng nhập nhận xét!' },
                                    { min: 10, message: 'Nhận xét phải có ít nhất 10 ký tự!' },
                                ]}
                            >
                                <TextArea
                                    rows={4}
                                    placeholder="Chia sẻ trải nghiệm của bạn về sản phẩm này..."
                                    maxLength={500}
                                    showCount
                                />
                            </Form.Item>

                            {/* Upload Images */}
                            <Form.Item
                                label={
                                    <span className="flex items-center space-x-2">
                                        <Camera className="w-4 h-4" />
                                        <span>Thêm hình ảnh (tùy chọn)</span>
                                    </span>
                                }
                                name="images"
                            >
                                <Upload
                                    listType="picture-card"
                                    multiple
                                    accept="image/*"
                                    beforeUpload={() => false} // Prevent auto upload
                                    maxCount={5}
                                >
                                    <div className="flex flex-col items-center justify-center p-4">
                                        <Camera className="w-6 h-6 text-gray-400 mb-2" />
                                        <span className="text-sm text-gray-500">Thêm ảnh</span>
                                    </div>
                                </Upload>
                            </Form.Item>

                            {/* Action Buttons */}
                            <div className="flex justify-end space-x-3 pt-4 border-t">
                                <Button onClick={closeReviewModal} size="large">
                                    Hủy bỏ
                                </Button>
                                <Button
                                    type="primary"
                                    htmlType="submit"
                                    size="large"
                                    icon={<Star className="w-4 h-4" />}
                                    className="bg-yellow-500 hover:bg-yellow-600 border-yellow-500 hover:border-yellow-600"
                                >
                                    Gửi đánh giá
                                </Button>
                            </div>
                        </Form>
                    </div>
                )}
            </Modal>
        </div>
    );
}

export default OrderHistory;

import { useEffect, useState } from 'react';
import { requestGetWarrantyByAdmin, requestUpdateWarrantyStatus } from '../../../config/WarrantyRequest';
import {
    Card,
    Table,
    Tag,
    Image,
    Button,
    Empty,
    Spin,
    Modal,
    Descriptions,
    Select,
    message,
    Space,
    Tooltip,
    Avatar,
    Badge,
} from 'antd';
import {
    Shield,
    Clock,
    CheckCircle,
    XCircle,
    AlertTriangle,
    Package,
    Calendar,
    User,
    FileText,
    Eye,
    Edit,
    Check,
    X,
    RefreshCw,
} from 'lucide-react';

const { Option } = Select;

function WarrantyAdmin() {
    const [warranty, setWarranty] = useState([]);
    const [loading, setLoading] = useState(true);
    const [detailModalVisible, setDetailModalVisible] = useState(false);
    const [selectedWarranty, setSelectedWarranty] = useState(null);
    const [updating, setUpdating] = useState(false);

    useEffect(() => {
        const fetchWarranty = async () => {
            try {
                const res = await requestGetWarrantyByAdmin();
                setWarranty(res.metadata);
            } catch (error) {
                console.error('Error fetching warranty:', error);
            } finally {
                setLoading(false);
            }
        };
        fetchWarranty();
    }, []);

    const getStatusColor = (status) => {
        switch (status) {
            case 'pending':
                return 'orange';
            case 'approved':
                return 'blue';
            case 'processing':
                return 'cyan';
            case 'completed':
                return 'green';
            case 'rejected':
                return 'red';
            default:
                return 'default';
        }
    };

    const getStatusIcon = (status) => {
        switch (status) {
            case 'pending':
                return <Clock className="w-4 h-4" />;
            case 'approved':
                return <CheckCircle className="w-4 h-4" />;
            case 'processing':
                return <RefreshCw className="w-4 h-4" />;
            case 'completed':
                return <Package className="w-4 h-4" />;
            case 'rejected':
                return <XCircle className="w-4 h-4" />;
            default:
                return <Shield className="w-4 h-4" />;
        }
    };

    const getStatusText = (status) => {
        switch (status) {
            case 'pending':
                return 'Đang chờ xử lý';
            case 'approved':
                return 'Đã chấp nhận';
            case 'processing':
                return 'Đang xử lý';
            case 'completed':
                return 'Hoàn thành';
            case 'rejected':
                return 'Từ chối';
            default:
                return 'Không xác định';
        }
    };

    const getReasonText = (reason) => {
        switch (reason) {
            case 'defect':
                return 'Sản phẩm bị lỗi';
            case 'wrong_size':
                return 'Sai size';
            case 'wrong_color':
                return 'Sai màu sắc';
            case 'damaged':
                return 'Hư hại trong vận chuyển';
            case 'not_as_described':
                return 'Không đúng mô tả';
            case 'other':
                return 'Khác';
            default:
                return reason || 'Chưa có lý do';
        }
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

    const openDetailModal = (warrantyItem) => {
        setSelectedWarranty(warrantyItem);
        setDetailModalVisible(true);
    };

    const closeDetailModal = () => {
        setDetailModalVisible(false);
        setSelectedWarranty(null);
    };

    const updateWarrantyStatus = async (warrantyId, newStatus) => {
        try {
            setUpdating(true);
            // TODO: Implement API call to update warranty status
            // await requestUpdateWarrantyStatus(warrantyId, newStatus);
            await requestUpdateWarrantyStatus(warrantyId, newStatus);

            // Update local state
            setWarranty((prevWarranty) =>
                prevWarranty.map((item) => (item._id === warrantyId ? { ...item, status: newStatus } : item)),
            );

            message.success('Cập nhật trạng thái thành công!');
            closeDetailModal();
        } catch (error) {
            console.error('Error updating warranty status:', error);
            message.error('Có lỗi xảy ra khi cập nhật trạng thái!');
        } finally {
            setUpdating(false);
        }
    };

    const getStatusCount = () => {
        const counts = warranty.reduce((acc, item) => {
            acc[item.status] = (acc[item.status] || 0) + 1;
            return acc;
        }, {});
        return counts;
    };

    const statusCounts = getStatusCount();

    const columns = [
        {
            title: 'Mã yêu cầu',
            dataIndex: '_id',
            key: '_id',
            render: (id) => <span className="font-mono text-sm bg-gray-100 px-2 py-1 rounded">#{id.slice(-8)}</span>,
            width: 120,
        },
        {
            title: 'Sản phẩm',
            dataIndex: 'productId',
            key: 'productId',
            render: (product) => (
                <div className="flex items-center space-x-3">
                    <Image
                        width={50}
                        height={50}
                        src={`${import.meta.env.VITE_URL_IMAGE}/uploads/products/${product.colors[0].images}`}
                        alt={product.name}
                        className="rounded-lg object-cover"
                        fallback="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAMIAAADDCAYAAADQvc6UAAABRWlDQ1BJQ0MgUHJvZmlsZQAAKJFjYGASSSwoyGFhYGDIzSspCnJ3UoiIjFJgf8LAwSDCIMogwMCcmFxc4BgQ4ANUwgCjUcG3awyMIPqyLsis7PPOq3QdDFcvjV3jOD1boQVTPQrgSkktTgbSf4A4LbmgqISBgTEFyFYuLykAsTuAbJEioKOA7DkgdjqEvQHEToKwj4DVhAQ5A9k3gGyB5IxEoBmML4BsnSQk8XQkNtReEOBxcfXxUQg1Mjc0dyHgXNJBSWpFCYh2zi+oLMpMzyhRcASGUqqCZ16yno6CkYGRAQMDKMwhqj/fAIcloxgHQqxAjIHBEugw5sUIsSQpBobtQPdLciLEVJYzMPBHMDBsayhILEqEO4DxG0txmrERhM29nYGBddr//5/DGRjYNRkY/l7////39v///y4Dmn+LgeHANwDrkl1AuO+pmgAAADhlWElmTU0AKgAAAAgAAYdpAAQAAAABAAAAGgAAAAAAAqACAAQAAAABAAAAwqADAAQAAAABAAAAwwAAAAD9b/HnAAAHlklEQVR4Ae3dP3Ik1RUG8E+UDNmyJUu2ZMmSLVmSBUuWLFmyZMmSJVmyZMuSJUu2bMmSJVuyZMmWLVmyZMvSbMmSLdmyJUuyZEmWJUu2ZMmSJUt2ZEuWLNmyJUuWbNmSJUuWLFmy9U="
                    />
                    <div>
                        <div className="font-medium text-gray-900 max-w-xs truncate">{product.name}</div>
                        <div className="text-sm text-gray-500">ID: #{product._id.slice(-8)}</div>
                    </div>
                </div>
            ),
            width: 250,
        },
        {
            title: 'Khách hàng',
            dataIndex: 'userId',
            key: 'userId',
            render: (userId) => (
                <div className="flex items-center space-x-2">
                    <Avatar size="small" icon={<User className="w-4 h-4" />} />
                    <span className="text-sm font-mono">{userId.email}</span>
                </div>
            ),
            width: 120,
        },
        {
            title: 'Lý do',
            dataIndex: 'reason',
            key: 'reason',
            render: (reason) => (
                <Tag color="blue" className="text-xs">
                    {getReasonText(reason)}
                </Tag>
            ),
            width: 150,
        },
        {
            title: 'Ngày yêu cầu',
            dataIndex: 'receivedDate',
            key: 'receivedDate',
            render: (date) => (
                <div className="flex items-center space-x-2 text-sm">
                    <Calendar className="w-4 h-4 text-gray-400" />
                    <span>{formatDate(date)}</span>
                </div>
            ),
            width: 180,
        },
        {
            title: 'Trạng thái',
            dataIndex: 'status',
            key: 'status',
            render: (status) => (
                <Tag
                    color={getStatusColor(status)}
                    icon={getStatusIcon(status)}
                    className="flex items-center space-x-1"
                >
                    {getStatusText(status)}
                </Tag>
            ),
            width: 130,
        },
        {
            title: 'Hành động',
            key: 'action',
            render: (text, record) => (
                <Space>
                    <Tooltip title="Xem chi tiết">
                        <Button
                            size="small"
                            icon={<Eye className="w-4 h-4" />}
                            onClick={() => openDetailModal(record)}
                        />
                    </Tooltip>
                    {record.status === 'pending' && (
                        <>
                            <Tooltip title="Chấp nhận">
                                <Button
                                    size="small"
                                    type="primary"
                                    icon={<Check className="w-4 h-4" />}
                                    onClick={() => updateWarrantyStatus(record._id, 'approved')}
                                    className="bg-green-500 hover:bg-green-600 border-green-500"
                                />
                            </Tooltip>
                            <Tooltip title="Từ chối">
                                <Button
                                    size="small"
                                    danger
                                    icon={<X className="w-4 h-4" />}
                                    onClick={() => updateWarrantyStatus(record._id, 'rejected')}
                                />
                            </Tooltip>
                        </>
                    )}
                </Space>
            ),
            width: 150,
        },
    ];

    if (loading) {
        return (
            <div className="flex justify-center items-center h-64">
                <Spin size="large" />
            </div>
        );
    }

    return (
        <div className="p-6 bg-gray-50 min-h-screen">
            <Card className="shadow-sm">
                <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                        <h2 className="text-2xl font-bold text-gray-900">Quản lý bảo hành</h2>
                    </div>
                </div>
            </Card>

            {warranty.length === 0 ? (
                <Empty description="Chưa có yêu cầu bảo hành nào" className="py-16" />
            ) : (
                <Card className="overflow-hidden">
                    <Table
                        columns={columns}
                        dataSource={warranty}
                        rowKey="_id"
                        pagination={{
                            pageSize: 10,
                            showSizeChanger: true,
                            showQuickJumper: true,
                            showTotal: (total, range) => `${range[0]}-${range[1]} của ${total} yêu cầu`,
                        }}
                    />
                </Card>
            )}

            {/* Detail Modal */}
            <Modal
                title={
                    <div className="flex items-center space-x-2">
                        <FileText className="w-5 h-5 text-blue-500" />
                        <span>Chi tiết yêu cầu bảo hành</span>
                    </div>
                }
                open={detailModalVisible}
                onCancel={closeDetailModal}
                width={800}
                footer={
                    selectedWarranty?.status === 'pending' ? (
                        <div className="flex justify-end space-x-2">
                            <Button onClick={closeDetailModal}>Đóng</Button>
                            <Button
                                danger
                                icon={<X className="w-4 h-4" />}
                                onClick={() => updateWarrantyStatus(selectedWarranty._id, 'rejected')}
                                loading={updating}
                            >
                                Từ chối
                            </Button>
                            <Button
                                type="primary"
                                icon={<Check className="w-4 h-4" />}
                                onClick={() => updateWarrantyStatus(selectedWarranty._id, 'approved')}
                                loading={updating}
                                className="bg-green-500 hover:bg-green-600 border-green-500"
                            >
                                Chấp nhận
                            </Button>
                        </div>
                    ) : (
                        <div className="flex justify-between items-center">
                            <Select
                                value={selectedWarranty?.status}
                                onChange={(newStatus) => updateWarrantyStatus(selectedWarranty._id, newStatus)}
                                className="w-48"
                                disabled={updating}
                            >
                                <Option value="approved">Đã chấp nhận</Option>
                                <Option value="processing">Đang xử lý</Option>
                                <Option value="completed">Hoàn thành</Option>
                                <Option value="rejected">Từ chối</Option>
                            </Select>
                            <Button onClick={closeDetailModal}>Đóng</Button>
                        </div>
                    )
                }
            >
                {selectedWarranty && (
                    <div className="space-y-6">
                        {/* Product and Customer Info */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <Card title="Thông tin sản phẩm" size="small">
                                <div className="flex items-center space-x-4 mb-4">
                                    <Image
                                        width={80}
                                        height={80}
                                        src={`${import.meta.env.VITE_URL_IMAGE}/uploads/products/${
                                            selectedWarranty.productId.colors[0].images
                                        }`}
                                        alt={selectedWarranty.productId.name}
                                        className="rounded-lg object-cover"
                                        fallback="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAMIAAADDCAYAAADQvc6UAAABRWlDQ1BJQ0MgUHJvZmlsZQAAKJFjYGASSSwoyGFhYGDIzSspCnJ3UoiIjFJgf8LAwSDCIMogwMCcmFxc4BgQ4ANUwgCjUcG3awyMIPqyLsis7PPOq3QdDFcvjV3jOD1boQVTPQrgSkktTgbSf4A4LbmgqISBgTEFyFYuLykAsTuAbJEioKOA7DkgdjqEvQHEToKwj4DVhAQ5A9k3gGyB5IxEoBmML4BsnSQk8XQkNtReEOBxcfXxUQg1Mjc0dyHgXNJBSWpFCYh2zi+oLMpMzyhRcASGUqqCZ16yno6CkYGRAQMDKMwhqj/fAIcloxgHQqxAjIHBEugw5sUIsSQpBobtQPdLciLEVJYzMPBHMDBsayhILEqEO4DxG0txmrERhM29nYGBddr//5/DGRjYNRkY/l7////39v///y4Dmn+LgeHANwDrkl1AuO+pmgAAADhlWElmTU0AKgAAAAgAAYdpAAQAAAABAAAAGgAAAAAAAqACAAQAAAABAAAAwqADAAQAAAABAAAAwwAAAAD9b/HnAAAHlklEQVR4Ae3dP3Ik1RUG8E+UDNmyJUu2ZMmSLVmSBUuWLFmyZMmSJVmyZMuSJUu2bMmSJVuyZMmWLVmyZMvSbMmSLdmyJUuyZEmWJUu2ZMmSJUt2ZEuWLNmyJUuWbNmSJUuWLFmy9U="
                                    />
                                    <div>
                                        <h4 className="font-semibold">{selectedWarranty.productId.name}</h4>
                                        <p className="text-sm text-gray-500">
                                            ID: #{selectedWarranty.productId._id.slice(-8)}
                                        </p>
                                    </div>
                                </div>
                            </Card>

                            <Card title="Thông tin yêu cầu" size="small">
                                <Descriptions column={1} size="small">
                                    <Descriptions.Item label="Mã yêu cầu">
                                        #{selectedWarranty._id.slice(-8)}
                                    </Descriptions.Item>
                                    <Descriptions.Item label="Khách hàng">
                                        {selectedWarranty.userId.email}
                                    </Descriptions.Item>
                                    <Descriptions.Item label="Ngày yêu cầu">
                                        {formatDate(selectedWarranty.receivedDate)}
                                    </Descriptions.Item>
                                    <Descriptions.Item label="Hết hạn">
                                        {formatDate(selectedWarranty.returnDate)}
                                    </Descriptions.Item>
                                </Descriptions>
                            </Card>
                        </div>

                        {/* Request Details */}
                        <Card title="Chi tiết yêu cầu" size="small">
                            <Descriptions column={1}>
                                <Descriptions.Item label="Lý do">
                                    <Tag color="blue">{getReasonText(selectedWarranty.reason)}</Tag>
                                </Descriptions.Item>
                                <Descriptions.Item label="Trạng thái hiện tại">
                                    <Tag
                                        color={getStatusColor(selectedWarranty.status)}
                                        icon={getStatusIcon(selectedWarranty.status)}
                                    >
                                        {getStatusText(selectedWarranty.status)}
                                    </Tag>
                                </Descriptions.Item>
                                {selectedWarranty.description && (
                                    <Descriptions.Item label="Mô tả chi tiết">
                                        <div className="bg-gray-50 p-3 rounded text-sm max-h-32 overflow-y-auto">
                                            {selectedWarranty.description}
                                        </div>
                                    </Descriptions.Item>
                                )}
                            </Descriptions>
                        </Card>

                        {/* Images */}
                        {selectedWarranty.images && selectedWarranty.images.length > 0 && (
                            <Card title="Hình ảnh minh chứng" size="small">
                                <div className="grid grid-cols-3 md:grid-cols-5 gap-4">
                                    {selectedWarranty.images.map((image, index) => {
                                        console.log(`${import.meta.env.VITE_URL_IMAGE}/uploads/warranty/${image}`);
                                        return (
                                            <Image
                                                key={index}
                                                width={120}
                                                height={120}
                                                src={`${import.meta.env.VITE_URL_IMAGE}/uploads/warranty/${image}`}
                                                alt={`Evidence ${index + 1}`}
                                                className="rounded-lg object-cover"
                                            />
                                        );
                                    })}
                                </div>
                            </Card>
                        )}
                    </div>
                )}
            </Modal>
        </div>
    );
}

export default WarrantyAdmin;

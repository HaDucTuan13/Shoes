import { useState, useEffect } from 'react';
import {
    Table,
    Card,
    Button,
    Tag,
    Space,
    Modal,
    Form,
    Input,
    Select,
    message,
    Popconfirm,
    Tooltip,
    Badge,
    Row,
    Col,
    Statistic,
    DatePicker,
    InputNumber,
} from 'antd';
import {
    EyeOutlined,
    EditOutlined,
    DeleteOutlined,
    MailOutlined,
    PhoneOutlined,
    UserOutlined,
    MessageOutlined,
    SearchOutlined,
    FilterOutlined,
    ReloadOutlined,
    CheckCircleOutlined,
    ClockCircleOutlined,
    ExclamationCircleOutlined,
    CalendarOutlined,
    TagOutlined,
} from '@ant-design/icons';
import { requestGetContacts, requestUpdateContact } from '../../../config/ContactRequest';

const { TextArea } = Input;
const { Option } = Select;
const { RangePicker } = DatePicker;

function ContactManager() {
    const [contacts, setContacts] = useState([]);
    const [loading, setLoading] = useState(false);
    const [selectedContact, setSelectedContact] = useState(null);
    const [isModalVisible, setIsModalVisible] = useState(false);
    const [isEditModalVisible, setIsEditModalVisible] = useState(false);
    const [form] = Form.useForm();
    const [editForm] = Form.useForm();
    const [searchText, setSearchText] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');
    const [typeFilter, setTypeFilter] = useState('all');
    const [dateRange, setDateRange] = useState(null);

    // Statistics
    const [stats, setStats] = useState({
        total: 0,
        pending: 0,
        processing: 0,
        completed: 0,
    });

    useEffect(() => {
        fetchContacts();
    }, []);

    const fetchContacts = async () => {
        setLoading(true);
        try {
            const response = await requestGetContacts();
            setContacts(response.metadata || []);
            calculateStats(response.metadata || []);
        } catch (error) {
            message.error('Lỗi khi tải danh sách liên hệ');
        } finally {
            setLoading(false);
        }
    };

    const calculateStats = (data) => {
        const total = data.length;
        const pending = data.filter((item) => item.status === 'pending').length;
        const processing = data.filter((item) => item.status === 'processing').length;
        const completed = data.filter((item) => item.status === 'completed').length;

        setStats({ total, pending, processing, completed });
    };

    const handleViewContact = (contact) => {
        setSelectedContact(contact);
        setIsModalVisible(true);
    };

    const handleUpdateContact = async (values) => {
        try {
            await requestUpdateContact(selectedContact._id, values);
            message.success('Cập nhật liên hệ thành công');
            setIsEditModalVisible(false);
            fetchContacts();
        } catch (error) {
            message.error('Lỗi khi cập nhật liên hệ');
        }
    };

    const handleUpdateStatus = async (contactId, newStatus) => {
        try {
            await requestUpdateContact(contactId, { status: newStatus });
            message.success('Cập nhật trạng thái thành công');
            fetchContacts();
        } catch (error) {
            message.error('Lỗi khi cập nhật trạng thái');
        }
    };

    const getStatusTag = (status) => {
        const statusConfig = {
            pending: { color: 'orange', text: 'Chờ xử lý', icon: <ClockCircleOutlined /> },
            processing: { color: 'blue', text: 'Đang xử lý', icon: <ExclamationCircleOutlined /> },
            completed: { color: 'green', text: 'Hoàn thành', icon: <CheckCircleOutlined /> },
        };

        const config = statusConfig[status] || statusConfig.pending;
        return (
            <Tag color={config.color} icon={config.icon}>
                {config.text}
            </Tag>
        );
    };

    const getTypeTag = (type) => {
        const typeColors = {
            'Đặt phòng': 'blue',
            'Dịch vụ': 'green',
            'Sự kiện': 'purple',
            'Khiếu nại': 'red',
            'Góp ý': 'cyan',
            Khác: 'default',
        };

        return <Tag color={typeColors[type] || 'default'}>{type}</Tag>;
    };

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleString('vi-VN');
    };

    // Filter data
    const filteredContacts = contacts.filter((contact) => {
        const matchesSearch =
            !searchText ||
            contact.fullName.toLowerCase().includes(searchText.toLowerCase()) ||
            contact.email.toLowerCase().includes(searchText.toLowerCase()) ||
            contact.phone.includes(searchText);

        const matchesStatus = statusFilter === 'all' || contact.status === statusFilter;
        const matchesType = typeFilter === 'all' || contact.type === typeFilter;

        const matchesDate =
            !dateRange ||
            (new Date(contact.createdAt) >= dateRange[0].startOf('day') &&
                new Date(contact.createdAt) <= dateRange[1].endOf('day'));

        return matchesSearch && matchesStatus && matchesType && matchesDate;
    });

    const columns = [
        {
            title: 'Thông tin liên hệ',
            key: 'contactInfo',
            width: 250,
            render: (_, record) => (
                <div>
                    <div className="flex items-center mb-1">
                        <UserOutlined className="text-blue-500 mr-2" />
                        <span className="font-semibold">{record.fullName}</span>
                    </div>
                    <div className="flex items-center mb-1">
                        <MailOutlined className="text-green-500 mr-2" />
                        <span className="text-sm text-gray-600">{record.email}</span>
                    </div>
                    <div className="flex items-center">
                        <PhoneOutlined className="text-orange-500 mr-2" />
                        <span className="text-sm text-gray-600">{record.phone}</span>
                    </div>
                </div>
            ),
        },

        {
            title: 'Tin nhắn',
            dataIndex: 'message',
            key: 'message',
            width: 200,
            render: (message) => (
                <Tooltip title={message}>
                    <div className="truncate">
                        <MessageOutlined className="mr-1" />
                        {message.length > 50 ? `${message.substring(0, 50)}...` : message}
                    </div>
                </Tooltip>
            ),
        },
        {
            title: 'Trạng thái',
            dataIndex: 'status',
            key: 'status',
            width: 120,
            render: (status) => getStatusTag(status),
        },
        {
            title: 'Ngày tạo',
            dataIndex: 'createdAt',
            key: 'createdAt',
            width: 150,
            render: (date) => (
                <div>
                    <CalendarOutlined className="mr-1" />
                    {formatDate(date)}
                </div>
            ),
        },
        {
            title: 'Hành động',
            key: 'actions',
            width: 200,
            render: (_, record) => (
                <Space>
                    <Tooltip title="Xem chi tiết">
                        <Button
                            type="primary"
                            size="small"
                            icon={<EyeOutlined />}
                            onClick={() => handleViewContact(record)}
                        />
                    </Tooltip>

                    <Select
                        value={record.status}
                        size="small"
                        style={{ width: 120 }}
                        onChange={(value) => handleUpdateStatus(record._id, value)}
                    >
                        <Option value="pending">Chờ xử lý</Option>
                        <Option value="processing">Đang xử lý</Option>
                        <Option value="completed">Hoàn thành</Option>
                    </Select>
                </Space>
            ),
        },
    ];

    return (
        <div className="p-6 bg-gray-50 min-h-screen">
            <div className="mb-6">
                <h1 className="text-2xl font-bold text-gray-800 mb-2">Quản Lý Liên Hệ</h1>
                <p className="text-gray-600">Quản lý và xử lý các yêu cầu liên hệ từ khách hàng</p>
            </div>

            {/* Statistics Cards */}
            <Row gutter={[16, 16]} className="mb-6">
                <Col xs={24} sm={6}>
                    <Card className="text-center">
                        <Statistic
                            title="Tổng số"
                            value={stats.total}
                            prefix={<MessageOutlined />}
                            valueStyle={{ color: '#1890ff' }}
                        />
                    </Card>
                </Col>
                <Col xs={24} sm={6}>
                    <Card className="text-center">
                        <Statistic
                            title="Chờ xử lý"
                            value={stats.pending}
                            prefix={<ClockCircleOutlined />}
                            valueStyle={{ color: '#fa8c16' }}
                        />
                    </Card>
                </Col>
                <Col xs={24} sm={6}>
                    <Card className="text-center">
                        <Statistic
                            title="Đang xử lý"
                            value={stats.processing}
                            prefix={<ExclamationCircleOutlined />}
                            valueStyle={{ color: '#1890ff' }}
                        />
                    </Card>
                </Col>
                <Col xs={24} sm={6}>
                    <Card className="text-center">
                        <Statistic
                            title="Hoàn thành"
                            value={stats.completed}
                            prefix={<CheckCircleOutlined />}
                            valueStyle={{ color: '#52c41a' }}
                        />
                    </Card>
                </Col>
            </Row>

            {/* Table */}
            <Card>
                <Table
                    columns={columns}
                    dataSource={filteredContacts}
                    rowKey="_id"
                    loading={loading}
                    pagination={{
                        pageSize: 10,
                        showSizeChanger: true,
                        showQuickJumper: true,
                        showTotal: (total, range) => `${range[0]}-${range[1]} của ${total} liên hệ`,
                    }}
                    scroll={{ x: 1000 }}
                />
            </Card>

            {/* View Contact Modal */}
            <Modal
                title="Chi tiết liên hệ"
                open={isModalVisible}
                onCancel={() => setIsModalVisible(false)}
                footer={[
                    <Button key="close" onClick={() => setIsModalVisible(false)}>
                        Đóng
                    </Button>,
                ]}
                width={600}
            >
                {selectedContact && (
                    <div className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="font-semibold text-gray-700">Họ và tên:</label>
                                <p className="text-gray-600">{selectedContact.fullName}</p>
                            </div>
                            <div>
                                <label className="font-semibold text-gray-700">Email:</label>
                                <p className="text-gray-600">{selectedContact.email}</p>
                            </div>
                            <div>
                                <label className="font-semibold text-gray-700">Số điện thoại:</label>
                                <p className="text-gray-600">{selectedContact.phone}</p>
                            </div>

                            <div>
                                <label className="font-semibold text-gray-700">Trạng thái:</label>
                                <p>{getStatusTag(selectedContact.status)}</p>
                            </div>
                            <div>
                                <label className="font-semibold text-gray-700">Ngày tạo:</label>
                                <p className="text-gray-600">{formatDate(selectedContact.createdAt)}</p>
                            </div>
                        </div>
                        <div>
                            <label className="font-semibold text-gray-700">Tin nhắn:</label>
                            <div className="mt-2 p-3 bg-gray-50 rounded-lg">
                                <p className="text-gray-600">{selectedContact.message}</p>
                            </div>
                        </div>
                    </div>
                )}
            </Modal>

            {/* Edit Contact Modal */}
            <Modal
                title="Chỉnh sửa liên hệ"
                open={isEditModalVisible}
                onCancel={() => setIsEditModalVisible(false)}
                footer={null}
                width={600}
            >
                <Form form={editForm} layout="vertical" onFinish={handleUpdateContact}>
                    <Row gutter={16}>
                        <Col span={12}>
                            <Form.Item
                                name="fullName"
                                label="Họ và tên"
                                rules={[{ required: true, message: 'Vui lòng nhập họ và tên!' }]}
                            >
                                <Input />
                            </Form.Item>
                        </Col>
                        <Col span={12}>
                            <Form.Item
                                name="email"
                                label="Email"
                                rules={[
                                    { required: true, message: 'Vui lòng nhập email!' },
                                    { type: 'email', message: 'Email không hợp lệ!' },
                                ]}
                            >
                                <Input />
                            </Form.Item>
                        </Col>
                    </Row>

                    <Row gutter={16}>
                        <Col span={12}>
                            <Form.Item
                                name="phone"
                                label="Số điện thoại"
                                rules={[{ required: true, message: 'Vui lòng nhập số điện thoại!' }]}
                            >
                                <Input />
                            </Form.Item>
                        </Col>
                    </Row>

                    <Form.Item
                        name="status"
                        label="Trạng thái"
                        rules={[{ required: true, message: 'Vui lòng chọn trạng thái!' }]}
                    >
                        <Select>
                            <Option value="pending">Chờ xử lý</Option>
                            <Option value="processing">Đang xử lý</Option>
                            <Option value="completed">Hoàn thành</Option>
                        </Select>
                    </Form.Item>

                    <Form.Item
                        name="message"
                        label="Tin nhắn"
                        rules={[{ required: true, message: 'Vui lòng nhập tin nhắn!' }]}
                    >
                        <TextArea rows={4} />
                    </Form.Item>

                    <Form.Item className="mb-0">
                        <Space>
                            <Button type="primary" htmlType="submit">
                                Cập nhật
                            </Button>
                            <Button onClick={() => setIsEditModalVisible(false)}>Hủy</Button>
                        </Space>
                    </Form.Item>
                </Form>
            </Modal>
        </div>
    );
}

export default ContactManager;

import { useEffect, useState } from 'react';
import {
    Table,
    Card,
    Button,
    Modal,
    Form,
    Select,
    InputNumber,
    DatePicker,
    Space,
    Popconfirm,
    message,
    Tag,
    Typography,
    Row,
    Col,
    Statistic,
} from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined, ThunderboltOutlined, EyeOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';

import { requestCreateFlashSale, requestGetAllFlashSale, requestUpdateFlashSale, requestDeleteFlashSale } from '../../../config/flashSale';
import { requestGetAllProduct } from '../../../config/ProductRequest';

const { Title } = Typography;
const { RangePicker } = DatePicker;

function FlashSaleManagement() {
    const [flashSales, setFlashSales] = useState([]);
    const [isModalVisible, setIsModalVisible] = useState(false);
    const [editingFlashSale, setEditingFlashSale] = useState(null);
    const [form] = Form.useForm();
    const [loading, setLoading] = useState(false);

    const [products, setProducts] = useState([]);

    useEffect(() => {
        const fetchDataProduct = async () => {
            const res = await requestGetAllProduct();
            setProducts(res.metadata);
        };
        fetchDataProduct();
    }, []);

    const fetchDataFlashSale = async () => {
        const res = await requestGetAllFlashSale();
        setFlashSales(res.metadata);
    };

    useEffect(() => {
        fetchDataFlashSale();
    }, []);

    const getProductInfo = (productId) => products.find((p) => p._id === productId) || {};

    const getFlashSaleStatus = (startDate, endDate) => {
        const now = dayjs();
        const start = dayjs(startDate);
        const end = dayjs(endDate);
        if (now.isBefore(start)) return 'scheduled';
        if (now.isAfter(end)) return 'expired';
        return 'active';
    };

    const activeCount = flashSales.filter((fs) => getFlashSaleStatus(fs.startDate, fs.endDate) === 'active').length;
    const scheduledCount = flashSales.filter((fs) => getFlashSaleStatus(fs.startDate, fs.endDate) === 'scheduled').length;
    const expiredCount = flashSales.filter((fs) => getFlashSaleStatus(fs.startDate, fs.endDate) === 'expired').length;

    const handleAdd = () => {
        setEditingFlashSale(null);
        form.resetFields();
        setIsModalVisible(true);
    };

    const handleEdit = (record) => {
        setEditingFlashSale(record);
        form.setFieldsValue({
            productId: [record.productId._id], // Convert single product to array using its _id
            discount: record.discount,
            dateRange: [dayjs(record.startDate), dayjs(record.endDate)],
        });
        setIsModalVisible(true);
    };

    const handleDelete = async (id) => {
        try {
            await requestDeleteFlashSale(id);
            setFlashSales(flashSales.filter((fs) => fs._id !== id));
            message.success('Xóa flash sale thành công!');
            fetchDataFlashSale();
        } catch (error) {
            console.error(error);
            message.error('Có lỗi xảy ra khi xóa!');
        }
    };

    const handleSubmit = async (values) => {
        setLoading(true);
        try {
            if (editingFlashSale) {
                // Edit mode: only update single flash sale
                const updatedFlashSale = {
                    ...editingFlashSale,
                    productId: values.productId[0], // Take first selected product
                    discount: values.discount,
                    startDate: values.dateRange[0].toISOString(),
                    endDate: values.dateRange[1].toISOString(),
                };
                await requestUpdateFlashSale(editingFlashSale._id, updatedFlashSale);

                message.success('Cập nhật flash sale thành công!');
            } else {
                // Add mode: check for duplicate products
                const existingProductIds = flashSales
                    .filter(
                        (fs) =>
                            getFlashSaleStatus(fs.startDate, fs.endDate) === 'active' ||
                            getFlashSaleStatus(fs.startDate, fs.endDate) === 'scheduled',
                    )
                    .map((fs) => fs.productId._id || fs.productId);

                const duplicateProducts = values.productId.filter((id) => existingProductIds.includes(id));
                const validProducts = values.productId.filter((id) => !existingProductIds.includes(id));

                if (duplicateProducts.length > 0) {
                    const duplicateNames = duplicateProducts.map((id) => getProductInfo(id).productName);
                    message.warning(`Các sản phẩm sau đã có flash sale đang hoạt động: ${duplicateNames.join(', ')}`);
                }

                if (validProducts.length === 0) {
                    message.error('Không có sản phẩm nào có thể thêm flash sale!');
                    setLoading(false);
                    return;
                }

                // Create flash sale for valid products only
                const newFlashSales = validProducts.map((productId, index) => ({
                    productId: productId,
                    discount: values.discount,
                    startDate: values.dateRange[0].toISOString(),
                    endDate: values.dateRange[1].toISOString(),
                    status: getFlashSaleStatus(values.dateRange[0], values.dateRange[1]),
                }));

                await requestCreateFlashSale(newFlashSales);

                setFlashSales([...flashSales, ...newFlashSales]);
                message.success(`Thêm ${newFlashSales.length} flash sale thành công!`);
            }

            fetchDataFlashSale();
            setIsModalVisible(false);
            form.resetFields();
        } catch (error) {
            console.log(error);

            message.error('Có lỗi xảy ra!');
        } finally {
            setLoading(false);
        }
    };

    const columns = [
        {
            title: 'Hình ảnh',
            dataIndex: 'productId',
            key: 'images',
            width: 80,
            render: (productId) => {
                return (
                    <img
                        src={`${import.meta.env.VITE_URL_IMAGE}/uploads/products/${productId.colors?.[0]?.images}`}
                        alt={productId.name || ''}
                        className="w-16 h-16 object-cover rounded"
                    />
                );
            },
        },
        {
            title: 'Sản phẩm',
            dataIndex: 'productId',
            key: 'productName',
            render: (productId) => {
                return (
                    <div>
                        <div className="font-medium text-sm">{productId.name}</div>
                    </div>
                );
            },
        },
        {
            title: 'Giảm giá',
            dataIndex: 'discount',
            key: 'discount',
            render: (discount) => (
                <Tag color="volcano" className="font-medium text-xs">
                    -{discount}%
                </Tag>
            ),
        },
        {
            title: 'Thời gian bắt đầu',
            dataIndex: 'startDate',
            key: 'startDate',
            render: (date) => <span className="text-xs">{dayjs(date).format('DD/MM/YYYY')}</span>,
        },
        {
            title: 'Thời gian kết thúc',
            dataIndex: 'endDate',
            key: 'endDate',
            render: (date) => <span className="text-xs">{dayjs(date).format('DD/MM/YYYY')}</span>,
        },
        {
            title: 'Trạng thái',
            key: 'status',
            render: (_, record) => {
                const status = getFlashSaleStatus(record.startDate, record.endDate);
                const statusConfig = {
                    active: { color: 'green', text: 'Đang diễn ra' },
                    scheduled: { color: 'blue', text: 'Sắp diễn ra' },
                    expired: { color: 'red', text: 'Đã kết thúc' },
                };
                return (
                    <Tag color={statusConfig[status].color} icon={<ThunderboltOutlined />} className="text-xs">
                        {statusConfig[status].text}
                    </Tag>
                );
            },
        },
        {
            title: 'Thao tác',
            key: 'actions',
            fixed: 'right',
            width: 120,
            render: (_, record) => (
                <Space>
                    <Button type="primary" size="small" icon={<EditOutlined />} onClick={() => handleEdit(record)} />
                    <Popconfirm
                        title="Bạn có chắc muốn xóa?"
                        onConfirm={() => handleDelete(record._id)}
                        okText="Xóa"
                        cancelText="Hủy"
                    >
                        <Button danger size="small" icon={<DeleteOutlined />} />
                    </Popconfirm>
                </Space>
            ),
        },
    ];

    return (
        <div className="p-6">
            <div className="mb-4">
                <Title level={4} className="mb-3">
                    <ThunderboltOutlined className="text-red-500 mr-2" />
                    Quản Lý Flash Sale
                </Title>

                <Row gutter={16} className="mb-4">
                    <Col span={6}>
                        <Card>
                            <Statistic
                                title="Đang diễn ra"
                                value={activeCount}
                                valueStyle={{ color: '#3f8600' }}
                                prefix={<ThunderboltOutlined />}
                            />
                        </Card>
                    </Col>
                    <Col span={6}>
                        <Card>
                            <Statistic
                                title="Sắp diễn ra"
                                value={scheduledCount}
                                valueStyle={{ color: '#1890ff' }}
                                prefix={<EyeOutlined />}
                            />
                        </Card>
                    </Col>
                    <Col span={6}>
                        <Card>
                            <Statistic
                                title="Đã kết thúc"
                                value={expiredCount}
                                valueStyle={{ color: '#cf1322' }}
                                prefix={<DeleteOutlined />}
                            />
                        </Card>
                    </Col>
                    <Col span={6}>
                        <Card>
                            <Statistic
                                title="Tổng Flash Sale"
                                value={flashSales.length}
                                valueStyle={{ color: '#722ed1' }}
                            />
                        </Card>
                    </Col>
                </Row>

                <Button type="primary" icon={<PlusOutlined />} onClick={handleAdd} size="middle" className="mb-3">
                    Thêm Flash Sale Mới
                </Button>
            </div>

            <Card>
                <Table
                    columns={columns}
                    dataSource={flashSales}
                    rowKey="_id"
                    size="small"
                    scroll={{ x: 1200 }}
                    pagination={{
                        pageSize: 10,
                        showSizeChanger: true,
                        showQuickJumper: true,
                        showTotal: (total) => `Tổng ${total} flash sale`,
                        size: 'small',
                    }}
                />
            </Card>

            <Modal
                title={editingFlashSale ? 'Chỉnh sửa Flash Sale' : 'Thêm Flash Sale Mới'}
                open={isModalVisible}
                onCancel={() => setIsModalVisible(false)}
                footer={null}
                width={600}
            >
                <Form form={form} layout="vertical" onFinish={handleSubmit} className="mt-4">
                    <Form.Item
                        name="productId"
                        label="Chọn sản phẩm"
                        rules={[{ required: true, message: 'Vui lòng chọn ít nhất một sản phẩm!' }]}
                        tooltip="Bạn có thể chọn nhiều sản phẩm để áp dụng flash sale cùng lúc"
                    >
                        <Select
                            mode="multiple"
                            placeholder="Chọn một hoặc nhiều sản phẩm"
                            showSearch
                            size="middle"
                            maxTagCount="responsive"
                        >
                            {products.map((product) => {
                                const existingFlashSale = flashSales.find(
                                    (fs) =>
                                        (fs.productId._id || fs.productId) === product._id &&
                                        (getFlashSaleStatus(fs.startDate, fs.endDate) === 'active' ||
                                            getFlashSaleStatus(fs.startDate, fs.endDate) === 'scheduled'),
                                );
                                const isDisabled = existingFlashSale && !editingFlashSale;

                                return (
                                    <Select.Option key={product._id} value={product._id} disabled={isDisabled}>
                                        <div className="flex items-center space-x-2">
                                            <img
                                                src={`${import.meta.env.VITE_URL_IMAGE}/uploads/products/${
                                                    product.colors?.[0]?.images
                                                }`}
                                                alt={product.name || ''}
                                                className="w-8 h-8 object-cover rounded"
                                            />
                                            <div>
                                                <div
                                                    className={`font-medium text-sm ${
                                                        isDisabled ? 'text-gray-400' : ''
                                                    }`}
                                                >
                                                    {product.name}
                                                    {isDisabled && ' (Đã có Flash Sale)'}
                                                </div>
                                            </div>
                                        </div>
                                    </Select.Option>
                                );
                            })}
                        </Select>
                    </Form.Item>

                    <Form.Item
                        name="discount"
                        label="Phần trăm giảm giá (%)"
                        rules={[
                            { required: true, message: 'Vui lòng nhập phần trăm giảm giá!' },
                            { type: 'number', min: 1, max: 99, message: 'Giảm giá phải từ 1% đến 99%!' },
                        ]}
                    >
                        <InputNumber
                            min={1}
                            max={99}
                            placeholder="Nhập phần trăm giảm giá"
                            size="middle"
                            className="w-full"
                            addonAfter="%"
                        />
                    </Form.Item>

                    <Form.Item
                        name="dateRange"
                        label="Thời gian Flash Sale"
                        rules={[{ required: true, message: 'Vui lòng chọn thời gian flash sale!' }]}
                    >
                        <RangePicker
                            format="DD/MM/YYYY"
                            placeholder={['Thời gian bắt đầu', 'Thời gian kết thúc']}
                            size="middle"
                            className="w-full"
                        />
                    </Form.Item>

                    <Form.Item className="mb-0 text-right">
                        <Space>
                            <Button onClick={() => setIsModalVisible(false)} size="middle">
                                Hủy
                            </Button>
                            <Button type="primary" htmlType="submit" loading={loading} size="middle">
                                {editingFlashSale ? 'Cập nhật' : 'Thêm mới'}
                            </Button>
                        </Space>
                    </Form.Item>
                </Form>
            </Modal>
        </div>
    );
}

export default FlashSaleManagement;

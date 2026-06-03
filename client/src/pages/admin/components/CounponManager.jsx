import React, { useEffect, useState } from 'react';
import { Table, Card, Button, Modal, Form, Input, InputNumber, DatePicker, message, Space, Tag, Tooltip } from 'antd';
import {
    EditOutlined,
    DeleteOutlined,
    PlusOutlined,
    GiftOutlined,
    CalendarOutlined,
    DollarOutlined,
    TagOutlined,
} from '@ant-design/icons';
import dayjs from 'dayjs';
import {
    requestCreateCoupon,
    requestGetAllCoupon,
    requestUpdateCoupon,
    requestDeleteCoupon,
} from '../../../config/CounponRequest';

const { RangePicker } = DatePicker;

function CouponManagement() {
    const [coupons, setCoupons] = useState([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingCoupon, setEditingCoupon] = useState(null);
    const [form] = Form.useForm();

    const fetchCoupons = async () => {
        const res = await requestGetAllCoupon();
        setCoupons(res.metadata);
    };

    useEffect(() => {
        fetchCoupons();
    }, []);

    const showModal = (coupon = null) => {
        setEditingCoupon(coupon);
        if (coupon) {
            form.setFieldsValue({
                nameCoupon: coupon.nameCoupon,
                discount: coupon.discount,
                quantity: coupon.quantity,
                dateRange: [dayjs(coupon.startDate), dayjs(coupon.endDate)],
                minPrice: coupon.minPrice,
                isActive: coupon.isActive,
            });
        } else {
            form.resetFields();
            form.setFieldsValue({
                isActive: true,
                productUsed: ['all'],
            });
        }
        setIsModalOpen(true);
    };

    const handleCancel = () => {
        setIsModalOpen(false);
        form.resetFields();
    };

    const handleSubmit = () => {
        form.validateFields()
            .then(async (values) => {
                const { dateRange, ...rest } = values;
                const couponData = {
                    ...rest,
                    nameCoupon: values.nameCoupon.toUpperCase(),
                    startDate: dateRange[0].format('YYYY-MM-DD'),
                    endDate: dateRange[1].format('YYYY-MM-DD'),
                };

                if (editingCoupon) {
                    const data = {
                        id: editingCoupon._id,
                        ...couponData,
                    };
                    await requestUpdateCoupon(data);
                    message.success('Mã giảm giá đã được cập nhật!');
                } else {
                    await requestCreateCoupon({ ...couponData, _id: Date.now().toString(), used: 0 });
                    message.success('Mã giảm giá đã được thêm mới!');
                }
                fetchCoupons();
                setIsModalOpen(false);
                form.resetFields();
            })
            .catch((info) => console.log('Validate Failed:', info));
    };

    const handleDelete = async (id) => {
        Modal.confirm({
            title: 'Bạn có chắc chắn muốn xóa mã giảm giá này?',
            content: 'Hành động này không thể hoàn tác.',
            okText: 'Xóa',
            okType: 'danger',
            cancelText: 'Hủy',
            async onOk() {
                await requestDeleteCoupon(id);
                fetchCoupons();
                message.success('Mã giảm giá đã được xóa!');
            },
        });
    };

    const columns = [
        {
            title: 'Mã giảm giá',
            dataIndex: 'nameCoupon',
            key: 'nameCoupon',
            render: (text) => (
                <div className="flex items-center gap-2 text-blue-600 font-mono font-semibold">
                    <TagOutlined />
                    <span>{text}</span>
                </div>
            ),
        },
        {
            title: 'Giảm giá',
            dataIndex: 'discount',
            key: 'discount',
            render: (discount) => (
                <Tag color="#f50" className="font-semibold px-2 rounded-lg">
                    {discount.toLocaleString('vi-VN')} %
                </Tag>
            ),
        },
        {
            title: 'Số lượng còn lại',
            key: 'quantity',
            render: (_, record) => <span>{record.quantity} lượt sử dụng</span>,
        },
        {
            title: 'Thời gian',
            key: 'time',
            render: (_, record) => (
                <div className="flex items-center gap-1 text-gray-600">
                    <CalendarOutlined />
                    <span>
                        {dayjs(record.startDate).format('DD/MM/YYYY')} ~ {dayjs(record.endDate).format('DD/MM/YYYY')}
                    </span>
                </div>
            ),
        },
        {
            title: 'Đơn tối thiểu',
            dataIndex: 'minPrice',
            key: 'minPrice',
            render: (minPrice) => (
                <div className="flex items-center gap-1 font-medium text-green-600">
                    <DollarOutlined />
                    {minPrice.toLocaleString('vi-VN')}đ
                </div>
            ),
        },
        {
            title: 'Thao tác',
            key: 'actions',
            width: 180,
            render: (_, record) => (
                <Space size="small">
                    <Tooltip title="Chỉnh sửa">
                        <Button
                            type="primary"
                            icon={<EditOutlined />}
                            onClick={() => showModal(record)}
                            size="middle"
                        />
                    </Tooltip>
                    <Tooltip title="Xóa">
                        <Button
                            danger
                            icon={<DeleteOutlined />}
                            onClick={() => {
                                const data = {
                                    id: record.id,
                                };
                                handleDelete(record._id);
                            }}
                            size="middle"
                        />
                    </Tooltip>
                </Space>
            ),
        },
    ];

    return (
        <div className="m-5">
            {/* Header */}
            <div className="flex justify-between items-start mb-6">
                <div>
                    <h2 className="text-lg font-semibold">Quản lý mã giảm giá</h2>
                    <p className="text-gray-500 text-sm mt-1">Quản lý các mã giảm giá trong cửa hàng</p>
                </div>
                <div className="flex gap-4">
                    <Button type="primary" icon={<PlusOutlined />} onClick={() => showModal()}>
                        Thêm mã giảm giá
                    </Button>
                </div>
            </div>

            {/* Table */}
            <Card className="rounded-lg shadow-sm">
                <Table
                    dataSource={coupons}
                    columns={columns}
                    rowKey="_id"
                    pagination={{
                        pageSize: 10,
                        showSizeChanger: true,
                        pageSizeOptions: ['5', '10', '20'],
                        showTotal: (total) => `Tổng cộng ${total} mã giảm giá`,
                    }}
                    rowClassName={(record) => (!record.isActive ? 'bg-gray-100 opacity-80' : '')}
                />
            </Card>

            {/* Modal */}
            <Modal
                title={
                    <div className="flex items-center gap-2 text-red-500 text-lg font-semibold">
                        <GiftOutlined />
                        {editingCoupon ? 'Cập nhật mã giảm giá' : 'Thêm mã giảm giá mới'}
                    </div>
                }
                open={isModalOpen}
                onCancel={handleCancel}
                onOk={handleSubmit}
                okText={editingCoupon ? 'Cập nhật' : 'Thêm mới'}
                cancelText="Hủy"
                width={600}
            >
                <Form form={form} layout="vertical" name="coupon_form">
                    <Form.Item
                        name="nameCoupon"
                        label="Mã giảm giá"
                        rules={[{ required: true, message: 'Vui lòng nhập mã giảm giá!' }]}
                    >
                        <Input placeholder="VD: SUMMER2023" className="uppercase" />
                    </Form.Item>

                    <div className="flex gap-4 mb-2">
                        <Form.Item
                            name="discount"
                            label="Giảm giá (%)"
                            rules={[{ required: true, message: 'Vui lòng nhập giá trị giảm giá!' }]}
                            className="flex-1"
                        >
                            <InputNumber
                                min={1}
                                style={{ width: '100%' }}
                                className="w-full"
                                placeholder="Nhập giá trị giảm giá"
                            />
                        </Form.Item>

                        <Form.Item
                            name="quantity"
                            label="Số lượng"
                            rules={[{ required: true, message: 'Vui lòng nhập số lượng!' }]}
                            className="flex-1"
                        >
                            <InputNumber
                                min={1}
                                className="w-full"
                                style={{ width: '100%' }}
                                placeholder="Nhập số lượng mã giảm giá"
                            />
                        </Form.Item>
                    </div>

                    <Form.Item
                        name="dateRange"
                        label="Thời gian hiệu lực"
                        rules={[{ required: true, message: 'Vui lòng chọn thời gian hiệu lực!' }]}
                    >
                        <RangePicker className="w-full" format="YYYY-MM-DD" />
                    </Form.Item>

                    <Form.Item
                        name="minPrice"
                        label="Đơn hàng tối thiểu"
                        rules={[{ required: true, message: 'Vui lòng nhập đơn hàng tối thiểu!' }]}
                    >
                        <InputNumber
                            min={0}
                            className="w-full"
                            formatter={(value) => `${value} đ`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                            parser={(value) => value.replace(/\s?đ\s?|(,*)/g, '')}
                            placeholder="Nhập giá trị đơn hàng tối thiểu"
                            style={{ width: '100%' }}
                        />
                    </Form.Item>
                </Form>
            </Modal>
        </div>
    );
}

export default CouponManagement;

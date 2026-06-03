import React, { useEffect, useState } from 'react';
import { Table, Button, Modal, Form, Input, Space, Popconfirm, Card, Typography, Empty, Image, message } from 'antd';
import { toast, ToastContainer } from 'react-toastify';
import {
    PlusOutlined,
    EditOutlined,
    DeleteOutlined,
    ExclamationCircleOutlined,
    SearchOutlined,
    ReloadOutlined,
} from '@ant-design/icons';
import {
    requestCreateCategory,
    requestGetAllCategory,
    requestUpdateCategory,
    requestDeleteCategory,
} from '../../../config/CategoryRequest';

const { Title, Text } = Typography;

const columnsDef = [
    {
        title: 'Tên danh mục',
        dataIndex: 'categoryName',
        key: 'categoryName',
        render: (text) => <span className="font-medium text-gray-800">{text}</span>,
    },
    {
        title: 'Ngày tạo',
        dataIndex: 'createdAt',
        key: 'createdAt',
        width: 150,
        render: (date) => new Date(date).toLocaleDateString('vi-VN'),
    },
];

function CategoryAdmin() {
    const [data, setData] = useState([]);
    const [open, setOpen] = useState(false);
    const [editing, setEditing] = useState(null);
    const [form] = Form.useForm();
    const [loading, setLoading] = useState(false);
    const [searchText, setSearchText] = useState('');
    const [imageUrl, setImageUrl] = useState('');

    const fetchData = async () => {
        try {
            setLoading(true);
            const res = await requestGetAllCategory();
            setData(res.metadata);
            setLoading(false);
        } catch (error) {
            toast.error('Không thể tải danh sách danh mục');
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    // Upload ảnh

    // Thêm mới
    const handleAdd = () => {
        setEditing(null);
        form.resetFields();
        setOpen(true);
    };

    // Sửa
    const handleEdit = (record) => {
        setEditing(record);
        form.setFieldsValue(record);
        setOpen(true);
    };

    // Xoá
    const handleDelete = async (_id) => {
        try {
            setLoading(true);
            await requestDeleteCategory(_id);
            toast.success('Đã xoá danh mục thành công');
            fetchData();
        } catch (error) {
            toast.error('Đã xảy ra lỗi khi xoá danh mục');
            setLoading(false);
        }
    };

    // Lưu (thêm/sửa)
    const handleOk = async () => {
        try {
            const values = await form.validateFields();

            setLoading(true);

            if (editing) {
                const data = {
                    id: editing._id,
                    categoryName: values.categoryName,
                };
                await requestUpdateCategory(data);
                toast.success('Đã cập nhật danh mục thành công');
            } else {
                const data = {
                    categoryName: values.categoryName,
                };
                await requestCreateCategory(data);
                toast.success('Đã thêm danh mục mới thành công');
            }

            fetchData();
            setOpen(false);
        } catch (error) {
            toast.error('Đã xảy ra lỗi khi lưu danh mục');
        } finally {
            setLoading(false);
        }
    };

    // Đóng modal
    const handleCancel = () => {
        setOpen(false);
        form.resetFields();
    };

    // Lọc dữ liệu theo từ khoá tìm kiếm
    const filteredData = data.filter((item) => item.categoryName.toLowerCase().includes(searchText.toLowerCase()));

    const columns = [
        ...columnsDef,
        {
            title: 'Hành động',
            key: 'action',
            width: 200,
            render: (_, record) => (
                <Space>
                    <Button
                        icon={<EditOutlined />}
                        onClick={() => handleEdit(record)}
                        className="bg-blue-50 border-blue-200 text-blue-700 hover:bg-blue-100 hover:border-blue-300 transition-colors"
                    >
                        Sửa
                    </Button>
                    <Popconfirm
                        title="Xoá danh mục này?"
                        description="Bạn chắc chắn muốn xoá danh mục này? Hành động này không thể hoàn tác."
                        onConfirm={() => handleDelete(record._id)}
                        okText="Xoá"
                        cancelText="Huỷ"
                        icon={<ExclamationCircleOutlined style={{ color: 'red' }} />}
                    >
                        <Button
                            danger
                            icon={<DeleteOutlined />}
                            className="bg-red-50 border-red-200 text-red-700 hover:bg-red-100 hover:border-red-300 transition-colors"
                        >
                            Xoá
                        </Button>
                    </Popconfirm>
                </Space>
            ),
        },
    ];

    return (
        <div>
            <ToastContainer />
            <Card bordered={false} className="shadow-sm mb-6">
                <div className="flex flex-col md:flex-row md:justify-between md:items-center mb-6">
                    <div className="mb-4 md:mb-0">
                        <Title level={4} className="!mb-1">
                            Quản lý danh mục
                        </Title>
                        <Text type="secondary">Quản lý tất cả danh mục tour du lịch</Text>
                    </div>
                    <div className="flex gap-2">
                        <Input
                            placeholder="Tìm kiếm danh mục..."
                            prefix={<SearchOutlined className="text-gray-400" />}
                            value={searchText}
                            onChange={(e) => setSearchText(e.target.value)}
                            className="w-64"
                        />
                        <Button icon={<ReloadOutlined />} onClick={fetchData} loading={loading} />
                        <Button
                            type="primary"
                            icon={<PlusOutlined />}
                            onClick={handleAdd}
                            className="bg-blue-600 hover:bg-blue-700"
                        >
                            Thêm danh mục
                        </Button>
                    </div>
                </div>

                <div className="bg-white rounded-lg overflow-hidden">
                    <Table
                        columns={columns}
                        dataSource={filteredData}
                        rowKey="_id"
                        loading={loading}
                        pagination={{
                            pageSize: 10,
                            showSizeChanger: true,
                            showTotal: (total) => `Tổng ${total} danh mục`,
                        }}
                        locale={{
                            emptyText: <Empty description="Không có dữ liệu" />,
                        }}
                    />
                </div>
            </Card>

            <Modal
                title={
                    <div className="flex items-center gap-2">
                        {editing ? (
                            <>
                                <EditOutlined className="text-blue-500" />
                                <span>Chỉnh sửa danh mục</span>
                            </>
                        ) : (
                            <>
                                <PlusOutlined className="text-green-500" />
                                <span>Thêm danh mục mới</span>
                            </>
                        )}
                    </div>
                }
                open={open}
                onOk={handleOk}
                onCancel={handleCancel}
                okText={editing ? 'Cập nhật' : 'Thêm mới'}
                cancelText="Huỷ"
                confirmLoading={loading}
                centered
                maskClosable={false}
                className="rounded-xl"
            >
                <Form form={form} layout="vertical" className="mt-4">
                    {/* Upload ảnh */}

                    {/* Tên danh mục */}
                    <Form.Item
                        name="categoryName"
                        label="Tên danh mục"
                        rules={[
                            { required: true, message: 'Vui lòng nhập tên danh mục' },
                            { min: 2, message: 'Tên danh mục phải có ít nhất 2 ký tự' },
                            { max: 100, message: 'Tên danh mục không được quá 100 ký tự' },
                        ]}
                    >
                        <Input placeholder="Nhập tên danh mục " className="rounded-lg" autoFocus />
                    </Form.Item>
                </Form>
            </Modal>
        </div>
    );
}

export default CategoryAdmin;

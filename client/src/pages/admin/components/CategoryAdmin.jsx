import React, { useEffect, useState } from 'react';
import { Table, Button, Modal, Form, Input, Space, Popconfirm, Card, Typography, Empty, Tag, Select } from 'antd';
import { toast, ToastContainer } from 'react-toastify';
import {
    PlusOutlined,
    EditOutlined,
    DeleteOutlined,
    ExclamationCircleOutlined,
    SearchOutlined,
    ReloadOutlined,
    FolderOutlined,
    TagOutlined,
} from '@ant-design/icons';
import {
    requestCreateCategory,
    requestGetAllCategory,
    requestUpdateCategory,
    requestDeleteCategory,
} from '../../../config/CategoryRequest';

const { Title, Text } = Typography;

function CategoryAdmin() {
    const [data, setData] = useState([]);
    const [open, setOpen] = useState(false);
    const [editing, setEditing] = useState(null);
    const [form] = Form.useForm();
    const [loading, setLoading] = useState(false);
    const [searchText, setSearchText] = useState('');
    const [filterLevel, setFilterLevel] = useState('all');

    const fetchData = async () => {
        try {
            setLoading(true);
            const res = await requestGetAllCategory();
            setData(res.metadata || []);
            setLoading(false);
        } catch (error) {
            toast.error('Không thể tải danh sách danh mục');
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    // Danh sách các danh mục cha (để chọn làm parent)
    const parentCategories = data.filter((item) => {
        const isRoot = !item.parent;
        // Không thể tự chọn chính mình làm cha khi đang sửa
        if (editing && item._id === editing._id) return false;
        return isRoot;
    });

    // Thêm mới
    const handleAdd = () => {
        setEditing(null);
        form.resetFields();
        form.setFieldsValue({ parent: null });
        setOpen(true);
    };

    // Sửa
    const handleEdit = (record) => {
        setEditing(record);
        form.setFieldsValue({
            categoryName: record.categoryName,
            parent: record.parent?._id || record.parent || null,
        });
        setOpen(true);
    };

    // Xoá
    const handleDelete = async (record) => {
        try {
            setLoading(true);
            await requestDeleteCategory(record._id);
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

            const payload = {
                categoryName: values.categoryName,
                parent: values.parent || null,
            };

            if (editing) {
                payload.id = editing._id;
                await requestUpdateCategory(payload);
                toast.success('Đã cập nhật danh mục thành công');
            } else {
                await requestCreateCategory(payload);
                toast.success('Đã thêm danh mục mới thành công');
            }

            fetchData();
            setOpen(false);
        } catch (error) {
            toast.error(error.response?.data?.message || 'Đã xảy ra lỗi khi lưu danh mục');
        } finally {
            setLoading(false);
        }
    };

    // Đóng modal
    const handleCancel = () => {
        setOpen(false);
        form.resetFields();
    };

    // Lọc dữ liệu theo từ khoá và cấp bậc
    const filteredData = data.filter((item) => {
        const matchesSearch = item.categoryName.toLowerCase().includes(searchText.toLowerCase()) ||
            (item.parent?.categoryName && item.parent.categoryName.toLowerCase().includes(searchText.toLowerCase()));
        
        if (!matchesSearch) return false;

        if (filterLevel === 'parent') return !item.parent;
        if (filterLevel === 'child') return !!item.parent;
        return true;
    });

    const columns = [
        {
            title: 'Tên danh mục',
            dataIndex: 'categoryName',
            key: 'categoryName',
            render: (text, record) => (
                <div className="flex items-center gap-2">
                    {record.parent ? (
                        <span className="ml-4 flex items-center gap-1 text-gray-700">
                            <span className="text-gray-400">↳</span>
                            <TagOutlined className="text-blue-500 text-xs" />
                            <span className="font-medium">{text}</span>
                        </span>
                    ) : (
                        <span className="flex items-center gap-1 text-gray-900 font-bold">
                            <FolderOutlined className="text-amber-500" />
                            <span>{text}</span>
                        </span>
                    )}
                </div>
            ),
        },
        {
            title: 'Cấp độ',
            key: 'level',
            width: 170,
            render: (_, record) => (
                record.parent ? (
                    <Tag color="blue" className="px-2 py-0.5 rounded-full font-medium">
                        Cấp 2 (Danh mục con)
                    </Tag>
                ) : (
                    <Tag color="green" className="px-2 py-0.5 rounded-full font-medium">
                        Cấp 1 (Danh mục cha)
                    </Tag>
                )
            ),
        },
        {
            title: 'Thuộc danh mục cha',
            dataIndex: 'parent',
            key: 'parent',
            width: 200,
            render: (parent) => (
                parent ? (
                    <span className="font-medium text-blue-700 bg-blue-50 px-2 py-1 rounded">
                        {parent.categoryName || 'Danh mục cha'}
                    </span>
                ) : (
                    <span className="text-gray-400 italic">- Gốc (Cha) -</span>
                )
            ),
        },
        {
            title: 'Ngày tạo',
            dataIndex: 'createdAt',
            key: 'createdAt',
            width: 140,
            render: (date) => (date ? new Date(date).toLocaleDateString('vi-VN') : '-'),
        },
        {
            title: 'Hành động',
            key: 'action',
            width: 180,
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
                        description={
                            !record.parent
                                ? "CẢNH BÁO: Đây là danh mục cha. Khi xoá, tất cả danh mục con thuộc danh mục này cũng sẽ bị xoá!"
                                : "Bạn chắc chắn muốn xoá danh mục con này?"
                        }
                        onConfirm={() => handleDelete(record)}
                        okText="Xoá"
                        cancelText="Huỷ"
                        okButtonProps={{ danger: true }}
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
                            Quản lý danh mục 2 tầng
                        </Title>
                        <Text type="secondary">
                            Quản lý danh mục cha (Giày Nam, Giày Nữ, Giày Trẻ Em) và các danh mục con (Thể thao, Bóng rổ...)
                        </Text>
                    </div>
                    <div className="flex flex-wrap gap-2">
                        <Select
                            value={filterLevel}
                            onChange={setFilterLevel}
                            className="w-36"
                            options={[
                                { value: 'all', label: 'Tất cả cấp' },
                                { value: 'parent', label: 'Cấp 1 (Cha)' },
                                { value: 'child', label: 'Cấp 2 (Con)' },
                            ]}
                        />
                        <Input
                            placeholder="Tìm kiếm danh mục..."
                            prefix={<SearchOutlined className="text-gray-400" />}
                            value={searchText}
                            onChange={(e) => setSearchText(e.target.value)}
                            className="w-60"
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
                            pageSize: 15,
                            showSizeChanger: true,
                            showTotal: (total) => `Tổng ${total} danh mục`,
                        }}
                        locale={{
                            emptyText: <Empty description="Chưa có danh mục nào" />,
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
                        <Input placeholder="Ví dụ: Giày Nam, Giày Thể Thao, Giày Bóng Rổ..." className="rounded-lg" autoFocus />
                    </Form.Item>

                    {/* Danh mục cha */}
                    <Form.Item
                        name="parent"
                        label="Danh mục cha (Tầng 1)"
                        tooltip="Nếu để trống hoặc chọn 'Không có', danh mục này sẽ là Danh mục cha (Cấp 1)"
                    >
                        <Select
                            placeholder="Chọn danh mục cha (hoặc để trống nếu là Cấp 1)"
                            allowClear
                            className="rounded-lg"
                        >
                            <Select.Option value={null}>
                                <span className="font-semibold text-green-700">🌟 Không có (Đây là Danh mục cha / Cấp 1)</span>
                            </Select.Option>
                            {parentCategories.map((cat) => (
                                <Select.Option key={cat._id} value={cat._id}>
                                    📁 {cat.categoryName}
                                </Select.Option>
                            ))}
                        </Select>
                    </Form.Item>
                </Form>
            </Modal>
        </div>
    );
}

export default CategoryAdmin;


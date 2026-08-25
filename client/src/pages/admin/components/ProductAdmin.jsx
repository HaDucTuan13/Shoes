import React, { useState, useEffect } from 'react';
import { Table, Button, Modal, Form, Input, InputNumber, Popconfirm, Select, Upload, Space } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined, UploadOutlined } from '@ant-design/icons';
import { v4 as uuidv4 } from 'uuid';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import { requestGetAllCategory } from '../../../config/CategoryRequest';
import {
    requestCreateProduct,
    requestDeleteProduct,
    requestGetAllProduct,
    requestUpdateProduct,
    requestUploadImage,
} from '../../../config/ProductRequest';
import { toast } from 'react-toastify';

function ProductManager() {
    const [products, setProducts] = useState([]);
    const [modalVisible, setModalVisible] = useState(false);
    const [editingProduct, setEditingProduct] = useState(null);
    const [dataCategory, setDataCategory] = useState([]);
    const [form] = Form.useForm();

    const fetchDataProduct = async () => {
        try {
            const res = await requestGetAllProduct();
            setProducts(res.metadata || []);
        } catch (e) {
            console.error(e);
        }
    };

    useEffect(() => {
        (async () => {
            try {
                const cats = await requestGetAllCategory();
                setDataCategory(cats.metadata || []);
                await fetchDataProduct();
            } catch (e) {
                console.error(e);
            }
        })();
    }, []);

    const handleAdd = () => {
        setEditingProduct(null);
        form.resetFields();
        setModalVisible(true);
    };

    const handleEdit = (record) => {
        setEditingProduct(record);

        let categoryValues = [];
        if (Array.isArray(record.category)) {
            categoryValues = record.category.map((c) => (typeof c === 'object' ? c._id : c));
        } else if (record.category) {
            categoryValues = [typeof record.category === 'object' ? record.category._id : record.category];
        }

        form.setFieldsValue({
            name: record.name,
            price: Number(record.price || 0),
            discount: Number(record.discount || 0),
            category: categoryValues,
            description: record.description || '',
            colors: (record.colors || []).map((c) => ({
                ...c,
                images: c.images
                    ? [
                          {
                              uid: '-1',
                              name: c.images,
                              status: 'done',
                              url: `${import.meta.env.VITE_URL_IMAGE}/uploads/products/${c.images}`,
                          },
                      ]
                    : [],
            })),
            variants: (record.variants || []).map((v) => ({
                ...v,
                stock: Number(v.stock || 0),
            })),
        });

        setModalVisible(true);
    };

    const handleDelete = async (id) => {
        try {
            await requestDeleteProduct(id);
            await fetchDataProduct();
            toast.success('Xoá thành công');
        } catch (err) {
            toast.error('Xoá thất bại');
        }
    };

    const handleOk = async () => {
        try {
            const values = await form.validateFields();

            const uploadedColors = await Promise.all(
                (values.colors || []).map(async (c) => {
                    let imageUrl = null;
                    if (c.images && c.images.length > 0) {
                        const fileItem = c.images[0];
                        if (fileItem.url) imageUrl = fileItem.url.split('/uploads/products/').pop();
                        else {
                            const fd = new FormData();
                            fd.append('image', fileItem.originFileObj);
                            const r = await requestUploadImage(fd);
                            imageUrl = r?.url;
                        }
                    }

                    return {
                        name: c.name,
                        images: imageUrl,
                    };
                }),
            );

            const processedVariants = (values.variants || []).map((v) => ({
                size: v.size,
                stock: Number(v.stock || 0),
            }));

            const payload = {
                name: values.name,
                price: Number(values.price || 0),
                discount: Number(values.discount || 0),
                category: values.category,
                description: values.description || '',
                colors: uploadedColors,
                variants: processedVariants,
            };

            if (editingProduct) {
                await requestUpdateProduct(editingProduct._id, payload);
                toast.success('Cập nhật thành công');
            } else {
                await requestCreateProduct(payload);
                toast.success('Tạo sản phẩm thành công');
            }

            await fetchDataProduct();
            setModalVisible(false);
            form.resetFields();
            setEditingProduct(null);
        } catch (err) {
            console.error(err);
            toast.error('Lỗi khi lưu sản phẩm');
        }
    };

    const columns = [
        { title: 'Tên sản phẩm', dataIndex: 'name', key: 'name' },
        {
            title: 'Ảnh',
            dataIndex: 'colors',
            key: 'colors',
            render: (colors) => (
                <img
                    src={`${import.meta.env.VITE_URL_IMAGE}/uploads/products/${colors?.[0]?.images}`}
                    alt=""
                    className="w-16 h-16 object-cover rounded-lg"
                />
            ),
        },
        {
            title: 'Danh mục',
            dataIndex: 'category',
            key: 'category',
            render: (categoryData) => {
                const catList = Array.isArray(categoryData)
                    ? categoryData
                    : categoryData
                    ? [categoryData]
                    : [];
                if (catList.length === 0) return <span className="text-gray-400">-</span>;
                return (
                    <div className="flex flex-wrap gap-1 max-w-xs">
                        {catList.map((cat, idx) => {
                            if (!cat) return null;
                            const catName = typeof cat === 'object' ? cat.categoryName : 'Danh mục';
                            const parentName =
                                typeof cat === 'object' && cat.parent
                                    ? typeof cat.parent === 'object'
                                        ? cat.parent.categoryName
                                        : ''
                                    : '';
                            return (
                                <span
                                    key={cat._id || idx}
                                    className="text-xs bg-blue-50 text-blue-700 px-2 py-0.5 rounded-md border border-blue-100 font-medium inline-block"
                                >
                                    {parentName ? `${parentName} > ` : ''}
                                    {catName}
                                </span>
                            );
                        })}
                    </div>
                );
            },
        },
        {
            title: 'Giá',
            dataIndex: 'price',
            key: 'price',
            render: (p) => `${Math.round(Number(p || 0)).toLocaleString('vi-VN')} VND`,
        },
        { title: 'Giảm giá', dataIndex: 'discount', key: 'discount', render: (d) => `${Number(d || 0)} %` },
        {
            title: 'Hành động',
            key: 'action',
            render: (_, record) => (
                <Space>
                    <Button icon={<EditOutlined />} onClick={() => handleEdit(record)} />
                    <Popconfirm title="Bạn có chắc muốn xoá?" onConfirm={() => handleDelete(record._id)}>
                        <Button danger icon={<DeleteOutlined />} />
                    </Popconfirm>
                </Space>
            ),
        },
    ];

    // Group categories hierarchically for Select
    const rootCategories = dataCategory.filter((c) => !c.parent);
    const getChildCategories = (parentId) =>
        dataCategory.filter(
            (c) => c.parent && (c.parent._id === parentId || c.parent === parentId),
        );

    return (
        <div className="p-6 bg-white rounded-xl shadow-md">
            <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold">Quản lý sản phẩm</h2>
                <Button type="primary" icon={<PlusOutlined />} onClick={handleAdd}>
                    Thêm sản phẩm
                </Button>
            </div>

            <Table rowKey="_id" columns={columns} dataSource={products} />

            <Modal
                title={editingProduct ? 'Sửa sản phẩm' : 'Thêm sản phẩm'}
                open={modalVisible}
                onOk={handleOk}
                onCancel={() => {
                    setModalVisible(false);
                    form.resetFields();
                    setEditingProduct(null);
                }}
                width={1000}
            >
                <Form form={form} layout="vertical">
                    <div className="grid grid-cols-2 gap-6">
                        <Form.Item name="name" label="Tên sản phẩm" rules={[{ required: true }]}>
                            <Input />
                        </Form.Item>
                        <Form.Item name="price" label="Giá" rules={[{ required: true }]}>
                            <InputNumber
                                style={{ width: '100%' }}
                                min={0}
                                formatter={
                                    (value) => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',') // thêm dấu phẩy
                                }
                                parser={(value) => value.replace(/,/g, '')} // bỏ dấu phẩy khi nhập
                            />
                        </Form.Item>

                        <Form.Item name="discount" label="Giảm giá (%)">
                            <InputNumber style={{ width: '100%' }} min={0} max={100} />
                        </Form.Item>
                        <Form.Item
                            name="category"
                            label="Danh mục (Có thể chọn nhiều danh mục)"
                            rules={[{ required: true, message: 'Vui lòng chọn ít nhất 1 danh mục' }]}
                        >
                            <Select
                                mode="multiple"
                                placeholder="Chọn các danh mục (VD: Giày Bóng Rổ, Giày Pickleball...)"
                                showSearch
                                optionFilterProp="children"
                                allowClear
                                className="w-full"
                            >
                                {rootCategories.map((parentCat) => {
                                    const children = getChildCategories(parentCat._id);
                                    if (children.length > 0) {
                                        return (
                                            <Select.OptGroup key={parentCat._id} label={`📁 ${parentCat.categoryName.toUpperCase()}`}>
                                                <Select.Option value={parentCat._id}>
                                                    <span className="font-semibold text-gray-800">{parentCat.categoryName} (Chung)</span>
                                                </Select.Option>
                                                {children.map((child) => (
                                                    <Select.Option key={child._id} value={child._id}>
                                                        &nbsp;&nbsp;↳ {parentCat.categoryName} &gt; {child.categoryName}
                                                    </Select.Option>
                                                ))}
                                            </Select.OptGroup>
                                        );
                                    }
                                    return (
                                        <Select.Option key={parentCat._id} value={parentCat._id}>
                                            📁 {parentCat.categoryName}
                                        </Select.Option>
                                    );
                                })}
                            </Select>
                        </Form.Item>
                    </div>

                    <Form.Item name="description" label="Mô tả">
                        <ReactQuill theme="snow" style={{ height: 250 }} />
                    </Form.Item>

                    <div className="mt-6">
                        <h3 className="text-lg font-medium mb-4">Màu sắc</h3>
                        <Form.List name="colors">
                            {(colorFields, { add: addColor, remove: removeColor }) => (
                                <div>
                                    {colorFields.map(({ key: cKey, name: cName, ...cRest }) => (
                                        <div key={cKey} className="p-4 border rounded mb-3">
                                            <div className="grid grid-cols-2 gap-4">
                                                <Form.Item
                                                    {...cRest}
                                                    name={[cName, 'name']}
                                                    label="Tên màu"
                                                    rules={[{ required: true }]}
                                                >
                                                    <Input placeholder="VD: Đen, Trắng, Xanh" />
                                                </Form.Item>

                                                <Form.Item
                                                    {...cRest}
                                                    name={[cName, 'images']}
                                                    label="Ảnh màu"
                                                    valuePropName="fileList"
                                                    getValueFromEvent={(e) => e && e.fileList}
                                                >
                                                    <Upload
                                                        listType="picture-card"
                                                        maxCount={1}
                                                        beforeUpload={() => false}
                                                    >
                                                        <div>
                                                            <UploadOutlined />
                                                            <div style={{ marginTop: 8 }}>Upload</div>
                                                        </div>
                                                    </Upload>
                                                </Form.Item>
                                            </div>

                                            <div className="flex justify-end mt-3">
                                                <Button danger onClick={() => removeColor(cName)}>
                                                    Xóa màu
                                                </Button>
                                            </div>
                                        </div>
                                    ))}

                                    <Button type="dashed" block onClick={() => addColor()}>
                                        + Thêm màu
                                    </Button>
                                </div>
                            )}
                        </Form.List>
                    </div>

                    <div className="mt-6">
                        <h3 className="text-lg font-medium mb-4">Kích thước</h3>
                        <Form.List name="variants">
                            {(variantFields, { add: addVariant, remove: removeVariant }) => (
                                <div>
                                    {variantFields.map(({ key: vKey, name: vName, ...vRest }) => (
                                        <div key={vKey} className="flex gap-2 items-center mb-2 p-3 border rounded">
                                            <Form.Item
                                                {...vRest}
                                                name={[vName, 'size']}
                                                label="Size"
                                                rules={[{ required: true }]}
                                            >
                                                <Input placeholder="VD: 38, 39, 40" style={{ width: 120 }} />
                                            </Form.Item>
                                            <Form.Item
                                                {...vRest}
                                                name={[vName, 'stock']}
                                                label="Tồn kho"
                                                rules={[{ required: true }]}
                                            >
                                                <InputNumber min={0} />
                                            </Form.Item>
                                            <Button danger onClick={() => removeVariant(vName)}>
                                                Xóa
                                            </Button>
                                        </div>
                                    ))}
                                    <Button type="dashed" block onClick={() => addVariant()}>
                                        + Thêm size
                                    </Button>
                                </div>
                            )}
                        </Form.List>
                    </div>
                </Form>
            </Modal>
        </div>
    );
}

export default ProductManager;

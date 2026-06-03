import { useState } from 'react';
import { Form, Input, Button, Typography, message } from 'antd';
import { EyeInvisibleOutlined, EyeTwoTone } from '@ant-design/icons';
import Footer from '../components/Footer';
import Header from '../components/Header';
import { Link, useNavigate } from 'react-router-dom';

import { requestRegister } from '../config/UserRequest';
import { toast } from 'react-toastify';

const { Title, Text } = Typography;

function Register() {
    const [form] = Form.useForm();
    const [loading, setLoading] = useState(false);

    const navigate = useNavigate();

    const onFinish = async (values) => {
        setLoading(true);
        try {
            await requestRegister(values);
            toast.success('Đăng ký thành công!');
            setTimeout(() => {
                window.location.reload();
            }, 1000);
            navigate('/');
        } catch (error) {
            toast.error(error.response.data.message);
        } finally {
            setLoading(false);
        }
    };

    const onFinishFailed = (errorInfo) => {
        console.log('Failed:', errorInfo);
    };

    return (
        <div className="min-h-screen bg-gray-50">
            <header>
                <Header />
            </header>

            <main className="flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
                <div className="w-[50%] space-y-8">
                    <div className="bg-white rounded-lg shadow-lg p-8">
                        {/* Header */}
                        <div className="text-center mb-8">
                            <Title level={2} className="text-gray-900 font-bold mb-2">
                                ĐĂNG KÝ TÀI KHOẢN
                            </Title>
                            <Text className="text-gray-600">
                                Bạn đã có tài khoản ?{' '}
                                <Link to="/login" className="text-blue-500 hover:text-blue-600">
                                    Đăng nhập tại đây
                                </Link>
                            </Text>
                        </div>

                        {/* Login Form */}
                        <Form
                            form={form}
                            name="register"
                            layout="vertical"
                            onFinish={onFinish}
                            onFinishFailed={onFinishFailed}
                            autoComplete="off"
                            size="large"
                        >
                            {/* Email Field */}
                            <Form.Item
                                label={
                                    <span className="text-gray-700 font-medium">
                                        Họ và tên <span className="text-red-500">*</span>
                                    </span>
                                }
                                name="fullName"
                                rules={[
                                    {
                                        required: true,
                                        message: 'Vui lòng nhập họ và tên!',
                                    },
                                    {
                                        type: 'fullName',
                                        message: 'Họ và tên không hợp lệ!',
                                    },
                                ]}
                                className="mb-4"
                            >
                                <Input
                                    placeholder="Nguyễn Văn A"
                                    className="h-12 rounded-md border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                                />
                            </Form.Item>
                            <Form.Item
                                label={
                                    <span className="text-gray-700 font-medium">
                                        Số điện thoại <span className="text-red-500">*</span>
                                    </span>
                                }
                                name="phone"
                                rules={[
                                    {
                                        required: true,
                                        message: 'Vui lòng nhập số điện thoại!',
                                    },
                                    {
                                        type: 'phone',
                                        message: 'Số điện thoại không hợp lệ!',
                                    },
                                ]}
                                className="mb-4"
                            >
                                <Input
                                    placeholder="0909090909"
                                    className="h-12 rounded-md border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                                />
                            </Form.Item>

                            <Form.Item
                                label={
                                    <span className="text-gray-700 font-medium">
                                        Email <span className="text-red-500">*</span>
                                    </span>
                                }
                                name="email"
                                rules={[
                                    {
                                        required: true,
                                        message: 'Vui lòng nhập email!',
                                    },
                                    {
                                        type: 'email',
                                        message: 'Email không hợp lệ!',
                                    },
                                ]}
                                className="mb-4"
                            >
                                <Input
                                    placeholder="nguyenvana@gmail.com"
                                    className="h-12 rounded-md border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                                />
                            </Form.Item>

                            {/* Password Field */}
                            <Form.Item
                                label={
                                    <span className="text-gray-700 font-medium">
                                        Mật khẩu <span className="text-red-500">*</span>
                                    </span>
                                }
                                name="password"
                                rules={[
                                    {
                                        required: true,
                                        message: 'Vui lòng nhập mật khẩu!',
                                    },
                                    {
                                        min: 6,
                                        message: 'Mật khẩu phải có ít nhất 6 ký tự!',
                                    },
                                ]}
                                className="mb-2"
                            >
                                <Input.Password
                                    placeholder="••••••••••"
                                    iconRender={(visible) => (visible ? <EyeTwoTone /> : <EyeInvisibleOutlined />)}
                                    className="h-12 rounded-md border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                                />
                            </Form.Item>

                            <Form.Item
                                label={
                                    <span className="text-gray-700 font-medium">
                                        Xác nhận mật khẩu <span className="text-red-500">*</span>
                                    </span>
                                }
                                name="confirmPassword"
                                rules={[
                                    {
                                        required: true,
                                        message: 'Vui lòng nhập xác nhận mật khẩu!',
                                    },
                                    {
                                        min: 6,
                                        message: 'Xác nhận mật khẩu phải có ít nhất 6 ký tự!',
                                    },
                                ]}
                                className="mb-2"
                            >
                                <Input.Password
                                    placeholder="••••••••••••"
                                    iconRender={(visible) => (visible ? <EyeTwoTone /> : <EyeInvisibleOutlined />)}
                                    className="h-12 rounded-md border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                                />
                            </Form.Item>

                            {/* Forgot Password Link */}
                            <div className="text-right mb-6">
                                <Text className="text-gray-600 text-sm">
                                    Quên xác nhận mật khẩu? Nhấn vào{' '}
                                    <Link to="/forgot-password" className="text-blue-500 hover:text-blue-600">
                                        đây
                                    </Link>
                                </Text>
                            </div>

                            {/* Submit Button */}
                            <Form.Item className="mb-4">
                                <Button
                                    type="primary"
                                    htmlType="submit"
                                    loading={loading}
                                    className="!w-full !h-12 !bg-red-500 hover:!bg-red-600 !border-red-500 hover:!border-red-600 !rounded-md !font-medium !text-base !shadow-md hover:!shadow-lg !transition-all !duration-200"
                                >
                                    Đăng ký
                                </Button>
                            </Form.Item>

                            {/* Social Login Options
                            <div className="text-center">
                                <Text className="text-gray-500 text-sm">Hoặc đăng ký bằng</Text>
                            </div> */}
                        </Form>
                    </div>
                </div>
            </main>

            <footer>
                <Footer />
            </footer>
        </div>
    );
}

export default Register;

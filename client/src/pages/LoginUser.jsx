import { useState } from 'react';
import { Form, Input, Button, Typography } from 'antd';
import { EyeInvisibleOutlined, EyeTwoTone } from '@ant-design/icons';
import Footer from '../components/Footer';
import Header from '../components/Header';
import { Link, useNavigate } from 'react-router-dom';
import { requestLogin, requestLoginGoogle } from '../config/UserRequest';
import { toast } from 'react-toastify';
import { GoogleOAuthProvider, GoogleLogin } from '@react-oauth/google';

const { Title, Text } = Typography;

function LoginUser() {
    const [form] = Form.useForm();
    const [loading, setLoading] = useState(false);

    const navigate = useNavigate();

    const onFinish = async (values) => {
        setLoading(true);
        try {
            await requestLogin(values);
            toast.success('Đăng nhập thành công!');
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

    const handleSuccess = async (response) => {
        const { credential } = response; // Nhận ID Token từ Google
        try {
            const data = {
                credential,
            };
            const res = await requestLoginGoogle(data);
            toast.success(res.message);
            setTimeout(() => {
                window.location.reload();
            }, 1000);
            navigate('/');
        } catch (error) {
            console.error('Login failed', error);
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
                <div className=" w-[50%] space-y-8">
                    <div className="bg-white rounded-lg shadow-lg p-8">
                        {/* Header */}
                        <div className="text-center mb-8">
                            <Title level={2} className="text-gray-900 font-bold mb-2">
                                ĐĂNG NHẬP TÀI KHOẢN
                            </Title>
                            <Text className="text-gray-600">
                                Bạn chưa có tài khoản ?{' '}
                                <Link to="/register" className="text-blue-500 hover:text-blue-600">
                                    Đăng ký tại đây
                                </Link>
                            </Text>
                        </div>

                        {/* Login Form */}
                        <Form
                            form={form}
                            name="login"
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

                            <div style={{ marginTop: '20px' }}>
                                <GoogleOAuthProvider clientId={import.meta.env.VITE_CLIENT_ID}>
                                    <GoogleLogin
                                        onSuccess={handleSuccess}
                                        onError={() => console.log('Login Failed')}
                                    />
                                </GoogleOAuthProvider>
                            </div>

                            {/* Forgot Password Link */}
                            <div className="text-right mb-6">
                                <Text className="text-gray-600 text-sm">
                                    Quên mật khẩu? Nhấn vào{' '}
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
                                    className="!w-full !h-12 !bg-[#111827] hover:!bg-[#1f2937] !border-[#111827] hover:!border-[#1f2937] !rounded-md !font-medium !text-base !shadow-md hover:!shadow-lg !transition-all !duration-200"
                                >
                                    Đăng nhập
                                </Button>
                            </Form.Item>

                            {/* Social Login Options
                            <div className="text-center">
                                <Text className="text-gray-500 text-sm">Hoặc đăng nhập bằng</Text>
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

export default LoginUser;

import { useState } from 'react';
import { Form, Input, Button, Card, Row, Col, message, Select, Divider } from 'antd';
import {
    PhoneOutlined,
    MailOutlined,
    EnvironmentOutlined,
    ClockCircleOutlined,
    SendOutlined,
    FacebookOutlined,
    InstagramOutlined,
    TwitterOutlined,
    YoutubeOutlined,
    LinkedinOutlined,
    GlobalOutlined,
    MessageOutlined,
    UserOutlined,
    HomeOutlined,
} from '@ant-design/icons';
import Footer from '../components/Footer';
import Header from '../components/Header';
import { requestCreateContact } from '../config/ContactRequest';

const { TextArea } = Input;
const { Option } = Select;

function Contact() {
    const [form] = Form.useForm();
    const [loading, setLoading] = useState(false);

    const onFinish = async (values) => {
        setLoading(true);
        try {
            // Simulate API call
            console.log(values);

            await requestCreateContact(values);
            message.success('Cảm ơn bạn đã liên hệ! Chúng tôi sẽ tư vấn về sản phẩm trong thời gian sớm nhất.');
            form.resetFields();
        } catch (error) {
            message.error('Có lỗi xảy ra. Vui lòng thử lại sau.');
        } finally {
            setLoading(false);
        }
    };

    const contactInfo = [
        {
            icon: <PhoneOutlined className="text-2xl text-blue-600" />,
            title: 'Điện Thoại',
            details: ['+84 28 1234 5678', '+84 28 8765 4321'],
            description: 'Tư vấn mua hàng 24/7',
        },
        {
            icon: <MailOutlined className="text-2xl text-green-600" />,
            title: 'Email',
            details: ['info@shoeshop.com', 'support@shoeshop.com'],
            description: 'Phản hồi trong 2 giờ',
        },
        {
            icon: <EnvironmentOutlined className="text-2xl text-red-600" />,
            title: 'Địa Chỉ',
            details: ['456 Đường Nguyễn Huệ, Quận 1', 'TP. Hồ Chí Minh, Việt Nam'],
            description: 'Showroom chính',
        },
        {
            icon: <ClockCircleOutlined className="text-2xl text-purple-600" />,
            title: 'Giờ Mở Cửa',
            details: ['Thứ 2 - Thứ 6: 8:00 - 21:00', 'Thứ 7 - CN: 9:00 - 22:00'],
            description: 'Hỗ trợ online 24/7',
        },
    ];

    const socialMedia = [
        { icon: <FacebookOutlined />, name: 'Facebook', color: 'text-blue-600', url: '#' },
        { icon: <InstagramOutlined />, name: 'Instagram', color: 'text-pink-600', url: '#' },
        { icon: <TwitterOutlined />, name: 'Twitter', color: 'text-blue-400', url: '#' },
        { icon: <YoutubeOutlined />, name: 'YouTube', color: 'text-red-600', url: '#' },
        { icon: <LinkedinOutlined />, name: 'LinkedIn', color: 'text-blue-700', url: '#' },
    ];

    const departments = [
        {
            name: 'Tư Vấn Bán Hàng',
            phone: '+84 28 1234 5678',
            email: 'sales@shoeshop.com',
            description: 'Tư vấn sản phẩm và đặt hàng',
        },
        {
            name: 'Chăm Sóc Khách Hàng',
            phone: '+84 28 1234 5679',
            email: 'support@shoeshop.com',
            description: 'Hỗ trợ bảo hành và đổi trả',
        },
        {
            name: 'Bán Sỉ & Đại Lý',
            phone: '+84 28 1234 5680',
            email: 'wholesale@shoeshop.com',
            description: 'Hợp tác kinh doanh và bán sỉ',
        },
        {
            name: 'Tuyển Dụng',
            phone: '+84 28 1234 5681',
            email: 'hr@shoeshop.com',
            description: 'Cơ hội nghề nghiệp',
        },
    ];

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
            <header>
                <Header />
            </header>

            <main>
                {/* Hero Section */}
                {/* <div className="relative h-80 bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 overflow-hidden">
                    <div className="absolute inset-0 bg-black opacity-30"></div>
                    <div className="relative z-10 flex items-center justify-center h-full">
                        <div className="text-center text-white max-w-4xl mx-auto px-4">
                            <h1 className="text-4xl font-bold mb-4">Liên Hệ Với Chúng Tôi</h1>
                            <p className="text-xl mb-8">
                                Đội ngũ tư vấn sẵn sàng hỗ trợ tìm đôi giày phù hợp với nhu cầu của bạn 
                            </p>
                            <div className="flex justify-center space-x-4">
                                <div className="flex items-center bg-white/20 backdrop-blur-sm px-4 py-2 rounded-lg">
                                    <MessageOutlined className="mr-2" />
                                    <span>Tư vấn 24/7</span>
                                </div>
                                <div className="flex items-center bg-white/20 backdrop-blur-sm px-4 py-2 rounded-lg">
                                    <GlobalOutlined className="mr-2" />
                                    <span>Miễn phí ship</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div> */}

                {/* Contact Form & Info */}
                <div className="container mx-auto px-4 py-16">
                    <Row gutter={[32, 32]}>
                        {/* Contact Form */}
                        <Col xs={24} lg={14}>
                            <Card className="shadow-lg">
                                <div className="mb-6">
                                    <h2 className="text-2xl font-bold text-gray-800 mb-2">Gửi Tin Nhắn</h2>
                                    <p className="text-gray-600">
                                        Bạn có thắc mắc về sản phẩm? Hãy để lại thông tin, chúng tôi sẽ tư vấn miễn phí
                                    </p>
                                </div>

                                <Form form={form} layout="vertical" onFinish={onFinish} className="contact-form">
                                    <Row gutter={24}>
                                        <Col xs={24} sm={24}>
                                            <Form.Item
                                                name="fullName"
                                                label="Họ và tên"
                                                rules={[{ required: true, message: 'Vui lòng nhập họ!' }]}
                                            >
                                                <Input
                                                    prefix={<UserOutlined />}
                                                    placeholder="Nhập họ và tên của bạn"
                                                    size="large"
                                                />
                                            </Form.Item>
                                        </Col>
                                    </Row>

                                    <Row gutter={16}>
                                        <Col xs={24} sm={12}>
                                            <Form.Item
                                                name="email"
                                                label="Email"
                                                rules={[
                                                    { required: true, message: 'Vui lòng nhập email!' },
                                                    { type: 'email', message: 'Email không hợp lệ!' },
                                                ]}
                                            >
                                                <Input
                                                    prefix={<MailOutlined />}
                                                    placeholder="your@email.com"
                                                    size="large"
                                                />
                                            </Form.Item>
                                        </Col>
                                        <Col xs={24} sm={12}>
                                            <Form.Item
                                                name="phone"
                                                label="Số Điện Thoại"
                                                rules={[{ required: true, message: 'Vui lòng nhập số điện thoại!' }]}
                                            >
                                                <Input
                                                    prefix={<PhoneOutlined />}
                                                    placeholder="+84 xxx xxx xxx"
                                                    size="large"
                                                />
                                            </Form.Item>
                                        </Col>
                                    </Row>

                                    <Form.Item
                                        name="message"
                                        label="Tin Nhắn"
                                        rules={[{ required: true, message: 'Vui lòng nhập tin nhắn!' }]}
                                    >
                                        <TextArea
                                            rows={6}
                                            placeholder="Bạn cần tư vấn về sản phẩm gì? Size, màu sắc, giá cả...?"
                                            showCount
                                            maxLength={500}
                                        />
                                    </Form.Item>

                                    <Form.Item>
                                        <Button
                                            type="primary"
                                            htmlType="submit"
                                            loading={loading}
                                            size="large"
                                            className="w-full bg-gradient-to-r from-blue-600 to-purple-600 border-none"
                                            icon={<SendOutlined />}
                                        >
                                            Gửi Tin Nhắn
                                        </Button>
                                    </Form.Item>
                                </Form>
                            </Card>
                        </Col>

                        {/* Contact Information */}
                        <Col xs={24} lg={10}>
                            <div className="space-y-6">
                                <Card className="shadow-lg">
                                    <h3 className="text-xl font-bold text-gray-800 mb-4">Thông Tin Liên Hệ</h3>
                                    <div className="space-y-4">
                                        {contactInfo.map((info, index) => (
                                            <div key={index} className="flex items-start space-x-3">
                                                <div className="flex-shrink-0 mt-1">{info.icon}</div>
                                                <div>
                                                    <h4 className="font-semibold text-gray-800 mb-1">{info.title}</h4>
                                                    {info.details.map((detail, idx) => (
                                                        <p key={idx} className="text-gray-600 text-sm">
                                                            {detail}
                                                        </p>
                                                    ))}
                                                    <p className="text-xs text-gray-500 mt-1">{info.description}</p>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </Card>
                            </div>
                        </Col>
                    </Row>
                </div>

                {/* Departments */}
                <div className="bg-white py-16">
                    <div className="container mx-auto px-4">
                        <div className="text-center mb-12">
                            <h2 className="text-3xl font-bold text-gray-800 mb-4">Bộ Phận Hỗ Trợ</h2>
                            <p className="text-xl text-gray-600">
                                Liên hệ với bộ phận phù hợp để được hỗ trợ tốt nhất
                            </p>
                        </div>

                        <Row gutter={[24, 24]}>
                            {departments.map((dept, index) => (
                                <Col xs={24} sm={12} lg={6} key={index}>
                                    <Card className="h-full text-center shadow-lg hover:shadow-xl transition-shadow duration-300">
                                        <div className="text-3xl text-blue-600 mb-3">
                                            <HomeOutlined />
                                        </div>
                                        <h3 className="text-lg font-bold text-gray-800 mb-2">{dept.name}</h3>
                                        <p className="text-gray-600 text-sm mb-3">{dept.description}</p>
                                        <div className="space-y-1">
                                            <p className="text-sm text-blue-600 font-semibold">{dept.phone}</p>
                                            <p className="text-sm text-gray-500">{dept.email}</p>
                                        </div>
                                    </Card>
                                </Col>
                            ))}
                        </Row>
                    </div>
                </div>

                {/* FAQ Section */}
                <div className="bg-gradient-to-r from-blue-50 to-purple-50 py-16">
                    <div className="container mx-auto px-4">
                        <div className="text-center mb-12">
                            <h2 className="text-3xl font-bold text-gray-800 mb-4">Những câu Hỏi Thường Gặp</h2>
                            <p className="text-xl text-gray-600">Một số câu hỏi phổ biến về sản phẩm và dịch vụ</p>
                        </div>

                        <Row gutter={[24, 24]}>
                            <Col xs={24} lg={12}>
                                <Card className="shadow-lg">
                                    <h4 className="font-bold text-gray-800 mb-2">Làm sao để chọn size giày phù hợp?</h4>
                                    <p className="text-gray-600 text-sm">
                                        Bạn có thể tham khảo bảng size chi tiết trên website hoặc đến showroom để thử
                                        trực tiếp. Chúng tôi cũng có dịch vụ tư vấn size qua điện thoại.
                                    </p>
                                </Card>
                            </Col>
                            <Col xs={24} lg={12}>
                                <Card className="shadow-lg">
                                    <h4 className="font-bold text-gray-800 mb-2">Chính sách đổi trả như thế nào?</h4>
                                    <p className="text-gray-600 text-sm">
                                        Đổi trả miễn phí trong 7 ngày nếu sản phẩm còn nguyên tem, hộp. Hoàn tiền 100%
                                        nếu lỗi từ nhà sản xuất.
                                    </p>
                                </Card>
                            </Col>
                            <Col xs={24} lg={12}>
                                <Card className="shadow-lg">
                                    <h4 className="font-bold text-gray-800 mb-2">Có giao hàng tận nơi không?</h4>
                                    <p className="text-gray-600 text-sm">
                                        Có, chúng tôi giao hàng toàn quốc. Miễn phí ship cho đơn từ 500k trong nội
                                        thành. Giao hàng trong 1-3 ngày làm việc.
                                    </p>
                                </Card>
                            </Col>
                            <Col xs={24} lg={12}>
                                <Card className="shadow-lg">
                                    <h4 className="font-bold text-gray-800 mb-2">Sản phẩm có bảo hành không?</h4>
                                    <p className="text-gray-600 text-sm">
                                        Tất cả sản phẩm đều có bảo hành 6 tháng về lỗi kỹ thuật. Bảo hành trọn đời về đế
                                        giày với các thương hiệu giày cao cấp.
                                    </p>
                                </Card>
                            </Col>
                        </Row>
                    </div>
                </div>
            </main>

            <footer>
                <Footer />
            </footer>
        </div>
    );
}

export default Contact;

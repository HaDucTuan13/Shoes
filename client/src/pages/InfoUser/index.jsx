import { useState, useEffect } from 'react';
import { Layout, ConfigProvider, theme, FloatButton, Badge } from 'antd';
import Header from '../../components/Header';
import Footer from '../../components/Footer';
import UserSidebar from './components/UserSidebar';
import PersonalInfo from './components/PersonalInfo';
import OrderHistory from './components/OrderHistory';
// import WatchProducts from './components/WatchProducts';
import { useNavigate } from 'react-router-dom';
import Cookies from 'js-cookie';
import { UserOutlined, ShoppingOutlined, HeartOutlined, ArrowUpOutlined } from '@ant-design/icons';
import Warranty from './components/Warranty';
import Favourite from './components/Favourite';

const { Content, Sider } = Layout;

function InfoUser() {
    const [activeSection, setActiveSection] = useState('profile');
    const [collapsed, setCollapsed] = useState(false);
    const navigate = useNavigate();

    const handleBreakpoint = (broken) => {
        setCollapsed(broken);
    };

    useEffect(() => {
        const token = Cookies.get('logged');
        if (!token) {
            navigate('/login');
        }
    }, [navigate]);

    const renderContent = () => {
        switch (activeSection) {
            case 'profile':
                return <PersonalInfo />;
            case 'order':
                return <OrderHistory />;
            case 'warranty':
                return <Warranty />;
            case 'favourite':
                return <Favourite />;
            default:
                return <PersonalInfo />;
        }
    };

    const mobileTabButtons = [
        {
            key: 'profile',
            icon: <UserOutlined />,
            label: 'Thông tin',
            path: '/profile',
        },
        {
            key: 'orders',
            icon: <ShoppingOutlined />,
            label: 'Đơn hàng',
            badge: 2,
            path: '/order',
        },
        {
            key: 'favorites',
            icon: <HeartOutlined />,
            label: 'Yêu thích',
            badge: 4,
            path: '/favourite',
        },
    ];

    return (
        <ConfigProvider
            theme={{
                algorithm: theme.defaultAlgorithm,
                token: {
                    colorPrimary: '#d70018',
                    borderRadius: 6,
                },
            }}
        >
            <div className="min-h-screen flex flex-col">
                <header className="sticky top-0 z-50">
                    <Header />
                </header>

                <main className="flex-1 pt-[90px] pb-16 bg-gray-50">
                    <div className="w-[90%] mx-auto">
                        <Layout className="bg-transparent min-h-[calc(100vh-180px)]">
                            <Sider
                                width={280}
                                theme="light"
                                breakpoint="lg"
                                collapsedWidth="0"
                                onBreakpoint={handleBreakpoint}
                                className="bg-transparent shadow-none"
                                style={{
                                    height: 'calc(100vh - 180px)',
                                    position: 'sticky',
                                    top: '100px',
                                    left: 0,
                                    overflow: 'auto',
                                    paddingRight: 16,
                                }}
                            >
                                <UserSidebar
                                    activeKey={activeSection}
                                    onSelect={setActiveSection}
                                    setActiveKey={setActiveSection}
                                />
                            </Sider>

                            <Content className="bg-transparent px-0 md:px-6">
                                <div className="pb-20">{renderContent()}</div>
                            </Content>
                        </Layout>
                    </div>
                </main>

                {/* Mobile Tab Navigation */}
                {collapsed && (
                    <div className="fixed bottom-0 left-0 right-0 bg-white shadow-[0_-2px_10px_rgba(0,0,0,0.1)] md:hidden z-10">
                        <div className="flex justify-between px-2 py-2">
                            {mobileTabButtons.map((item) => (
                                <div
                                    key={item.key}
                                    className={`flex-1 flex flex-col items-center py-2 ${
                                        activeSection === item.key ? 'text-[#d70018]' : 'text-gray-500'
                                    }`}
                                    onClick={() => {
                                        navigate(item.path);
                                        setActiveSection(item.key);
                                    }}
                                >
                                    <Badge count={item.badge} size="small" offset={[8, 0]}>
                                        <div className="text-xl">{item.icon}</div>
                                    </Badge>
                                    <span className="text-xs mt-1">{item.label}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                <Footer />

                <FloatButton.BackTop icon={<ArrowUpOutlined />} tooltip="Lên đầu trang" />
            </div>
        </ConfigProvider>
    );
}

export default InfoUser;

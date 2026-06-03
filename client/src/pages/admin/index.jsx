import React, { useEffect, useState } from 'react';
import { Layout } from 'antd';
import SidebarAdmin from './components/SidebarAdmin';
import CategoryAdmin from './components/CategoryAdmin';
import ProductAdmin from './components/ProductAdmin';
import CouponManagement from './components/CounponManager';
import OrderAdmin from './components/OrderAdmin';
import WarrantyAdmin from './components/WarrantyAdmin';
import MessageManager from './components/MessageManager';
import FlashSaleAdmin from './components/FlashSaleManagement';
import BlogAdmin from './components/BlogAdmin';
import ContactManager from './components/ContactManager';
import { requestGetDashboardAdmin } from '../../config/UserRequest';
import { useNavigate } from 'react-router-dom';
import Dashbroad from './components/Dashbroad';

const { Content, Header } = Layout;

function Admin() {
    const [selectedKey, setSelectedKey] = useState('dashboard');

    const navigate = useNavigate();

    useEffect(() => {
        const fetchDashboardAdmin = async () => {
            try {
                await requestGetDashboardAdmin();
                return;
            } catch (error) {
                navigate('/');
            }
        };
        fetchDashboardAdmin();
    });

    return (
        <Layout className="min-h-screen">
            <Layout.Sider
                width={260}
                collapsible
                trigger={null}
                className="shadow-xl transition-all duration-300"
                style={{
                    background: 'linear-gradient(135deg, #1a237e 0%, #283593 100%)',
                    minHeight: '100vh',
                }}
            >
                <div className="p-4 flex items-center justify-center">
                    <div className="text-white text-xl font-bold">
                        <span>Trang Quản Trị</span>
                    </div>
                </div>
                <SidebarAdmin selectedKey={selectedKey} onSelect={setSelectedKey} />
            </Layout.Sider>

            <Layout>
                <Content className="bg-gray-50">
                    <div className="bg-white rounded-xl shadow-md ">
                        {selectedKey === 'category' && <CategoryAdmin />}
                        {selectedKey === 'product' && <ProductAdmin />}
                        {selectedKey === 'coupon' && <CouponManagement />}
                        {selectedKey === 'order' && <OrderAdmin />}
                        {selectedKey === 'warranty' && <WarrantyAdmin />}
                        {selectedKey === 'message' && <MessageManager />}
                        {selectedKey === 'flashSale' && <FlashSaleAdmin />}
                        {selectedKey === 'blog' && <BlogAdmin />}
                        {selectedKey === 'contact' && <ContactManager />}
                        {selectedKey === 'dashboard' && <Dashbroad />}
                    </div>
                </Content>
            </Layout>
        </Layout>
    );
}

export default Admin;

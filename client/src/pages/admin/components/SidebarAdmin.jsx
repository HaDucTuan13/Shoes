import React from 'react';
import { Menu } from 'antd';
import {
    PieChartOutlined,
    AppstoreOutlined,
    ShoppingOutlined,
    DollarOutlined,
    ThunderboltFilled,
} from '@ant-design/icons';
import { FileText, MessageCircle, Phone, Shield } from 'lucide-react';

function SidebarAdmin({ selectedKey, onSelect }) {
    const menuItems = [
        {
            key: 'dashboard',
            icon: <PieChartOutlined />,
            label: <span className="font-medium">Thống kê</span>,
        },
        {
            key: 'category',
            icon: <AppstoreOutlined />,
            label: <span className="font-medium">Quản lý danh mục</span>,
        },
        {
            key: 'product',
            icon: <ShoppingOutlined />,
            label: <span className="font-medium">Quản lý sản phẩm</span>,
        },
        {
            key: 'coupon',
            icon: <DollarOutlined />,
            label: <span className="font-medium">Quản lý mã giảm giá</span>,
        },
        {
            key: 'order',
            icon: <ShoppingOutlined />,
            label: <span className="font-medium">Quản lý đơn hàng</span>,
        },
        {
            key: 'warranty',
            icon: <Shield size={16} />,
            label: <span className="font-medium">Quản lý bảo hành</span>,
        },
        {
            key: 'message',
            icon: <MessageCircle size={16} />,
            label: <span className="font-medium">Quản lý tin nhắn</span>,
        },
        {
            key: 'flashSale',
            icon: <ThunderboltFilled size={16} />,
            label: <span className="font-medium">Quản lý khuyến mãi</span>,
        },
        {
            key: 'blog',
            icon: <FileText size={16} />,
            label: <span className="font-medium">Quản lý blog</span>,
        },
        {
            key: 'contact',
            icon: <Phone size={16} />,
            label: <span className="font-medium">Quản lý liên hệ</span>,
        },
    ];

    return (
        <div className="flex flex-col">
            <Menu
                mode="inline"
                selectedKeys={[selectedKey]}
                onClick={({ key }) => onSelect && onSelect(key)}
                items={menuItems}
                className="border-r-0 text-white"
                style={{
                    background: 'transparent',
                }}
                theme="dark"
            />
        </div>
    );
}

export default SidebarAdmin;

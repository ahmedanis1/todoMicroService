import React from 'react';
import { Layout, Menu, Avatar, Dropdown, Space, Typography } from 'antd';
import { UserOutlined, LogoutOutlined, CheckSquareOutlined, HomeOutlined } from '@ant-design/icons';
import { useNavigate, useLocation } from 'react-router-dom';
import './AppLayout.css';

const { Header, Content, Footer } = Layout;
const { Text } = Typography;

const AppLayout = ({ children, onLogout }) => {
    const navigate = useNavigate();
    const location = useLocation();
    const user = JSON.parse(localStorage.getItem('user') || '{}');

    const userMenuItems = [
        {
            key: 'email',
            label: user.email,
            disabled: true,
        },
        {
            type: 'divider',
        },
        {
            key: 'logout',
            icon: <LogoutOutlined />,
            label: 'Logout',
            onClick: () => {
                onLogout();
                navigate('/auth');
            },
        },
    ];

    const navItems = [
        {
            key: '/home',
            icon: <HomeOutlined />,
            label: 'Home',
            onClick: () => navigate('/home'),
        },
    ];

    return (
        <Layout className="app-layout">
            <Header className="app-header">
                <div className="logo">
                    <CheckSquareOutlined style={{ fontSize: '24px', marginRight: '8px' }} />
                    <Text strong style={{ color: 'white', fontSize: '18px' }}>Todo App</Text>
                </div>

                <Menu
                    theme="dark"
                    mode="horizontal"
                    selectedKeys={[location.pathname]}
                    items={navItems}
                    style={{ flex: 1, minWidth: 0 }}
                />

                <Dropdown menu={{ items: userMenuItems }} placement="bottomRight">
                    <Space className="user-menu" style={{ cursor: 'pointer' }}>
                        <Avatar icon={<UserOutlined />} />
                        <Text style={{ color: 'white' }}>{user.email}</Text>
                    </Space>
                </Dropdown>
            </Header>

            <Content className="app-content">
                <div className="content-wrapper">
                    {children}
                </div>
            </Content>

            <Footer style={{ textAlign: 'center' }}>
                Todo App ©{new Date().getFullYear()} - Microservices Architecture
            </Footer>
        </Layout>
    );
};

export default AppLayout;
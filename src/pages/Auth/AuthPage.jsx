import React, { useState } from 'react';
import { Card, Form, Input, Button, Tabs, Typography, Alert, Space } from 'antd';
import { UserOutlined, LockOutlined, MailOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { authService } from '../../services/authService';
import './AuthPage.css';

const { Title, Text } = Typography;
const { TabPane } = Tabs;

const AuthPage = ({ onLogin }) => {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const navigate = useNavigate();
    const [form] = Form.useForm();

    const handleLogin = async (values) => {
        setLoading(true);
        setError('');

        try {
            const response = await authService.login(values.email, values.password);
            if (response.success) {
                onLogin(response.data.token, response.data.user);
                navigate('/home');
            }
        } catch (err) {
            setError(err.response?.data?.error?.message || 'Login failed. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const handleRegister = async (values) => {
        setLoading(true);
        setError('');

        try {
            const response = await authService.register(values.email, values.password);
            if (response.success) {
                onLogin(response.data.token, response.data.user);
                navigate('/home');
            }
        } catch (err) {
            setError(err.response?.data?.error?.message || 'Registration failed. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const LoginForm = () => (
        <Form
            form={form}
            name="login"
            onFinish={handleLogin}
            autoComplete="off"
            layout="vertical"
            size="large"
        >
            <Form.Item
                name="email"
                rules={[
                    { required: true, message: 'Please input your email!' },
                    { type: 'email', message: 'Please enter a valid email!' }
                ]}
            >
                <Input
                    prefix={<MailOutlined />}
                    placeholder="Email"
                    autoComplete="email"
                />
            </Form.Item>

            <Form.Item
                name="password"
                rules={[
                    { required: true, message: 'Please input your password!' },
                    { min: 6, message: 'Password must be at least 6 characters!' }
                ]}
            >
                <Input.Password
                    prefix={<LockOutlined />}
                    placeholder="Password"
                    autoComplete="current-password"
                />
            </Form.Item>

            <Form.Item>
                <Button type="primary" htmlType="submit" loading={loading} block>
                    Login
                </Button>
            </Form.Item>
        </Form>
    );

    const RegisterForm = () => (
        <Form
            form={form}
            name="register"
            onFinish={handleRegister}
            autoComplete="off"
            layout="vertical"
            size="large"
        >
            <Form.Item
                name="email"
                rules={[
                    { required: true, message: 'Please input your email!' },
                    { type: 'email', message: 'Please enter a valid email!' }
                ]}
            >
                <Input
                    prefix={<MailOutlined />}
                    placeholder="Email"
                    autoComplete="email"
                />
            </Form.Item>

            <Form.Item
                name="password"
                rules={[
                    { required: true, message: 'Please input your password!' },
                    { min: 6, message: 'Password must be at least 6 characters!' }
                ]}
            >
                <Input.Password
                    prefix={<LockOutlined />}
                    placeholder="Password (min 6 characters)"
                    autoComplete="new-password"
                />
            </Form.Item>

            <Form.Item
                name="confirmPassword"
                dependencies={['password']}
                rules={[
                    { required: true, message: 'Please confirm your password!' },
                    ({ getFieldValue }) => ({
                        validator(_, value) {
                            if (!value || getFieldValue('password') === value) {
                                return Promise.resolve();
                            }
                            return Promise.reject(new Error('Passwords do not match!'));
                        },
                    }),
                ]}
            >
                <Input.Password
                    prefix={<LockOutlined />}
                    placeholder="Confirm Password"
                    autoComplete="new-password"
                />
            </Form.Item>

            <Form.Item>
                <Button type="primary" htmlType="submit" loading={loading} block>
                    Register
                </Button>
            </Form.Item>
        </Form>
    );

    return (
        <div className="auth-container">
            <Card className="auth-card">
                <Space direction="vertical" size="large" style={{ width: '100%' }}>
                    <div className="auth-header">
                        <UserOutlined className="auth-icon" />
                        <Title level={2}>Todo Application</Title>
                        <Text type="secondary">Manage your tasks efficiently</Text>
                    </div>

                    {error && (
                        <Alert
                            message={error}
                            type="error"
                            showIcon
                            closable
                            onClose={() => setError('')}
                        />
                    )}

                    <Tabs
                        defaultActiveKey="login"
                        centered
                        onChange={() => {
                            form.resetFields();
                            setError('');
                        }}
                    >
                        <TabPane tab="Login" key="login">
                            <LoginForm />
                        </TabPane>
                        <TabPane tab="Sign Up" key="register">
                            <RegisterForm />
                        </TabPane>
                    </Tabs>
                </Space>
            </Card>
        </div>
    );
};

export default AuthPage;
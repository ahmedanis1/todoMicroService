import React, { useState, useEffect } from 'react';
import {
    Card, Descriptions, Button, Space, Tag, message,
    Typography, Spin, Result, Modal, Form, Input,
    Checkbox, Divider, Timeline, Avatar
} from 'antd';
import {
    ArrowLeftOutlined, EditOutlined, DeleteOutlined,
    CheckCircleOutlined, ClockCircleOutlined,
    CalendarOutlined, UserOutlined, SaveOutlined,
    CloseOutlined
} from '@ant-design/icons';
import { useParams, useNavigate } from 'react-router-dom';
import moment from 'moment';
import { todoService } from '../../services/todoService';
import './TodoDetailPage.css';

const { Title, Text, Paragraph } = Typography;
const { TextArea } = Input;

const TodoDetailPage = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [todo, setTodo] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [isEditing, setIsEditing] = useState(false);
    const [form] = Form.useForm();

    useEffect(() => {
        fetchTodoDetail();
    }, [id]);

    const fetchTodoDetail = async () => {
        setLoading(true);
        setError(null);
        try {
            const response = await todoService.getTodoById(id);
            if (response.success) {
                setTodo(response.data);
                form.setFieldsValue({
                    content: response.data.content,
                    completed: response.data.completed
                });
            }
        } catch (err) {
            setError('Failed to fetch todo details');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleUpdate = async (values) => {
        try {
            const response = await todoService.updateTodo(id, {
                content: values.content,
                completed: values.completed
            });
            if (response.success) {
                message.success('Todo updated successfully');
                setTodo(response.data);
                setIsEditing(false);
            }
        } catch (error) {
            message.error('Failed to update todo');
        }
    };

    const handleDelete = () => {
        Modal.confirm({
            title: 'Delete Todo',
            content: 'Are you sure you want to delete this todo? This action cannot be undone.',
            okText: 'Yes, Delete',
            okType: 'danger',
            cancelText: 'Cancel',
            onOk: async () => {
                try {
                    await todoService.deleteTodo(id);
                    message.success('Todo deleted successfully');
                    navigate('/home');
                } catch (error) {
                    message.error('Failed to delete todo');
                }
            },
        });
    };

    const handleToggleComplete = async () => {
        try {
            const response = await todoService.updateTodo(id, {
                completed: !todo.completed
            });
            if (response.success) {
                message.success(`Todo marked as ${!todo.completed ? 'completed' : 'pending'}`);
                setTodo(response.data);
                form.setFieldValue('completed', response.data.completed);
            }
        } catch (error) {
            message.error('Failed to update todo status');
        }
    };

    if (loading) {
        return (
            <div className="loading-container">
                <Spin size="large" tip="Loading todo details..." />
            </div>
        );
    }

    if (error) {
        return (
            <Result
                status="error"
                title="Failed to Load Todo"
                subTitle={error}
                extra={[
                    <Button key="back" onClick={() => navigate('/home')}>
                        Back to Home
                    </Button>,
                    <Button key="retry" type="primary" onClick={fetchTodoDetail}>
                        Retry
                    </Button>,
                ]}
            />
        );
    }

    if (!todo) {
        return (
            <Result
                status="404"
                title="Todo Not Found"
                subTitle="The todo you're looking for doesn't exist."
                extra={
                    <Button type="primary" onClick={() => navigate('/home')}>
                        Back to Home
                    </Button>
                }
            />
        );
    }

    const user = JSON.parse(localStorage.getItem('user') || '{}');

    return (
        <div className="todo-detail-container">
            <Card className="navigation-card">
                <Button
                    icon={<ArrowLeftOutlined />}
                    onClick={() => navigate('/home')}
                >
                    Back to Todos
                </Button>
            </Card>

            <Card className="detail-card">
                <div className="detail-header">
                    <div>
                        <Title level={2}>Todo Details</Title>
                        <Tag
                            icon={todo.completed ? <CheckCircleOutlined /> : <ClockCircleOutlined />}
                            color={todo.completed ? 'success' : 'processing'}
                            style={{ fontSize: '14px', padding: '4px 12px' }}
                        >
                            {todo.completed ? 'Completed' : 'Pending'}
                        </Tag>
                    </div>

                    {!isEditing && (
                        <Space>
                            <Button
                                type={todo.completed ? 'default' : 'primary'}
                                icon={<CheckCircleOutlined />}
                                onClick={handleToggleComplete}
                            >
                                Mark as {todo.completed ? 'Pending' : 'Complete'}
                            </Button>
                            <Button
                                icon={<EditOutlined />}
                                onClick={() => setIsEditing(true)}
                            >
                                Edit
                            </Button>
                            <Button
                                danger
                                icon={<DeleteOutlined />}
                                onClick={handleDelete}
                            >
                                Delete
                            </Button>
                        </Space>
                    )}
                </div>

                <Divider />

                {isEditing ? (
                    <Form
                        form={form}
                        layout="vertical"
                        onFinish={handleUpdate}
                        initialValues={{
                            content: todo.content,
                            completed: todo.completed
                        }}
                    >
                        <Form.Item
                            name="content"
                            label="Todo Content"
                            rules={[
                                { required: true, message: 'Please enter todo content' },
                                { min: 1, message: 'Content cannot be empty' },
                                { max: 1000, message: 'Content cannot exceed 1000 characters' }
                            ]}
                        >
                            <TextArea
                                rows={6}
                                placeholder="Enter your todo content..."
                                maxLength={1000}
                                showCount
                            />
                        </Form.Item>

                        <Form.Item
                            name="completed"
                            valuePropName="checked"
                        >
                            <Checkbox>Mark as completed</Checkbox>
                        </Form.Item>

                        <Form.Item>
                            <Space>
                                <Button
                                    type="primary"
                                    htmlType="submit"
                                    icon={<SaveOutlined />}
                                >
                                    Save Changes
                                </Button>
                                <Button
                                    onClick={() => {
                                        setIsEditing(false);
                                        form.setFieldsValue({
                                            content: todo.content,
                                            completed: todo.completed
                                        });
                                    }}
                                    icon={<CloseOutlined />}
                                >
                                    Cancel
                                </Button>
                            </Space>
                        </Form.Item>
                    </Form>
                ) : (
                    <>
                        <Card className="content-card">
                            <Title level={4}>Content</Title>
                            <Paragraph className="todo-content">
                                {todo.content}
                            </Paragraph>
                        </Card>

                        <Card className="info-card">
                            <Title level={4}>Information</Title>
                            <Descriptions column={1} bordered>
                                <Descriptions.Item label="ID">
                                    <Text code>{todo.uuid}</Text>
                                </Descriptions.Item>
                                <Descriptions.Item label="Status">
                                    <Tag
                                        icon={todo.completed ? <CheckCircleOutlined /> : <ClockCircleOutlined />}
                                        color={todo.completed ? 'success' : 'processing'}
                                    >
                                        {todo.completed ? 'Completed' : 'Pending'}
                                    </Tag>
                                </Descriptions.Item>
                                <Descriptions.Item label="Created By">
                                    <Space>
                                        <Avatar size="small" icon={<UserOutlined />} />
                                        <Text>{user.email}</Text>
                                    </Space>
                                </Descriptions.Item>
                                <Descriptions.Item label="Created At">
                                    <Space>
                                        <CalendarOutlined />
                                        <Text>{moment(todo.createdAt).format('YYYY-MM-DD HH:mm:ss')}</Text>
                                        <Text type="secondary">({moment(todo.createdAt).fromNow()})</Text>
                                    </Space>
                                </Descriptions.Item>
                                <Descriptions.Item label="Last Updated">
                                    <Space>
                                        <CalendarOutlined />
                                        <Text>{moment(todo.updatedAt).format('YYYY-MM-DD HH:mm:ss')}</Text>
                                        <Text type="secondary">({moment(todo.updatedAt).fromNow()})</Text>
                                    </Space>
                                </Descriptions.Item>
                            </Descriptions>
                        </Card>

                        <Card className="timeline-card">
                            <Title level={4}>Activity Timeline</Title>
                            <Timeline mode="left">
                                <Timeline.Item
                                    dot={<CalendarOutlined style={{ fontSize: '16px' }} />}
                                    color="green"
                                >
                                    <Text strong>Created</Text>
                                    <br />
                                    <Text type="secondary">
                                        {moment(todo.createdAt).format('YYYY-MM-DD HH:mm:ss')}
                                    </Text>
                                </Timeline.Item>

                                {todo.updatedAt !== todo.createdAt && (
                                    <Timeline.Item
                                        dot={<EditOutlined style={{ fontSize: '16px' }} />}
                                        color="blue"
                                    >
                                        <Text strong>Last Modified</Text>
                                        <br />
                                        <Text type="secondary">
                                            {moment(todo.updatedAt).format('YYYY-MM-DD HH:mm:ss')}
                                        </Text>
                                    </Timeline.Item>
                                )}

                                {todo.completed && (
                                    <Timeline.Item
                                        dot={<CheckCircleOutlined style={{ fontSize: '16px' }} />}
                                        color="green"
                                    >
                                        <Text strong>Marked as Completed</Text>
                                    </Timeline.Item>
                                )}
                            </Timeline>
                        </Card>
                    </>
                )}
            </Card>
        </div>
    );
};

export default TodoDetailPage;
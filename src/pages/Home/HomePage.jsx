import React, { useState, useEffect } from 'react';
import {
    Table, Button, Space, Modal, Input, message, Card,
    Tag, Tooltip, Typography, Row, Col, Statistic, Empty,
    Popconfirm, Form, Checkbox
} from 'antd';
import {
    PlusOutlined, EditOutlined, DeleteOutlined,
    EyeOutlined, CheckCircleOutlined, ClockCircleOutlined,
    ReloadOutlined
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import moment from 'moment';
import { todoService } from '../../services/todoService';
import Loading from '../../components/Loading/Loading';
import './HomePage.css';

const { Title } = Typography;
const { TextArea } = Input;

const HomePage = () => {
    const [todos, setTodos] = useState([]);
    const [loading, setLoading] = useState(false);
    const [modalVisible, setModalVisible] = useState(false);
    const [editModalVisible, setEditModalVisible] = useState(false);
    const [currentTodo, setCurrentTodo] = useState(null);
    const [form] = Form.useForm();
    const [editForm] = Form.useForm();
    const navigate = useNavigate();

    useEffect(() => {
        fetchTodos();
    }, []);

    const fetchTodos = async () => {
        setLoading(true);
        try {
            const response = await todoService.getAllTodos();
            if (response.success) {
                setTodos(response.data || []);
            }
        } catch (error) {
            message.error('Failed to fetch todos');
        } finally {
            setLoading(false);
        }
    };

    const handleCreate = async (values) => {
        try {
            const response = await todoService.createTodo(values.content);
            if (response.success) {
                message.success('Todo created successfully');
                setModalVisible(false);
                form.resetFields();
                fetchTodos();
            }
        } catch (error) {
            message.error('Failed to create todo');
        }
    };

    const handleUpdate = async (values) => {
        try {
            const response = await todoService.updateTodo(currentTodo.uuid, {
                content: values.content,
                completed: values.completed
            });
            if (response.success) {
                message.success('Todo updated successfully');
                setEditModalVisible(false);
                editForm.resetFields();
                fetchTodos();
            }
        } catch (error) {
            message.error('Failed to update todo');
        }
    };

    const handleDelete = async (id) => {
        try {
            await todoService.deleteTodo(id);
            message.success('Todo deleted successfully');
            fetchTodos();
        } catch (error) {
            message.error('Failed to delete todo');
        }
    };

    const handleToggleComplete = async (record) => {
        try {
            await todoService.updateTodo(record.uuid, {
                completed: !record.completed
            });
            message.success(`Todo marked as ${!record.completed ? 'completed' : 'pending'}`);
            fetchTodos();
        } catch (error) {
            message.error('Failed to update todo status');
        }
    };

    const openEditModal = (record) => {
        setCurrentTodo(record);
        editForm.setFieldsValue({
            content: record.content,
            completed: record.completed
        });
        setEditModalVisible(true);
    };

    const columns = [
        {
            title: 'Content',
            dataIndex: 'content',
            key: 'content',
            render: (text, record) => (
                <Space>
          <span
              style={{
                  textDecoration: record.completed ? 'line-through' : 'none',
                  color: record.completed ? '#999' : '#000',
                  cursor: 'pointer'
              }}
              onClick={() => navigate(`/todo/${record.uuid}`)}
          >
            {text}
          </span>
                </Space>
            ),
        },
        {
            title: 'Status',
            dataIndex: 'completed',
            key: 'completed',
            width: 120,
            render: (completed) => (
                <Tag
                    icon={completed ? <CheckCircleOutlined /> : <ClockCircleOutlined />}
                    color={completed ? 'success' : 'processing'}
                >
                    {completed ? 'Completed' : 'Pending'}
                </Tag>
            ),
            filters: [
                { text: 'Completed', value: true },
                { text: 'Pending', value: false },
            ],
            onFilter: (value, record) => record.completed === value,
        },
        {
            title: 'Created At',
            dataIndex: 'createdAt',
            key: 'createdAt',
            width: 180,
            render: (date) => moment(date).format('YYYY-MM-DD HH:mm'),
            sorter: (a, b) => moment(a.createdAt).unix() - moment(b.createdAt).unix(),
        },
        {
            title: 'Actions',
            key: 'actions',
            width: 200,
            render: (_, record) => (
                <Space size="small">
                    <Tooltip title="View Details">
                        <Button
                            type="text"
                            icon={<EyeOutlined />}
                            onClick={() => navigate(`/todo/${record.uuid}`)}
                        />
                    </Tooltip>

                    <Tooltip title={record.completed ? 'Mark as Pending' : 'Mark as Complete'}>
                        <Button
                            type="text"
                            icon={<CheckCircleOutlined />}
                            onClick={() => handleToggleComplete(record)}
                            style={{ color: record.completed ? '#52c41a' : '#999' }}
                        />
                    </Tooltip>

                    <Tooltip title="Edit">
                        <Button
                            type="text"
                            icon={<EditOutlined />}
                            onClick={() => openEditModal(record)}
                        />
                    </Tooltip>

                    <Popconfirm
                        title="Delete Todo"
                        description="Are you sure you want to delete this todo?"
                        onConfirm={() => handleDelete(record.uuid)}
                        okText="Yes"
                        cancelText="No"
                    >
                        <Tooltip title="Delete">
                            <Button
                                type="text"
                                danger
                                icon={<DeleteOutlined />}
                            />
                        </Tooltip>
                    </Popconfirm>
                </Space>
            ),
        },
    ];

    const completedCount = todos.filter(todo => todo.completed).length;
    const pendingCount = todos.filter(todo => !todo.completed).length;

    return (
        <div className="home-container">
            <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
                <Col xs={24} sm={8}>
                    <Card>
                        <Statistic
                            title="Total Todos"
                            value={todos.length}
                            prefix={<CheckCircleOutlined />}
                            valueStyle={{ color: '#1890ff' }}
                        />
                    </Card>
                </Col>
                <Col xs={24} sm={8}>
                    <Card>
                        <Statistic
                            title="Completed"
                            value={completedCount}
                            prefix={<CheckCircleOutlined />}
                            valueStyle={{ color: '#52c41a' }}
                        />
                    </Card>
                </Col>
                <Col xs={24} sm={8}>
                    <Card>
                        <Statistic
                            title="Pending"
                            value={pendingCount}
                            prefix={<ClockCircleOutlined />}
                            valueStyle={{ color: '#faad14' }}
                        />
                    </Card>
                </Col>
            </Row>

            <Card>
                <div className="table-header">
                    <Title level={3}>My Todos</Title>
                    <Space>
                        <Button
                            icon={<ReloadOutlined />}
                            onClick={fetchTodos}
                            loading={loading}
                        >
                            Refresh
                        </Button>
                        <Button
                            type="primary"
                            icon={<PlusOutlined />}
                            onClick={() => setModalVisible(true)}
                        >
                            Add Todo
                        </Button>
                    </Space>
                </div>

                {loading ? (
                    <Loading />
                ) : todos.length === 0 ? (
                    <Empty
                        description="No todos yet. Create your first todo!"
                        style={{ padding: '60px 0' }}
                    >
                        <Button
                            type="primary"
                            icon={<PlusOutlined />}
                            onClick={() => setModalVisible(true)}
                        >
                            Create Todo
                        </Button>
                    </Empty>
                ) : (
                    <Table
                        columns={columns}
                        dataSource={todos}
                        rowKey="uuid"
                        pagination={{
                            pageSize: 10,
                            showSizeChanger: true,
                            showTotal: (total) => `Total ${total} todos`,
                        }}
                        onRow={(record) => ({
                            onClick: () => navigate(`/todo/${record.uuid}`),
                            style: { cursor: 'pointer' },
                        })}
                    />
                )}
            </Card>

            {/* Create Todo Modal */}
            <Modal
                title="Create New Todo"
                open={modalVisible}
                onCancel={() => {
                    setModalVisible(false);
                    form.resetFields();
                }}
                footer={null}
            >
                <Form
                    form={form}
                    layout="vertical"
                    onFinish={handleCreate}
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
                            rows={4}
                            placeholder="Enter your todo content..."
                            maxLength={1000}
                            showCount
                        />
                    </Form.Item>

                    <Form.Item>
                        <Space style={{ width: '100%', justifyContent: 'flex-end' }}>
                            <Button onClick={() => {
                                setModalVisible(false);
                                form.resetFields();
                            }}>
                                Cancel
                            </Button>
                            <Button type="primary" htmlType="submit">
                                Create
                            </Button>
                        </Space>
                    </Form.Item>
                </Form>
            </Modal>

            {/* Edit Todo Modal */}
            <Modal
                title="Edit Todo"
                open={editModalVisible}
                onCancel={() => {
                    setEditModalVisible(false);
                    editForm.resetFields();
                }}
                footer={null}
            >
                <Form
                    form={editForm}
                    layout="vertical"
                    onFinish={handleUpdate}
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
                            rows={4}
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
                        <Space style={{ width: '100%', justifyContent: 'flex-end' }}>
                            <Button onClick={() => {
                                setEditModalVisible(false);
                                editForm.resetFields();
                            }}>
                                Cancel
                            </Button>
                            <Button type="primary" htmlType="submit">
                                Update
                            </Button>
                        </Space>
                    </Form.Item>
                </Form>
            </Modal>
        </div>
    );
};

export default HomePage;
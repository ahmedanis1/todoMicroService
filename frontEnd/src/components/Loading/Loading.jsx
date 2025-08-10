import React from 'react';
import { Spin } from 'antd';
import { LoadingOutlined } from '@ant-design/icons';

const Loading = ({ size = 'large', tip = 'Loading...' }) => {
    const antIcon = <LoadingOutlined style={{ fontSize: size === 'large' ? 48 : 24 }} spin />;

    return (
        <div style={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            minHeight: '400px'
        }}>
            <Spin indicator={antIcon} tip={tip} size={size} />
        </div>
    );
};

export default Loading;
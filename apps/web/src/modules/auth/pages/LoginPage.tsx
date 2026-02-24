import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Form, Input, Button, Typography, Space, Divider, message } from 'antd';
import { MailOutlined, LockOutlined, UserOutlined, GithubOutlined, GoogleOutlined, ArrowRightOutlined } from '@ant-design/icons';
import { motion } from 'framer-motion';
import { useAuthStore } from '../../../stores/auth.store';
import apiClient from '../../../api/client';

const { Title, Text, Link } = Typography;

const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const { setAuth } = useAuthStore();
  const [isRegister, setIsRegister] = useState(false);
  const [loading, setLoading] = useState(false);

  const onFinish = async (values: any) => {
    setLoading(true);
    try {
      const endpoint = isRegister ? '/auth/register' : '/auth/login';
      const response = await apiClient.post(endpoint, values);
      const { accessToken, refreshToken, user } = response.data.data;
      setAuth(user, accessToken, refreshToken);
      message.success(isRegister ? 'Account created!' : 'Welcome back!');
      navigate('/dashboard');
    } catch (error: any) {
      message.error(error.response?.data?.message || 'Authentication failed');
    } finally {
      setLoading(false);
    }
  };

  const inputStyle = {
    height: 46, borderRadius: 10,
    background: 'var(--c-glass-highlight)',
    border: '1px solid var(--c-glass-border)',
  };

  return (
    <div style={{
      minHeight: '100vh', background: 'var(--c-bg-void)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      position: 'relative',
    }}>
      {/* Static ambient */}
      <div style={{
        position: 'fixed', inset: 0, pointerEvents: 'none',
        background: 'radial-gradient(ellipse 60% 50% at 30% 20%, rgba(124,106,239,0.06) 0%, transparent 60%), radial-gradient(ellipse 50% 40% at 70% 80%, rgba(54,191,170,0.03) 0%, transparent 60%)',
      }} />

      {/* Card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
        style={{
          width: 420, padding: '40px 36px',
          background: 'var(--c-bg-surface)',
          borderRadius: 18,
          border: '1px solid var(--c-glass-border)',
          boxShadow: 'var(--shadow-xl)',
          position: 'relative', zIndex: 1,
        }}
      >
        {/* Logo */}
        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <Title level={3} style={{
            margin: 0, fontFamily: "'Outfit', sans-serif", fontWeight: 800,
            fontSize: 24, color: 'var(--c-text-bright)', letterSpacing: 3,
          }}>
            COMMUNE
          </Title>
          <Text style={{ color: 'var(--c-text-dim)', fontSize: 11, letterSpacing: 1.5, fontWeight: 500, display: 'block', marginTop: 4 }}>
            COMMUNITY OPERATING SYSTEM
          </Text>
        </div>

        <Form name="auth" onFinish={onFinish} layout="vertical" size="large" requiredMark={false}>
          {isRegister && (
            <>
              <Form.Item name="username" rules={[{ required: true, message: 'Username required' }, { min: 3, message: 'Min 3 chars' }]}>
                <Input prefix={<UserOutlined style={{ color: 'var(--c-text-dim)' }} />} placeholder="Username" style={inputStyle} />
              </Form.Item>
              <Form.Item name="displayName" rules={[{ required: true, message: 'Display name required' }]}>
                <Input prefix={<UserOutlined style={{ color: 'var(--c-text-dim)' }} />} placeholder="Display Name" style={inputStyle} />
              </Form.Item>
            </>
          )}

          <Form.Item name="email" rules={[{ required: true, message: 'Email required' }, { type: 'email', message: 'Invalid email' }]}>
            <Input prefix={<MailOutlined style={{ color: 'var(--c-text-dim)' }} />} placeholder="Email address" style={inputStyle} />
          </Form.Item>

          <Form.Item name="password" rules={[{ required: true, message: 'Password required' }, ...(isRegister ? [{ min: 8, message: 'Min 8 chars' }] : [])]}>
            <Input.Password prefix={<LockOutlined style={{ color: 'var(--c-text-dim)' }} />} placeholder="Password" style={inputStyle} />
          </Form.Item>

          <Form.Item style={{ marginBottom: 14 }}>
            <Button
              type="primary"
              htmlType="submit"
              block
              loading={loading}
              style={{
                height: 48, fontWeight: 700, fontSize: 15,
                background: 'var(--c-accent)', border: 'none', borderRadius: 10,
                boxShadow: '0 4px 16px rgba(124,106,239,0.25)',
              }}
            >
              {isRegister ? 'Create Account' : 'Sign In'} <ArrowRightOutlined style={{ marginLeft: 6 }} />
            </Button>
          </Form.Item>
        </Form>

        <Divider style={{ borderColor: 'var(--c-glass-border)', margin: '16px 0' }}>
          <Text style={{ color: 'var(--c-text-dim)', fontSize: 10, letterSpacing: 1, fontWeight: 600 }}>OR CONTINUE WITH</Text>
        </Divider>

        <Space direction="vertical" style={{ width: '100%' }} size={8}>
          <Button
            block
            icon={<GithubOutlined />}
            onClick={() => { window.location.href = 'http://localhost:3000/api/v1/auth/oauth/github'; }}
            style={{
              height: 44, background: 'var(--c-glass-highlight)',
              borderColor: 'var(--c-glass-border)', color: 'var(--c-text-base)',
              borderRadius: 10, fontWeight: 500,
            }}
          >
            GitHub
          </Button>
          <Button
            block
            icon={<GoogleOutlined />}
            onClick={() => { window.location.href = 'http://localhost:3000/api/v1/auth/oauth/google'; }}
            style={{
              height: 44, background: 'var(--c-glass-highlight)',
              borderColor: 'var(--c-glass-border)', color: 'var(--c-text-base)',
              borderRadius: 10, fontWeight: 500,
            }}
          >
            Google
          </Button>
        </Space>

        <div style={{ textAlign: 'center', marginTop: 20 }}>
          <Text style={{ color: 'var(--c-text-dim)', fontSize: 13 }}>
            {isRegister ? 'Already have an account? ' : "Don't have an account? "}
            <Link
              onClick={() => setIsRegister(!isRegister)}
              style={{ color: 'var(--c-accent-soft)', fontWeight: 600 }}
            >
              {isRegister ? 'Sign in' : 'Create one'}
            </Link>
          </Text>
        </div>
      </motion.div>
    </div>
  );
};

export default LoginPage;

import React, { useEffect, useState } from 'react';
import {
  Typography, Form, Input, Button, Card, Row, Col, Switch, Avatar,
  Divider, Space, message, Tabs,
} from 'antd';
import {
  UserOutlined, SettingOutlined, BellOutlined, PaletteOutlined,
  SaveOutlined, MailOutlined, EnvironmentOutlined, LinkOutlined,
  LockOutlined,
} from '@ant-design/icons';
import { motion } from 'framer-motion';
import { useMutation } from '@tanstack/react-query';
import { authApi } from '../../../api';
import { useAuthStore } from '../../../stores/auth.store';
import { useUIStore } from '../../../stores/ui.store';

const { Title, Text, Paragraph } = Typography;
const { TextArea } = Input;

const fadeUp = {
  hidden: { opacity: 0, y: 16 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4, ease: [0.16, 1, 0.3, 1] } },
};

const SettingsPage: React.FC = () => {
  const { user, setUser } = useAuthStore();
  const { theme, setTheme } = useUIStore();
  const [form] = Form.useForm();
  const [passwordForm] = Form.useForm();

  // Notification preferences (local only — no backend endpoint yet)
  const [notifPrefs, setNotifPrefs] = useState({
    emailDigest: true,
    pushEvents: true,
    pushMessages: true,
    pushMentions: true,
    pushTasks: false,
    weeklyReport: true,
  });

  useEffect(() => {
    if (user) {
      form.setFieldsValue({
        displayName: user.displayName ?? '',
        bio: (user as any).bio ?? '',
        location: (user as any).location ?? '',
        website: (user as any).website ?? '',
        avatarUrl: (user as any).avatarUrl ?? '',
      });
    }
  }, [user, form]);

  const updateProfile = useMutation({
    mutationFn: (values: Record<string, unknown>) => authApi.updateProfile(values),
    onSuccess: (updatedUser: any) => {
      setUser(updatedUser);
      message.success('Profile updated successfully');
    },
    onError: (err: any) => {
      message.error(err?.response?.data?.message || 'Failed to update profile');
    },
  });

  const handleSaveProfile = (values: any) => {
    // Only send changed fields
    const payload: Record<string, unknown> = {};
    for (const key of Object.keys(values)) {
      if (values[key] !== undefined && values[key] !== '') {
        payload[key] = values[key];
      }
    }
    updateProfile.mutate(payload);
  };

  const cardStyle: React.CSSProperties = {
    background: 'var(--c-bg-surface)',
    border: '1px solid var(--c-glass-border)',
    borderRadius: 16,
    backdropFilter: 'blur(20px)',
  };

  const inputStyle: React.CSSProperties = {
    borderRadius: 12,
    height: 44,
  };

  const tabItems = [
    {
      key: 'profile',
      label: <span><UserOutlined /> Profile</span>,
      children: (
        <motion.div variants={fadeUp} initial="hidden" animate="visible">
          <Row gutter={[24, 24]}>
            <Col xs={24} lg={16}>
              <Card style={cardStyle} styles={{ body: { padding: 28 } }}>
                <Title level={4} style={{
                  color: 'var(--c-text-bright)', margin: '0 0 24px',
                  fontFamily: "'Outfit', sans-serif", fontWeight: 700,
                }}>
                  Personal Information
                </Title>

                <Form
                  form={form}
                  layout="vertical"
                  onFinish={handleSaveProfile}
                  requiredMark={false}
                >
                  <Row gutter={16}>
                    <Col xs={24} sm={12}>
                      <Form.Item label={<Text style={{ color: 'var(--c-text-muted)', fontWeight: 600, fontSize: 13 }}>Display Name</Text>}
                        name="displayName" rules={[{ required: true, message: 'Display name is required' }]}>
                        <Input prefix={<UserOutlined style={{ color: 'var(--c-text-dim)' }} />}
                          placeholder="Your Name" style={inputStyle} />
                      </Form.Item>
                    </Col>
                    <Col xs={24} sm={12}>
                      <Form.Item label={<Text style={{ color: 'var(--c-text-muted)', fontWeight: 600, fontSize: 13 }}>Location</Text>} name="location">
                        <Input prefix={<EnvironmentOutlined style={{ color: 'var(--c-text-dim)' }} />}
                          placeholder="San Francisco, CA" style={inputStyle} />
                      </Form.Item>
                    </Col>
                  </Row>

                  <Form.Item label={<Text style={{ color: 'var(--c-text-muted)', fontWeight: 600, fontSize: 13 }}>Bio</Text>} name="bio">
                    <TextArea rows={3} placeholder="Tell the community about yourself..." style={{ borderRadius: 12 }} maxLength={500} showCount />
                  </Form.Item>

                  <Row gutter={16}>
                    <Col xs={24} sm={12}>
                      <Form.Item label={<Text style={{ color: 'var(--c-text-muted)', fontWeight: 600, fontSize: 13 }}>Website</Text>} name="website">
                        <Input prefix={<LinkOutlined style={{ color: 'var(--c-text-dim)' }} />}
                          placeholder="https://yoursite.com" style={inputStyle} />
                      </Form.Item>
                    </Col>
                    <Col xs={24} sm={12}>
                      <Form.Item label={<Text style={{ color: 'var(--c-text-muted)', fontWeight: 600, fontSize: 13 }}>Avatar URL</Text>} name="avatarUrl">
                        <Input prefix={<UserOutlined style={{ color: 'var(--c-text-dim)' }} />}
                          placeholder="https://..." style={inputStyle} />
                      </Form.Item>
                    </Col>
                  </Row>

                  <Form.Item style={{ marginBottom: 0, marginTop: 8 }}>
                    <motion.div whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.98 }}>
                      <Button type="primary" htmlType="submit" icon={<SaveOutlined />}
                        loading={updateProfile.isPending}
                        style={{
                          background: 'var(--c-accent)', border: 'none', fontWeight: 700,
                          borderRadius: 12, height: 48, padding: '0 28px',
                          boxShadow: '0 4px 16px rgba(124,106,239,0.25)',
                        }}>
                        Save Changes
                      </Button>
                    </motion.div>
                  </Form.Item>
                </Form>
              </Card>
            </Col>

            {/* Profile preview card */}
            <Col xs={24} lg={8}>
              <Card style={cardStyle} styles={{ body: { padding: 28, textAlign: 'center' } }}>
                <Title level={5} style={{
                  color: 'var(--c-text-bright)', margin: '0 0 20px',
                  fontFamily: "'Outfit', sans-serif", fontWeight: 700, textAlign: 'left',
                }}>
                  Preview
                </Title>

                <Avatar
                  src={form.getFieldValue('avatarUrl') || user?.avatarUrl}
                  size={100}
                  style={{
                    background: 'var(--c-accent)', fontSize: 42,
                    fontWeight: 800, fontFamily: "'Outfit', sans-serif",
                    boxShadow: '0 8px 32px rgba(124,106,239,0.3)',
                  }}
                >
                  {user?.displayName?.[0] ?? 'U'}
                </Avatar>

                <Title level={4} style={{ color: 'var(--c-text-bright)', marginTop: 16, marginBottom: 4, fontFamily: "'Outfit'" }}>
                  {user?.displayName}
                </Title>
                <Text style={{ color: 'var(--c-text-dim)', fontSize: 13 }}>@{user?.username}</Text>

                <Divider style={{ borderColor: 'var(--c-glass-border)', margin: '16px 0' }} />

                <div style={{ textAlign: 'left' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                    <MailOutlined style={{ color: 'var(--c-text-dim)', fontSize: 14 }} />
                    <Text style={{ color: 'var(--c-text-muted)', fontSize: 13 }}>{user?.email}</Text>
                  </div>
                  {(user as any)?.location && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                      <EnvironmentOutlined style={{ color: 'var(--c-text-dim)', fontSize: 14 }} />
                      <Text style={{ color: 'var(--c-text-muted)', fontSize: 13 }}>{(user as any).location}</Text>
                    </div>
                  )}
                  {(user as any)?.website && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <LinkOutlined style={{ color: 'var(--c-text-dim)', fontSize: 14 }} />
                      <Text style={{ color: 'var(--c-accent-soft)', fontSize: 13 }}>{(user as any).website}</Text>
                    </div>
                  )}
                </div>

                <Divider style={{ borderColor: 'var(--c-glass-border)', margin: '16px 0' }} />
                <Text style={{ color: 'var(--c-text-ghost)', fontSize: 11 }}>
                  Joined {user?.createdAt ? new Date(user.createdAt).toLocaleDateString('en-US', { month: 'short', year: 'numeric' }) : '—'}
                </Text>
              </Card>
            </Col>
          </Row>
        </motion.div>
      ),
    },
    {
      key: 'appearance',
      label: <span><PaletteOutlined /> Appearance</span>,
      children: (
        <motion.div variants={fadeUp} initial="hidden" animate="visible">
          <Card style={{ ...cardStyle, maxWidth: 640 }} styles={{ body: { padding: 28 } }}>
            <Title level={4} style={{
              color: 'var(--c-text-bright)', margin: '0 0 8px',
              fontFamily: "'Outfit', sans-serif", fontWeight: 700,
            }}>
              Theme
            </Title>
            <Text style={{ color: 'var(--c-text-muted)', display: 'block', marginBottom: 24 }}>
              Choose how Commune looks for you.
            </Text>

            <div style={{ display: 'flex', gap: 16 }}>
              {[
                { key: 'dark', label: 'Dark', emoji: '🌙', bg: '#0E0E16', fg: '#F4F4F5', accent: '#7C6AEF' },
                { key: 'light', label: 'Light', emoji: '☀️', bg: '#F5F5FA', fg: '#16162A', accent: '#6C5CE7' },
              ].map((t) => (
                <motion.div
                  key={t.key}
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.97 }}
                  onClick={() => setTheme(t.key as 'dark' | 'light')}
                  style={{
                    flex: 1, cursor: 'pointer', padding: 24, borderRadius: 16,
                    border: `2px solid ${theme === t.key ? 'var(--c-accent)' : 'var(--c-glass-border)'}`,
                    background: theme === t.key ? 'var(--c-accent-muted)' : 'var(--c-glass-highlight)',
                    transition: 'all 0.2s',
                    textAlign: 'center',
                  }}
                >
                  <div style={{ fontSize: 36, marginBottom: 12 }}>{t.emoji}</div>
                  <div style={{
                    width: '100%', height: 48, borderRadius: 10,
                    background: t.bg, border: `1px solid ${t.accent}33`,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    gap: 8, marginBottom: 12,
                  }}>
                    <div style={{ width: 24, height: 8, borderRadius: 4, background: t.accent }} />
                    <div style={{ width: 16, height: 8, borderRadius: 4, background: `${t.fg}33` }} />
                  </div>
                  <Text style={{
                    color: theme === t.key ? 'var(--c-accent)' : 'var(--c-text-muted)',
                    fontWeight: 700, fontSize: 14,
                  }}>{t.label}</Text>
                </motion.div>
              ))}
            </div>
          </Card>
        </motion.div>
      ),
    },
    {
      key: 'notifications',
      label: <span><BellOutlined /> Notifications</span>,
      children: (
        <motion.div variants={fadeUp} initial="hidden" animate="visible">
          <Card style={{ ...cardStyle, maxWidth: 640 }} styles={{ body: { padding: 28 } }}>
            <Title level={4} style={{
              color: 'var(--c-text-bright)', margin: '0 0 8px',
              fontFamily: "'Outfit', sans-serif", fontWeight: 700,
            }}>
              Notification Preferences
            </Title>
            <Text style={{ color: 'var(--c-text-muted)', display: 'block', marginBottom: 24 }}>
              Control which notifications you receive.
            </Text>

            <Space direction="vertical" size={0} style={{ width: '100%' }}>
              {[
                { key: 'emailDigest', label: 'Email Digest', desc: 'Receive a daily summary of activity' },
                { key: 'pushEvents', label: 'Event Reminders', desc: 'Get notified before events start' },
                { key: 'pushMessages', label: 'New Messages', desc: 'Direct message notifications' },
                { key: 'pushMentions', label: 'Mentions', desc: 'When someone mentions you in a task or channel' },
                { key: 'pushTasks', label: 'Task Updates', desc: 'Changes to tasks assigned to you' },
                { key: 'weeklyReport', label: 'Weekly Report', desc: 'Summary of your community contributions' },
              ].map(({ key, label, desc }) => (
                <div key={key} style={{
                  display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                  padding: '16px 0',
                  borderBottom: '1px solid var(--c-glass-border)',
                }}>
                  <div>
                    <Text style={{ color: 'var(--c-text-bright)', fontWeight: 600, display: 'block', fontSize: 14 }}>{label}</Text>
                    <Text style={{ color: 'var(--c-text-dim)', fontSize: 12 }}>{desc}</Text>
                  </div>
                  <Switch
                    checked={notifPrefs[key as keyof typeof notifPrefs]}
                    onChange={(checked) => setNotifPrefs((p) => ({ ...p, [key]: checked }))}
                  />
                </div>
              ))}
            </Space>
          </Card>
        </motion.div>
      ),
    },
    {
      key: 'security',
      label: <span><LockOutlined /> Security</span>,
      children: (
        <motion.div variants={fadeUp} initial="hidden" animate="visible">
          <Card style={{ ...cardStyle, maxWidth: 640 }} styles={{ body: { padding: 28 } }}>
            <Title level={4} style={{
              color: 'var(--c-text-bright)', margin: '0 0 8px',
              fontFamily: "'Outfit', sans-serif", fontWeight: 700,
            }}>
              Change Password
            </Title>
            <Text style={{ color: 'var(--c-text-muted)', display: 'block', marginBottom: 24 }}>
              Update your password to keep your account secure.
            </Text>

            <Form form={passwordForm} layout="vertical" requiredMark={false}
              onFinish={() => message.info('Password change is not yet supported by the API')}>
              <Form.Item name="currentPassword"
                label={<Text style={{ color: 'var(--c-text-muted)', fontWeight: 600, fontSize: 13 }}>Current Password</Text>}
                rules={[{ required: true }]}>
                <Input.Password prefix={<LockOutlined style={{ color: 'var(--c-text-dim)' }} />}
                  placeholder="Enter current password" style={inputStyle} />
              </Form.Item>
              <Form.Item name="newPassword"
                label={<Text style={{ color: 'var(--c-text-muted)', fontWeight: 600, fontSize: 13 }}>New Password</Text>}
                rules={[{ required: true }, { min: 8, message: 'At least 8 characters' }]}>
                <Input.Password prefix={<LockOutlined style={{ color: 'var(--c-text-dim)' }} />}
                  placeholder="Enter new password" style={inputStyle} />
              </Form.Item>
              <Form.Item name="confirmPassword"
                label={<Text style={{ color: 'var(--c-text-muted)', fontWeight: 600, fontSize: 13 }}>Confirm New Password</Text>}
                dependencies={['newPassword']}
                rules={[{ required: true }, ({ getFieldValue }) => ({
                  validator(_, value) {
                    if (!value || getFieldValue('newPassword') === value) return Promise.resolve();
                    return Promise.reject(new Error('Passwords do not match'));
                  },
                })]}>
                <Input.Password prefix={<LockOutlined style={{ color: 'var(--c-text-dim)' }} />}
                  placeholder="Confirm new password" style={inputStyle} />
              </Form.Item>
              <Form.Item style={{ marginBottom: 0 }}>
                <Button type="primary" htmlType="submit"
                  style={{
                    background: 'var(--c-accent)', border: 'none',
                    fontWeight: 700, borderRadius: 12, height: 44,
                    padding: '0 24px',
                  }}>
                  Update Password
                </Button>
              </Form.Item>
            </Form>

            <Divider style={{ borderColor: 'var(--c-glass-border)' }} />

            <Title level={5} style={{ color: 'var(--c-text-bright)', fontFamily: "'Outfit'", fontWeight: 700 }}>
              Active Sessions
            </Title>
            <Paragraph style={{ color: 'var(--c-text-dim)', fontSize: 13 }}>
              Manage your active login sessions. Logging out on other devices will require re-authentication.
            </Paragraph>
            <Button danger onClick={() => message.info('Session management coming soon')}>
              Log Out All Other Sessions
            </Button>
          </Card>
        </motion.div>
      ),
    },
  ];

  return (
    <div style={{ position: 'relative' }}>
      {/* Ambient glow */}
      <div style={{
        position: 'absolute', top: -80, right: 80, width: 300, height: 300,
        background: 'radial-gradient(circle, rgba(124,106,239,0.06) 0%, transparent 60%)',
        filter: 'blur(60px)', pointerEvents: 'none', zIndex: 0,
      }} />

      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 32, position: 'relative', zIndex: 1 }}
      >
        <div style={{
          width: 48, height: 48, borderRadius: 14,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          background: 'var(--c-accent-muted)', fontSize: 22,
        }}>
          <SettingOutlined style={{ color: 'var(--c-accent)' }} />
        </div>
        <div>
          <Title level={2} style={{
            color: 'var(--c-text-bright)', margin: 0,
            fontFamily: "'Outfit', sans-serif", fontWeight: 800,
            fontSize: 32, letterSpacing: -0.5,
          }}>
            Settings
          </Title>
          <Text style={{ color: 'var(--c-text-muted)', fontSize: 14 }}>
            Manage your account and preferences
          </Text>
        </div>
      </motion.div>

      <Tabs
        defaultActiveKey="profile"
        items={tabItems}
        style={{ position: 'relative', zIndex: 1 }}
        tabBarStyle={{ marginBottom: 24 }}
      />
    </div>
  );
};

export default SettingsPage;

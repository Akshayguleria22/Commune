import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Typography, Row, Col, Card, Space, Tag, Button, Avatar, Empty } from 'antd';
import {
  TeamOutlined, RocketOutlined, CalendarOutlined, PlusOutlined,
  ArrowRightOutlined, FireOutlined, TrophyOutlined,
} from '@ant-design/icons';
import { motion } from 'framer-motion';
import { useAuthStore } from '../../../stores/auth.store';
import { useCommunities } from '../hooks/useCommunities';
import { useNotifications } from '../../../shared/hooks/useNotifications';
import { DashboardSkeleton } from '../../../shared/components';

const { Title, Text } = Typography;

const StatCard: React.FC<{
  title: string;
  value: string | number;
  icon: React.ReactNode;
  color: string;
  trend?: string;
}> = ({ title, value, icon, color, trend }) => (
  <motion.div whileHover={{ y: -2 }} transition={{ duration: 0.2 }}>
    <Card
      style={{
        background: 'var(--c-bg-surface)',
        backdropFilter: 'blur(12px)',
        border: '1px solid var(--c-glass-border)',
        borderRadius: 12,
      }}
      styles={{ body: { padding: 20 } }}
    >
      <Space direction="vertical" size={8} style={{ width: '100%' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Text style={{ color: 'var(--c-text-muted)', fontSize: 13 }}>{title}</Text>
          <div
            style={{
              width: 36,
              height: 36,
              borderRadius: 8,
              background: `${color}15`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color,
              fontSize: 18,
            }}
          >
            {icon}
          </div>
        </div>
        <Title level={3} style={{ margin: 0, color: 'var(--c-text-bright)' }}>{value}</Title>
        {trend && <Text style={{ color: 'var(--c-success)', fontSize: 12 }}>{trend}</Text>}
      </Space>
    </Card>
  </motion.div>
);

const DashboardPage: React.FC = () => {
  const { user } = useAuthStore();
  const navigate = useNavigate();
  const { data: communitiesData, isLoading: communitiesLoading } = useCommunities();
  const { data: notificationsData } = useNotifications({ limit: 5 });

  const communities = Array.isArray(communitiesData?.items ?? communitiesData) ? (communitiesData?.items ?? communitiesData) : [];
  const notifications = Array.isArray(notificationsData?.items ?? notificationsData) ? (notificationsData?.items ?? notificationsData) : [];

  if (communitiesLoading) return <DashboardSkeleton />;

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.08 },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 10 },
    visible: { opacity: 1, y: 0 },
  };

  return (
    <motion.div variants={containerVariants} initial="hidden" animate="visible">
      {/* Header */}
      <motion.div variants={itemVariants} style={{ marginBottom: 24 }}>
        <Title level={3} style={{ color: 'var(--c-text-bright)', margin: 0 }}>
          Welcome back, {user?.displayName || 'Builder'} 👋
        </Title>
        <Text style={{ color: 'var(--c-text-dim)' }}>
          Here's what's happening across your communities
        </Text>
      </motion.div>

      {/* Stats Row */}
      <motion.div variants={itemVariants}>
        <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
          <Col xs={24} sm={12} lg={6}>
            <StatCard
              title="Communities"
              value={communities.length}
              icon={<TeamOutlined />}
              color="var(--c-accent)"
            />
          </Col>
          <Col xs={24} sm={12} lg={6}>
            <StatCard
              title="Notifications"
              value={notifications.length}
              icon={<RocketOutlined />}
              color="var(--c-success)"
            />
          </Col>
          <Col xs={24} sm={12} lg={6}>
            <StatCard
              title="Upcoming Events"
              value={0}
              icon={<CalendarOutlined />}
              color="var(--c-warning)"
            />
          </Col>
          <Col xs={24} sm={12} lg={6}>
            <StatCard
              title="Builder Score"
              value={0}
              icon={<TrophyOutlined />}
              color="var(--c-error)"
            />
          </Col>
        </Row>
      </motion.div>

      {/* Main Content Grid */}
      <Row gutter={[16, 16]}>
        {/* My Communities */}
        <Col xs={24} lg={16}>
          <motion.div variants={itemVariants}>
            <Card
              title={
                <Space>
                  <TeamOutlined style={{ color: 'var(--c-accent)' }} />
                  <span style={{ color: 'var(--c-text-bright)' }}>My Communities</span>
                </Space>
              }
              extra={
                <Button
                  type="primary"
                  size="small"
                  icon={<PlusOutlined />}
                  style={{
                    background: 'var(--c-accent)',
                    border: 'none',
                  }}
                >
                  New
                </Button>
              }
              style={{
                background: 'var(--c-bg-surface)',
                backdropFilter: 'blur(12px)',
                border: '1px solid var(--c-glass-border)',
                borderRadius: 12,
              }}
              styles={{ body: { padding: 0 } }}
            >
              {communities.length === 0 ? (
                <Empty description="No communities yet" style={{ padding: 40 }} />
              ) : (
                communities.slice(0, 5).map((community: any, i: number) => (
                <motion.div
                  key={community.id || i}
                  whileHover={{ backgroundColor: 'var(--c-accent-muted)' }}
                  style={{
                    padding: '16px 24px',
                    borderBottom: '1px solid var(--c-glass-border)',
                    cursor: 'pointer',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                  }}
                  onClick={() => navigate(`/dashboard/communities/${community.slug}`)}
                >
                  <Space size={12}>
                    <Avatar
                      src={community.avatarUrl}
                      style={{
                        background: 'var(--c-accent-muted)',
                        color: 'var(--c-accent)',
                        fontWeight: 600,
                      }}
                    >
                      {community.name?.[0]}
                    </Avatar>
                    <div>
                      <Text style={{ color: 'var(--c-text-bright)', fontWeight: 500, display: 'block' }}>
                        {community.name}
                      </Text>
                      <Text style={{ color: 'var(--c-text-dim)', fontSize: 12 }}>
                        {community.memberCount || 0} members
                      </Text>
                    </div>
                  </Space>
                  <Space>
                    {community.tags?.slice(0, 2).map((tag: string) => (
                      <Tag key={tag} color="purple" style={{ fontSize: 11 }}>{tag}</Tag>
                    ))}
                    <ArrowRightOutlined style={{ color: 'var(--c-text-dim)' }} />
                  </Space>
                </motion.div>
                ))
              )}
            </Card>
          </motion.div>
        </Col>

        {/* Activity Feed */}
        <Col xs={24} lg={8}>
          <motion.div variants={itemVariants}>
            <Card
              title={
                <Space>
                  <FireOutlined style={{ color: 'var(--c-error)' }} />
                  <span style={{ color: 'var(--c-text-bright)' }}>Recent Activity</span>
                </Space>
              }
              style={{
                background: 'var(--c-bg-surface)',
                backdropFilter: 'blur(12px)',
                border: '1px solid var(--c-glass-border)',
                borderRadius: 12,
              }}
            >
              <Space direction="vertical" size={16} style={{ width: '100%' }}>
                {notifications.length === 0 ? (
                  <Empty description="No recent activity" />
                ) : (
                  notifications.slice(0, 6).map((notif: any, i: number) => (
                  <div key={notif.id || i} style={{ display: 'flex', gap: 12 }}>
                    <div
                      style={{
                        width: 8,
                        height: 8,
                        borderRadius: '50%',
                        background:
                          notif.type === 'task' ? 'var(--c-success)'
                            : notif.type === 'community' ? 'var(--c-accent)'
                            : notif.type === 'event' ? 'var(--c-warning)'
                            : 'var(--c-info)',
                        marginTop: 6,
                        flexShrink: 0,
                      }}
                    />
                    <div>
                      <Text style={{ color: 'var(--c-text-base)', fontSize: 13, display: 'block' }}>
                        {notif.title}
                      </Text>
                      <Text style={{ color: 'var(--c-text-dim)', fontSize: 11 }}>
                        {notif.message || new Date(notif.createdAt).toLocaleDateString()}
                      </Text>
                    </div>
                  </div>
                  ))
                )}
              </Space>
            </Card>
          </motion.div>
        </Col>
      </Row>
    </motion.div>
  );
};

export default DashboardPage;

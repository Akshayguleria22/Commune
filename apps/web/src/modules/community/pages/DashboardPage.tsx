import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Typography, Row, Col, Card, Space, Tag, Button, Avatar, Empty, Progress, List } from 'antd';
import {
  RocketOutlined, CalendarOutlined,
  ArrowRightOutlined, FireOutlined, TrophyOutlined, CheckCircleOutlined,
  ClockCircleOutlined, CompassOutlined
} from '@ant-design/icons';
import { motion } from 'framer-motion';
import { useQuery } from '@tanstack/react-query';
import { useAuthStore } from '../../../stores/auth.store';
import { useCommunities } from '../hooks/useCommunities';
import { useNotifications } from '../../../shared/hooks/useNotifications';
import { DashboardSkeleton } from '../../../shared/components';
import { tasksApi } from '../../../api/tasks.api';
import { eventsApi } from '../../../api/events.api';

const { Title, Text, Paragraph } = Typography;

const StatCard: React.FC<{
  title: string;
  value: string | number;
  icon: React.ReactNode;
  color: string;
  subtitle?: React.ReactNode;
}> = ({ title, value, icon, color, subtitle }) => (
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
        {subtitle && <div style={{ marginTop: 4 }}>{subtitle}</div>}
      </Space>
    </Card>
  </motion.div>
);

const DashboardPage: React.FC = () => {
  const { user } = useAuthStore();
  const navigate = useNavigate();
  
  const { data: communitiesData, isLoading: communitiesLoading } = useCommunities();
  const { data: notificationsData } = useNotifications({ limit: 5 });
  
  const { data: apiTasks } = useQuery({
    queryKey: ['tasks', 'personal'],
    queryFn: () => tasksApi.listPersonal(),
  });

  const communities = Array.isArray(communitiesData?.items ?? communitiesData) ? (communitiesData?.items ?? communitiesData) : [];
  const notifications = Array.isArray(notificationsData?.items ?? notificationsData) ? (notificationsData?.items ?? notificationsData) : [];
  const tasks = Array.isArray(apiTasks?.items ?? apiTasks) ? (apiTasks?.items ?? apiTasks) : [];

  const { data: apiEvents } = useQuery({
    queryKey: ['events', 'public', communities.length],
    queryFn: async () => {
      const results = await Promise.allSettled(
        communities.map((c: any) => eventsApi.list(c.id))
      );
      return results
        .filter((r): r is PromiseFulfilledResult<any> => r.status === 'fulfilled')
        .flatMap((r) => (Array.isArray(r.value) ? r.value : r.value?.items ?? []))
        .sort((a: any, b: any) => new Date(a.startsAt).getTime() - new Date(b.startsAt).getTime());
    },
    enabled: communities.length > 0,
  });

  const events = Array.isArray((apiEvents as any)?.items ?? apiEvents) ? ((apiEvents as any)?.items ?? apiEvents) : [];

  if (communitiesLoading) return <DashboardSkeleton />;

  // Derived logic
  const tasksDueSoon = tasks.filter((t: any) => t.status !== 'done').slice(0, 3);
  const upcomingEvents = events.filter((e: any) => new Date(e.startsAt) > new Date()).slice(0, 2);
  const suggestedCommunities = communities.slice(0, 3); // Naive suggestion
  
  // Onboarding Checklist
  const onboardingSteps = [
    { key: 'profile', label: 'Complete Profile', done: !!user?.avatarUrl && !!user?.displayName },
    { key: 'community', label: 'Join a Community', done: communities.length > 0 },
    { key: 'task', label: 'Assign first task', done: tasks.length > 0 },
  ];
  const onboardingProgress = Math.round((onboardingSteps.filter(s => s.done).length / onboardingSteps.length) * 100);
  const isOnboarding = onboardingProgress < 100;

  const containerVariants = { hidden: { opacity: 0 }, visible: { opacity: 1, transition: { staggerChildren: 0.08 } } };
  const itemVariants = { hidden: { opacity: 0, y: 10 }, visible: { opacity: 1, y: 0 } };

  return (
    <motion.div variants={containerVariants} initial="hidden" animate="visible" style={{ paddingBottom: 40 }}>
      {/* Header */}
      <motion.div variants={itemVariants} style={{ marginBottom: 28 }}>
        <Title level={2} style={{ color: 'var(--c-text-bright)', margin: 0, fontFamily: "'Outfit', sans-serif", fontWeight: 800 }}>
          Command Center
        </Title>
        <Text style={{ color: 'var(--c-text-dim)', fontSize: 15 }}>
          Welcome back, {user?.displayName || 'Builder'}. Let's get things moving.
        </Text>
      </motion.div>

      {/* Onboarding Banner */}
      {isOnboarding && (
        <motion.div variants={itemVariants}>
          <Card 
            style={{ 
              marginBottom: 24, borderRadius: 16, background: 'linear-gradient(135deg, rgba(124,106,239,0.1) 0%, rgba(54,191,170,0.05) 100%)', 
              borderColor: 'var(--c-accent-muted)' 
            }}
          >
            <Row align="middle" justify="space-between">
              <Col xs={24} md={16}>
                <Title level={4} style={{ color: 'var(--c-text-bright)', margin: 0 }}>Getting Started with Commune</Title>
                <Paragraph style={{ color: 'var(--c-text-muted)', marginBottom: 16, marginTop: 4 }}>
                  Follow these steps to unlock the full potential of your community OS.
                </Paragraph>
                <Space size={24} wrap>
                  {onboardingSteps.map(step => (
                    <Space key={step.key}>
                      {step.done ? <CheckCircleOutlined style={{ color: 'var(--c-success)' }} /> : <div style={{ width: 14, height: 14, border: '2px solid var(--c-text-dim)', borderRadius: '50%' }} />}
                      <Text style={{ color: step.done ? 'var(--c-text-base)' : 'var(--c-text-dim)', textDecoration: step.done ? 'line-through' : 'none' }}>
                        {step.label}
                      </Text>
                    </Space>
                  ))}
                </Space>
              </Col>
              <Col xs={24} md={6} style={{ textAlign: 'center' }}>
                <Progress type="circle" percent={onboardingProgress} strokeColor="var(--c-accent)" trailColor="var(--c-glass-border)" />
              </Col>
            </Row>
          </Card>
        </motion.div>
      )}

      {/* Stats Row */}
      <motion.div variants={itemVariants}>
        <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
          <Col xs={24} sm={12} lg={6}>
            <StatCard
              title="Active Tasks"
              value={tasksDueSoon.length}
              icon={<RocketOutlined />}
              color="var(--c-accent)"
              subtitle={<Text style={{ color: 'var(--c-text-dim)', fontSize: 12 }}>Assigned across all spaces</Text>}
            />
          </Col>
          <Col xs={24} sm={12} lg={6}>
            <StatCard
              title="Notifications"
              value={notifications.length}
              icon={<FireOutlined />}
              color="var(--c-error)"
              subtitle={<Text style={{ color: 'var(--c-text-dim)', fontSize: 12 }}>Needs your attention</Text>}
            />
          </Col>
          <Col xs={24} sm={12} lg={6}>
            <StatCard
              title="Upcoming Events"
              value={upcomingEvents.length}
              icon={<CalendarOutlined />}
              color="var(--c-warning)"
              subtitle={<Text style={{ color: 'var(--c-text-dim)', fontSize: 12 }}>In the next 7 days</Text>}
            />
          </Col>
          <Col xs={24} sm={12} lg={6}>
            <StatCard
              title="Contribution Streak"
              value="3 Days"
              icon={<TrophyOutlined />}
              color="var(--c-success)"
              subtitle={<Text style={{ color: 'var(--c-text-dim)', fontSize: 12 }}>Keep it up!</Text>}
            />
          </Col>
        </Row>
      </motion.div>

      <Row gutter={[24, 24]}>
        {/* Left Column: Tasks & Events */}
        <Col xs={24} lg={16}>
          <Space direction="vertical" size={24} style={{ width: '100%' }}>
            {/* My Tasks */}
            <motion.div variants={itemVariants}>
              <Card
                title={<Space><RocketOutlined style={{ color: 'var(--c-accent)' }} /><span style={{ color: 'var(--c-text-bright)' }}>Action Items</span></Space>}
                extra={<Button type="link" onClick={() => navigate('/dashboard/tasks')}>View All</Button>}
                style={{ background: 'var(--c-bg-surface)', border: '1px solid var(--c-glass-border)', borderRadius: 12 }}
                styles={{ body: { padding: 0 } }}
              >
                {tasksDueSoon.length === 0 ? (
                  <Empty description="No tasks due" style={{ padding: 40 }} image={Empty.PRESENTED_IMAGE_SIMPLE}>
                    <Button type="primary" onClick={() => navigate('/dashboard/tasks')}>Go to Kanban</Button>
                  </Empty>
                ) : (
                  <List
                    dataSource={tasksDueSoon}
                    renderItem={(t: any) => (
                      <List.Item style={{ padding: '16px 24px', borderBottom: '1px solid var(--c-glass-border)', cursor: 'pointer' }} onClick={() => navigate('/dashboard/tasks')}>
                        <List.Item.Meta
                          title={<Text style={{ color: 'var(--c-text-bright)' }}>{t.title}</Text>}
                          description={<Tag color={t.priority === 'urgent' ? 'red' : 'blue'}>{t.priority}</Tag>}
                        />
                        <Space>
                          {t.dueDate && <Text style={{ color: 'var(--c-text-dim)', fontSize: 12 }}><ClockCircleOutlined /> {new Date(t.dueDate).toLocaleDateString()}</Text>}
                        </Space>
                      </List.Item>
                    )}
                  />
                )}
              </Card>
            </motion.div>

            {/* Suggested Communities */}
            <motion.div variants={itemVariants}>
              <Card
                title={<Space><CompassOutlined style={{ color: 'var(--c-info)' }} /><span style={{ color: 'var(--c-text-bright)' }}>Suggested Communities</span></Space>}
                extra={<Button type="link" onClick={() => navigate('/dashboard/discover')}>Explore</Button>}
                style={{ background: 'var(--c-bg-surface)', border: '1px solid var(--c-glass-border)', borderRadius: 12 }}
                styles={{ body: { padding: 0 } }}
              >
                {suggestedCommunities.length === 0 ? (
                  <Empty description="No suggestions right now" style={{ padding: 40 }} />
                ) : (
                  suggestedCommunities.map((c: any) => (
                    <motion.div key={c.id} whileHover={{ backgroundColor: 'var(--c-accent-muted)' }} style={{ padding: '16px 24px', borderBottom: '1px solid var(--c-glass-border)', cursor: 'pointer', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }} onClick={() => navigate(`/dashboard/communities/${c.slug}`)}>
                      <Space size={12}>
                        <Avatar src={c.avatarUrl} style={{ background: 'var(--c-accent)', fontWeight: 600 }}>{c.name?.[0]}</Avatar>
                        <div>
                          <Text style={{ color: 'var(--c-text-bright)', fontWeight: 500, display: 'block' }}>{c.name}</Text>
                          <Text style={{ color: 'var(--c-text-dim)', fontSize: 12 }}>{c.memberCount || 0} members</Text>
                        </div>
                      </Space>
                      <ArrowRightOutlined style={{ color: 'var(--c-text-dim)' }} />
                    </motion.div>
                  ))
                )}
              </Card>
            </motion.div>
          </Space>
        </Col>

        {/* Right Column: Activity */}
        <Col xs={24} lg={8}>
          <Space direction="vertical" size={24} style={{ width: '100%' }}>
            {/* Notifications */}
            <motion.div variants={itemVariants}>
              <Card
                title={<Space><FireOutlined style={{ color: 'var(--c-error)' }} /><span style={{ color: 'var(--c-text-bright)' }}>Recent Activity</span></Space>}
                style={{ background: 'var(--c-bg-surface)', border: '1px solid var(--c-glass-border)', borderRadius: 12 }}
              >
                {notifications.length === 0 ? (
                  <Empty description="No recent activity" image={Empty.PRESENTED_IMAGE_SIMPLE} />
                ) : (
                  <Space direction="vertical" size={16} style={{ width: '100%' }}>
                    {notifications.slice(0, 5).map((notif: any, i: number) => (
                      <div key={notif.id || i} style={{ display: 'flex', gap: 12 }}>
                        <div style={{ width: 8, height: 8, borderRadius: '50%', background: notif.type === 'task' ? 'var(--c-success)' : 'var(--c-accent)', marginTop: 6, flexShrink: 0 }} />
                        <div>
                          <Text style={{ color: 'var(--c-text-base)', fontSize: 13, display: 'block' }}>{notif.title}</Text>
                          <Text style={{ color: 'var(--c-text-dim)', fontSize: 11 }}>{notif.message}</Text>
                        </div>
                      </div>
                    ))}
                  </Space>
                )}
              </Card>
            </motion.div>
          </Space>
        </Col>
      </Row>
    </motion.div>
  );
};

export default DashboardPage;

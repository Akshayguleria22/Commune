import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Typography, Tabs, Avatar, Button, Tag, Space, Row, Col, Card, Input, Spin, Empty } from 'antd';
import {
  TeamOutlined, ProjectOutlined, CalendarOutlined, MessageOutlined,
  SettingOutlined, UserAddOutlined, StarOutlined, CloseOutlined, SendOutlined
} from '@ant-design/icons';
import { motion } from 'framer-motion';
import { ContributionHeatmap, StatCard } from '../../../shared/components';
import { useCommunity, useCommunityMembers, useCommunityContributions, useJoinCommunity, useLeaveCommunity } from '../hooks/useCommunities';
import { useEvents } from '../../event/hooks/useEvents';
import { EventCard } from '../../../shared/components';

const { Title, Text, Paragraph } = Typography;

const CommunityDetailPage: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const [isChatOpen, setIsChatOpen] = useState(false);

  const { data: community, isLoading } = useCommunity(slug ?? '');
  const { data: membersData } = useCommunityMembers(community?.id ?? '');
  const { data: contribsData } = useCommunityContributions(community?.id ?? '');
  const { data: eventsData } = useEvents(community?.id ?? '');
  const joinMut = useJoinCommunity();
  const leaveMut = useLeaveCommunity();

  const members: any[] = Array.isArray(membersData) ? membersData : (membersData as any)?.items ?? [];
  const contributions: any[] = Array.isArray(contribsData) ? contribsData : [];
  const events: any[] = Array.isArray(eventsData) ? eventsData : (eventsData as any)?.items ?? [];

  if (isLoading) return <div style={{ textAlign: 'center', padding: 80 }}><Spin size="large" /></div>;
  if (!community) return <Empty description="Community not found" style={{ marginTop: 80 }} />;

  return (
    <div style={{ position: 'relative' }}>
      {/* Banner */}
      <motion.div
        layoutId={`community-banner-${community.slug}`}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ type: 'spring', stiffness: 300, damping: 30 }}
        style={{
          height: 280,
          borderRadius: 16,
          background: community.coverUrl
            ? `url(${community.coverUrl}) center/cover no-repeat`
            : 'linear-gradient(135deg, rgba(124,106,239,0.25) 0%, rgba(124,106,239,0.06) 100%)',
          position: 'relative',
          marginBottom: -80,
          overflow: 'hidden',
          boxShadow: '0 12px 32px rgba(0,0,0,0.3)'
        }}
      >
        <div
          style={{
            position: 'absolute',
            inset: 0,
            background: 'linear-gradient(to bottom, rgba(10,10,26,0.2) 0%, rgba(10,10,26,1) 100%)',
          }}
        />
      </motion.div>

      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        style={{
          padding: '0 24px 24px',
          position: 'relative',
          zIndex: 1,
        }}
      >
        <div style={{ display: 'flex', gap: 20, alignItems: 'flex-end' }}>
          <Avatar
            size={80}
            style={{
              background: 'var(--c-accent)',
              border: '4px solid var(--c-bg-void)',
              fontSize: 32,
              fontWeight: 700,
              fontFamily: "'Outfit', sans-serif",
            }}
          >
            {community.name[0]}
          </Avatar>

          <div style={{ flex: 1 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
              <Title level={2} style={{ color: 'var(--c-text-bright)', margin: 0, fontFamily: "'Outfit', sans-serif" }}>
                {community.name}
              </Title>
              {community.role && (
                <Tag color="purple" style={{ fontSize: 12 }}>{community.role}</Tag>
              )}
            </div>
            <Space size={16} style={{ marginTop: 8 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <Avatar.Group size={28} max={{ count: 3 }} style={{ display: 'flex' }}>
                  {members.slice(0, 3).map((m: any, i: number) => (
                    <Avatar key={m.id ?? i} src={m.user?.avatarUrl ?? m.avatarUrl} style={{ background: ['#00b894', '#0984e3', '#d63031'][i % 3] }}>
                      {(m.user?.displayName ?? m.displayName ?? 'U')[0]}
                    </Avatar>
                  ))}
                </Avatar.Group>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <motion.div 
                    animate={{ scale: [1, 1.2, 1], opacity: [0.6, 1, 0.6] }} 
                    transition={{ duration: 2, repeat: Infinity }}
                    style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--c-success)', boxShadow: '0 0 10px rgba(16,185,129,0.5)' }} 
                  />
                  <Text style={{ color: 'var(--c-text-bright)', fontWeight: 500, fontSize: 13 }}>3 online right now</Text>
                </div>
              </div>
              <div style={{ width: 1, height: 16, background: 'rgba(255,255,255,0.1)' }} />
              <Text style={{ color: 'var(--c-text-muted)', fontSize: 13 }}>
                {(community.memberCount ?? members.length).toLocaleString()} members
              </Text>
            </Space>
          </div>

          <Space>
            {community.role ? (
              <>
                <Button
                  icon={<SettingOutlined />}
                  style={{ background: 'var(--c-bg-hover)', borderColor: 'var(--c-glass-border)', color: 'var(--c-text-muted)' }}
                >
                  Settings
                </Button>
                <Button
                  danger
                  onClick={() => leaveMut.mutate(community.id)}
                  loading={leaveMut.isPending}
                  style={{ borderRadius: 12 }}
                >
                  Leave
                </Button>
              </>
            ) : (
              <Button
                type="primary"
                icon={<UserAddOutlined />}
                onClick={() => joinMut.mutate(community.id)}
                loading={joinMut.isPending}
                style={{
                  background: 'var(--c-accent)',
                  border: 'none',
                  fontWeight: 600,
                }}
              >
                Join Community
              </Button>
            )}
          </Space>
        </div>

        {/* Description + Tags */}
        <div style={{ marginTop: 16, maxWidth: 700 }}>
          <Paragraph style={{ color: 'var(--c-text-muted)', fontSize: 14, lineHeight: 1.7 }}>
            {community.description}
          </Paragraph>
          <Space size={6}>
            {(community.tags ?? []).map((tag: string) => (
              <Tag
                key={tag}
                style={{
                  background: 'var(--c-accent-muted)',
                  borderColor: 'rgba(124,106,239,0.2)',
                  color: '#bbaaf9',
                  borderRadius: 6,
                }}
              >
                {tag}
              </Tag>
            ))}
          </Space>
        </div>
      </motion.div>

      {/* Tabs */}
      <Tabs
        defaultActiveKey="overview"
        style={{ marginTop: 8 }}
        items={[
          {
            key: 'overview',
            label: <span><StarOutlined /> Overview</span>,
            children: (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                <Row gutter={[16, 16]}>
                  <Col xs={24} sm={8}>
                    <StatCard title="Members" value={community.memberCount ?? members.length} icon={<TeamOutlined />} color="var(--c-accent)" />
                  </Col>
                  <Col xs={24} sm={8}>
                    <StatCard title="Events" value={events.length} icon={<CalendarOutlined />} color="#fdcb6e" />
                  </Col>
                  <Col xs={24} sm={8}>
                    <StatCard title="Contributions" value={contributions.length} icon={<ProjectOutlined />} color="#74b9ff" />
                  </Col>
                </Row>

                {contributions.length > 0 && (
                <Card
                  title={<span style={{ color: 'var(--c-text-bright)' }}>Contribution Activity</span>}
                  style={{ background: 'var(--c-bg-surface)', border: '1px solid var(--c-glass-border)', borderRadius: 12, marginTop: 20 }}
                  styles={{ body: { padding: '16px 20px' } }}
                >
                  <ContributionHeatmap data={contributions} weeks={26} />
                </Card>
                )}
              </motion.div>
            ),
          },
          {
            key: 'tasks',
            label: <span><ProjectOutlined /> Tasks</span>,
            children: (
              <div style={{ textAlign: 'center', padding: 60, color: 'var(--c-text-dim)' }}>
                <ProjectOutlined style={{ fontSize: 40, marginBottom: 16, display: 'block' }} />
                Kanban board — navigate to <a onClick={() => navigate(`/dashboard/communities/${slug}/tasks`)} style={{ color: 'var(--c-accent-soft)' }}>full board view</a>
              </div>
            ),
          },
          {
            key: 'events',
            label: <span><CalendarOutlined /> Events ({events.length})</span>,
            children: events.length === 0 ? (
              <div style={{ textAlign: 'center', padding: 60, color: 'var(--c-text-dim)' }}>
                <CalendarOutlined style={{ fontSize: 40, marginBottom: 16, display: 'block' }} />
                No events yet
              </div>
            ) : (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={{ display: 'flex', flexDirection: 'column', gap: 16, maxWidth: 800 }}>
                {events.map((e: any) => (
                  <EventCard
                    key={e.id}
                    title={e.title}
                    description={e.description}
                    type={e.type ?? 'online'}
                    status={e.status ?? 'published'}
                    startsAt={e.startsAt}
                    endsAt={e.endsAt}
                    rsvpCount={e.rsvpCount ?? 0}
                    maxAttendees={e.maxAttendees}
                    tags={e.tags ?? []}
                    organizer={e.organizer}
                  />
                ))}
              </motion.div>
            ),
          },
          {
            key: 'members',
            label: <span><TeamOutlined /> Members ({community.memberCount ?? members.length})</span>,
            children: (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                {members.length === 0 ? (
                  <Empty description={<Text style={{ color: 'var(--c-text-dim)' }}>No members yet</Text>} />
                ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  {members.map((member: any) => {
                    const user = member.user ?? member;
                    const displayName = user.displayName ?? 'Unknown';
                    const username = user.username ?? '?';
                    const role = member.role ?? 'Member';
                    return (
                    <div
                      key={member.id ?? user.id}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        padding: '12px 16px',
                        background: 'var(--c-bg-surface)',
                        borderRadius: 10,
                        border: '1px solid var(--c-glass-border)',
                        cursor: 'pointer',
                      }}
                      onClick={() => navigate(`/dashboard/portfolio/${username}`)}
                    >
                      <Space size={12}>
                        <Avatar
                          size={40}
                          src={user.avatarUrl}
                          style={{ background: 'var(--c-accent)', fontWeight: 600 }}
                        >
                          {displayName[0]}
                        </Avatar>
                        <div>
                          <Text style={{ color: 'var(--c-text-bright)', fontWeight: 500, display: 'block' }}>
                            {displayName}
                          </Text>
                          <Text style={{ color: 'var(--c-text-dim)', fontSize: 12 }}>
                            @{username}
                          </Text>
                        </div>
                      </Space>
                      <Tag
                        color={
                          role === 'Owner' || role === 'owner' ? 'purple'
                            : role === 'Moderator' || role === 'moderator' ? 'blue'
                            : 'default'
                        }
                      >
                        {role}
                      </Tag>
                    </div>
                    );
                  })}
                </div>
                )}
              </motion.div>
            ),
          },
        ]}
      />

      {/* Contextual Messaging Overlay */}
      <motion.div
        initial={false}
        animate={{ 
          y: isChatOpen ? 0 : 20,
          opacity: isChatOpen ? 1 : 0,
          scale: isChatOpen ? 1 : 0.95,
          pointerEvents: isChatOpen ? 'auto' : 'none'
        }}
        transition={{ type: 'spring', stiffness: 300, damping: 25 }}
        className="glass-panel"
        style={{
          position: 'fixed',
          bottom: 104,
          right: 32,
          width: 380,
          height: 500,
          zIndex: 1000,
          display: 'flex',
          flexDirection: 'column',
          boxShadow: '0 24px 64px rgba(0,0,0,0.6)',
        }}
      >
        <div style={{ padding: '16px 20px', borderBottom: '1px solid rgba(255,255,255,0.05)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'rgba(255,255,255,0.02)' }}>
          <Space>
            <div style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--c-success)', boxShadow: '0 0 10px rgba(16,185,129,0.5)' }} />
            <Text style={{ color: 'var(--c-text-bright)', fontWeight: 600, fontFamily: "'Outfit', sans-serif" }}>Community Hive</Text>
          </Space>
          <Button type="text" size="small" style={{ color: '#A1A1AA' }} onClick={() => setIsChatOpen(false)}>
            <CloseOutlined />
          </Button>
        </div>
        <div style={{ flex: 1, padding: 20, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div style={{ display: 'flex', gap: 12, alignItems: 'flex-start' }}>
            <Avatar size={36} style={{ background: 'var(--c-accent)', flexShrink: 0 }}>A</Avatar>
            <div style={{ background: 'rgba(255,255,255,0.05)', padding: '12px 16px', borderRadius: '0 16px 16px 16px', maxWidth: '80%' }}>
              <Text style={{ color: 'var(--c-text-base)', fontSize: 13, lineHeight: 1.5 }}>Hey all! The new RAG pipeline is up. Could someone review the benchmark scores?</Text>
            </div>
          </div>
          <div style={{ display: 'flex', gap: 12, alignSelf: 'flex-end', flexDirection: 'row-reverse', alignItems: 'flex-start' }}>
            <Avatar size={36} style={{ background: '#00b894', flexShrink: 0 }}>U</Avatar>
            <div style={{ background: 'linear-gradient(135deg, rgba(124,106,239,0.2) 0%, rgba(124,106,239,0.4) 100%)', padding: '12px 16px', borderRadius: '16px 0 16px 16px', border: '1px solid rgba(124,106,239,0.3)', maxWidth: '80%' }}>
              <Text style={{ color: 'var(--c-text-bright)', fontSize: 13, lineHeight: 1.5 }}>Awesome, I am looking at it right now. Looks incredibly fast! ⚡</Text>
            </div>
          </div>
        </div>
        <div style={{ padding: '16px 20px', borderTop: '1px solid rgba(255,255,255,0.05)', background: 'rgba(0,0,0,0.2)' }}>
          <Input 
            placeholder="Type a message..." 
            suffix={
              <Button 
                type="primary" 
                shape="circle" 
                icon={<SendOutlined style={{ fontSize: 13 }} />} 
                style={{
                  background: 'var(--c-accent)',
                  border: 'none',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  boxShadow: '0 4px 12px rgba(124,106,239,0.3)',
                  height: 32, width: 32
                }} 
              />
            }
            style={{ 
              borderRadius: 16, 
              background: 'rgba(255,255,255,0.05)', 
              border: '1px solid rgba(255,255,255,0.1)', 
              height: 48, 
              color: 'var(--c-text-bright)',
              paddingRight: 6,
              fontSize: 14
            }} 
          />
        </div>
      </motion.div>

      {/* Floating Chat Toggle (Magnetic Interaction) */}
      <motion.div
        className="magnetic-btn"
        whileHover={{ scale: 1.05 }}
        style={{ position: 'fixed', bottom: 32, right: 32, zIndex: 999 }}
      >
        <Button
          type="primary"
          shape="circle"
          size="large"
          icon={<MessageOutlined style={{ fontSize: 24 }} />}
          onClick={() => setIsChatOpen(!isChatOpen)}
          style={{
            width: 60, height: 60,
            background: 'var(--c-accent)',
            border: 'none',
            boxShadow: '0 8px 32px rgba(124,106,239,0.5)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        />
      </motion.div>
    </div>
  );
};

export default CommunityDetailPage;

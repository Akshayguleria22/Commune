import React from 'react';
import { Tag, Space, Avatar, Typography } from 'antd';
import { CalendarOutlined, EnvironmentOutlined, VideoCameraOutlined, UserOutlined, DeleteOutlined } from '@ant-design/icons';
import { motion } from 'framer-motion';
import dayjs from 'dayjs';

const { Text } = Typography;

interface EventCardProps {
  title: string;
  description: string | null;
  type: 'online' | 'offline' | 'hybrid';
  status: string;
  startsAt: string;
  endsAt: string;
  rsvpCount: number;
  maxAttendees: number | null;
  tags: string[];
  organizer?: { displayName: string; avatarUrl: string | null };
  onClick?: () => void;
  onDelete?: () => void;
}

const typeConfig = {
  online: { color: '#60A5FA', icon: <VideoCameraOutlined />, label: 'Online' },
  offline: { color: '#34D399', icon: <EnvironmentOutlined />, label: 'In Person' },
  hybrid: { color: '#FCD34D', icon: <VideoCameraOutlined />, label: 'Hybrid' },
};

const EventCard: React.FC<EventCardProps> = ({
  title, description, type, status: _status, startsAt, endsAt,
  rsvpCount, maxAttendees, tags: _tags, organizer, onClick, onDelete
}) => {
  const tc = typeConfig[type] || typeConfig.online;
  const startDate = dayjs(startsAt);
  const endDate = dayjs(endsAt);

  return (
    <motion.div
      whileHover={{ y: -2 }}
      transition={{ type: 'spring', stiffness: 400, damping: 25 }}
      onClick={onClick}
      style={{ cursor: onClick ? 'pointer' : 'default' }}
    >
      <div style={{
        background: 'var(--c-bg-surface)',
        border: '1px solid var(--c-glass-border)',
        borderRadius: 14,
        padding: 20,
        position: 'relative',
        overflow: 'hidden',
        transition: 'border-color 0.2s',
      }}
        onMouseEnter={(e) => { e.currentTarget.style.borderColor = `${tc.color}30`; }}
        onMouseLeave={(e) => { e.currentTarget.style.borderColor = 'var(--c-glass-border)'; }}
      >
        {/* Left accent bar */}
        <div style={{
          position: 'absolute', top: 0, left: 0, width: 3, height: '100%',
          background: tc.color, opacity: 0.5, borderRadius: '14px 0 0 14px',
        }} />

        <div style={{ display: 'flex', gap: 16 }}>
          {/* Date block */}
          <div style={{
            minWidth: 54, textAlign: 'center',
            background: 'var(--c-glass-highlight)', borderRadius: 10,
            padding: '10px 8px', flexShrink: 0,
            border: '1px solid var(--c-glass-border)',
          }}>
            <div style={{ fontSize: 10, color: 'var(--c-accent-soft)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: 1 }}>
              {startDate.format('MMM')}
            </div>
            <div style={{ fontSize: 24, fontWeight: 800, color: 'var(--c-text-bright)', fontFamily: "'Outfit', sans-serif", lineHeight: 1.1 }}>
              {startDate.format('DD')}
            </div>
            <div style={{ fontSize: 10, color: 'var(--c-text-dim)', fontWeight: 500 }}>
              {startDate.format('ddd')}
            </div>
          </div>

          {/* Content */}
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
              <Text style={{
                color: 'var(--c-text-bright)', fontSize: 15, fontWeight: 700,
                overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                fontFamily: "'Outfit', sans-serif",
              }}>
                {title}
              </Text>
              <Tag style={{
                background: `${tc.color}14`, borderColor: `${tc.color}20`,
                color: tc.color, fontSize: 10, margin: 0,
                borderRadius: 5, flexShrink: 0, fontWeight: 600,
                padding: '1px 8px',
              }}>
                {tc.icon} {tc.label}
              </Tag>
            </div>

            {description && (
              <Text style={{
                color: 'var(--c-text-muted)', fontSize: 13, display: 'block',
                marginBottom: 10, overflow: 'hidden',
                textOverflow: 'ellipsis', whiteSpace: 'nowrap', lineHeight: 1.5,
              }}>
                {description}
              </Text>
            )}

            <div style={{ display: 'flex', alignItems: 'center', gap: 14, flexWrap: 'wrap' }}>
              <Space size={4}>
                <CalendarOutlined style={{ color: 'var(--c-text-dim)', fontSize: 11 }} />
                <Text style={{ color: 'var(--c-text-dim)', fontSize: 12, fontWeight: 500 }}>
                  {startDate.format('h:mm A')} – {endDate.format('h:mm A')}
                </Text>
              </Space>

              <Space size={4}>
                <UserOutlined style={{ color: 'var(--c-text-dim)', fontSize: 11 }} />
                <Text style={{ color: 'var(--c-text-dim)', fontSize: 12, fontWeight: 500 }}>
                  {rsvpCount}{maxAttendees ? ` / ${maxAttendees}` : ''} attending
                </Text>
              </Space>

              {organizer && (
                <Space size={5}>
                  <Avatar src={organizer.avatarUrl} size={18} style={{ background: 'var(--c-accent)', fontSize: 9, fontWeight: 700 }}>
                    {organizer.displayName[0]}
                  </Avatar>
                  <Text style={{ color: 'var(--c-text-muted)', fontSize: 12, fontWeight: 500 }}>
                    {organizer.displayName}
                  </Text>
                </Space>
              )}

              {onDelete && (
                <div style={{ marginLeft: 'auto' }}>
                  <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
                    <DeleteOutlined 
                      style={{ color: 'var(--c-error, #ef4444)', fontSize: 16, cursor: 'pointer', padding: 4 }} 
                      onClick={(e) => { e.stopPropagation(); onDelete(); }}
                    />
                  </motion.div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default EventCard;

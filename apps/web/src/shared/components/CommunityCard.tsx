import React from 'react';
import { Tag, Space, Avatar, Typography } from 'antd';
import { TeamOutlined, LockOutlined } from '@ant-design/icons';
import { motion } from 'framer-motion';

const { Text } = Typography;

interface CommunityCardProps {
  name: string;
  slug?: string;
  description: string | null;
  avatarUrl: string | null;
  memberCount: number;
  tags: string[];
  visibility: string;
  role?: string;
  coverUrl?: string;
  onClick?: () => void;
}

const CommunityCard: React.FC<CommunityCardProps> = ({
  name, slug, description, avatarUrl, memberCount,
  tags, visibility, role, coverUrl, onClick,
}) => {
  const initial = name.charAt(0).toUpperCase();
  const palette = ['#7C6AEF', '#34D399', '#FCD34D', '#FB7185', '#60A5FA', '#9B8AFB'];
  const color = palette[name.length % palette.length];

  return (
    <motion.div
      layoutId={slug ? `community-${slug}` : undefined}
      whileHover={{ y: -4 }}
      transition={{ type: 'spring', stiffness: 400, damping: 25 }}
      onClick={onClick}
      style={{ cursor: 'pointer' }}
    >
      <div
        style={{
          background: 'var(--c-bg-surface)',
          border: '1px solid var(--c-glass-border)',
          borderRadius: 16,
          overflow: 'hidden',
          transition: 'border-color 0.2s, box-shadow 0.2s',
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.borderColor = `${color}30`;
          e.currentTarget.style.boxShadow = `0 8px 24px ${color}10`;
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.borderColor = 'var(--c-glass-border)';
          e.currentTarget.style.boxShadow = 'none';
        }}
      >
        {/* Banner */}
        <div style={{
          height: 100,
          background: coverUrl
            ? `url(${coverUrl}) center/cover no-repeat`
            : `linear-gradient(135deg, ${color}18, ${color}06)`,
          position: 'relative',
        }}>
          {coverUrl && <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to bottom, transparent 40%, var(--c-bg-surface))' }} />}
          {visibility === 'private' && (
            <div style={{
              position: 'absolute', top: 8, right: 8,
              background: 'rgba(0,0,0,0.5)', borderRadius: 6,
              padding: '2px 8px', display: 'flex', alignItems: 'center', gap: 4,
            }}>
              <LockOutlined style={{ color: '#8E8EA0', fontSize: 10 }} />
              <span style={{ color: '#8E8EA0', fontSize: 10, fontWeight: 500 }}>Private</span>
            </div>
          )}
          {visibility === 'invite_only' && (
            <div style={{
              position: 'absolute', top: 8, right: 8,
              background: 'rgba(0,0,0,0.5)', borderRadius: 6,
              padding: '2px 8px', display: 'flex', alignItems: 'center', gap: 4,
            }}>
              <LockOutlined style={{ color: '#FCD34D', fontSize: 10 }} />
              <span style={{ color: '#FCD34D', fontSize: 10, fontWeight: 500 }}>Invite Only</span>
            </div>
          )}
        </div>

        {/* Content */}
        <div style={{ padding: '0 18px 20px', marginTop: -26 }}>
          <Avatar
            src={avatarUrl}
            size={52}
            style={{
              background: `linear-gradient(135deg, ${color}, ${color}88)`,
              border: '3px solid var(--c-bg-surface)',
              fontSize: 20, fontWeight: 800,
              fontFamily: "'Outfit', sans-serif",
            }}
          >
            {initial}
          </Avatar>

          <div style={{ marginTop: 12 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <Text style={{
                color: 'var(--c-text-bright)', fontSize: 15,
                fontWeight: 700, fontFamily: "'Outfit', sans-serif",
              }}>
                {name}
              </Text>
              {role && (
                <Tag
                  color={role === 'Owner' ? 'purple' : role === 'Moderator' ? 'blue' : 'default'}
                  style={{ fontSize: 10, borderRadius: 5, fontWeight: 600, margin: 0 }}
                >
                  {role}
                </Tag>
              )}
            </div>

            <Text style={{
              color: 'var(--c-text-muted)', fontSize: 13,
              marginTop: 4, lineHeight: 1.5,
              overflow: 'hidden', textOverflow: 'ellipsis',
              WebkitLineClamp: 2, WebkitBoxOrient: 'vertical',
              display: '-webkit-box' as any,
              minHeight: 38,
            }}>
              {description || 'No description yet'}
            </Text>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 14 }}>
              <Space size={5}>
                <TeamOutlined style={{ color: 'var(--c-text-dim)', fontSize: 12 }} />
                <Text style={{ color: 'var(--c-text-dim)', fontSize: 12, fontWeight: 500 }}>
                  {memberCount.toLocaleString()}
                </Text>
              </Space>
              <Space size={4} wrap style={{ maxWidth: '60%', justifyContent: 'flex-end' }}>
                {tags.slice(0, 2).map((tag) => (
                  <Tag key={tag} style={{
                    margin: 0, background: 'var(--c-accent-muted)',
                    borderColor: 'transparent', color: 'var(--c-accent-soft)',
                    fontSize: 11, borderRadius: 5, fontWeight: 500,
                  }}>
                    {tag}
                  </Tag>
                ))}
              </Space>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default CommunityCard;

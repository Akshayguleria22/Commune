import React from 'react';
import { Typography } from 'antd';
import { motion } from 'framer-motion';

const { Text } = Typography;

interface StatCardProps {
  title: string;
  value: string | number;
  icon: React.ReactNode;
  color: string;
  trend?: string;
  suffix?: string;
}

const StatCard: React.FC<StatCardProps> = ({ title, value, icon, color, trend, suffix }) => (
  <motion.div
    whileHover={{ y: -3 }}
    transition={{ type: 'spring', stiffness: 400, damping: 25 }}
  >
    <div style={{
      background: 'var(--c-bg-surface)',
      border: '1px solid var(--c-glass-border)',
      borderRadius: 14,
      padding: '20px 22px',
      position: 'relative',
      overflow: 'hidden',
      transition: 'border-color 0.2s',
    }}>
      {/* Top accent line */}
      <div style={{
        position: 'absolute', top: 0, left: 0, right: 0, height: 2,
        background: `linear-gradient(90deg, ${color}, transparent)`,
        opacity: 0.5,
      }} />

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
        <Text style={{ color: 'var(--c-text-muted)', fontSize: 13, fontWeight: 600, letterSpacing: 0.3 }}>{title}</Text>
        <div style={{
          width: 38, height: 38, borderRadius: 10,
          background: `${color}10`, border: `1px solid ${color}18`,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          color, fontSize: 18,
        }}>
          {icon}
        </div>
      </div>

      <div style={{ display: 'flex', alignItems: 'baseline', gap: 4 }}>
        <span style={{
          fontSize: 30, fontWeight: 800,
          fontFamily: "'Outfit', sans-serif",
          color: 'var(--c-text-bright)', lineHeight: 1, letterSpacing: -0.5,
        }}>
          {value}
        </span>
        {suffix && <span style={{ fontSize: 13, color: 'var(--c-text-dim)', fontWeight: 500 }}>{suffix}</span>}
      </div>

      {trend && (
        <Text style={{ color: 'var(--c-success)', fontSize: 12, fontWeight: 600, display: 'block', marginTop: 6 }}>
          {trend}
        </Text>
      )}
    </div>
  </motion.div>
);

export default StatCard;

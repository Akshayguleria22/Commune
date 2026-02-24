import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button, Space, Typography } from 'antd';
import {
  TeamOutlined, ThunderboltOutlined,
  CalendarOutlined, SafetyCertificateOutlined, ArrowRightOutlined,
  GithubOutlined,
} from '@ant-design/icons';
import { motion } from 'framer-motion';
import { useAuthStore } from '../stores/auth.store';

const { Title, Text } = Typography;

const stats = [
  { label: 'Active Communities', value: '50+' },
  { label: 'Members', value: '3,200+' },
  { label: 'Tasks Completed', value: '12K+' },
  { label: 'Events Hosted', value: '800+' },
];

const features = [
  { icon: <TeamOutlined />, title: 'Micro-Communities', desc: 'Build and join tight-knit communities around specific technologies, projects, or interests.', color: 'var(--c-accent)' },
  { icon: <ThunderboltOutlined />, title: 'Collaborative Tasks', desc: 'Kanban boards with drag-and-drop. Assign, track, and ship work together in real-time.', color: 'var(--c-accent-2)' },
  { icon: <CalendarOutlined />, title: 'Events & Workshops', desc: 'Host online workshops, hackathons, and meetups. RSVP tracking and video integration.', color: 'var(--c-warning)' },
  { icon: <SafetyCertificateOutlined />, title: 'Reputation System', desc: 'Earn reputation through contributions. Showcase your skills with a dynamic portfolio.', color: 'var(--c-success)' },
];

const fadeUp = { hidden: { opacity: 0, y: 16 }, visible: { opacity: 1, y: 0 } };
const stagger = { hidden: { opacity: 0 }, visible: { opacity: 1, transition: { staggerChildren: 0.08 } } };

const LandingPage: React.FC = () => {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuthStore();

  const primaryBtn = {
    background: 'var(--c-accent)', border: 'none', borderRadius: 12,
    fontWeight: 700, boxShadow: '0 4px 16px rgba(124,106,239,0.25)',
  };

  return (
    <div style={{ minHeight: '100vh', background: 'var(--c-bg-void)', position: 'relative' }}>
      {/* Static ambient gradients */}
      <div style={{
        position: 'fixed', inset: 0, pointerEvents: 'none', zIndex: 0,
        background: 'radial-gradient(ellipse 70% 50% at 15% 5%, rgba(124,106,239,0.06) 0%, transparent 60%), radial-gradient(ellipse 50% 40% at 85% 90%, rgba(54,191,170,0.04) 0%, transparent 60%)',
      }} />

      {/* Header */}
      <header style={{
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        padding: '16px 40px', position: 'sticky', top: 0, zIndex: 50,
        background: 'rgba(14,14,22,0.8)', backdropFilter: 'blur(16px)',
        borderBottom: '1px solid var(--c-glass-border)',
      }}>
        <span style={{
          fontFamily: "'Outfit', sans-serif", fontWeight: 800, fontSize: 20,
          color: 'var(--c-text-bright)', letterSpacing: 3,
        }}>COMMUNE</span>
        <Space size={12}>
          {isAuthenticated ? (
            <Button type="primary" onClick={() => navigate('/dashboard')}
              style={{ ...primaryBtn, height: 40, padding: '0 24px' }}>
              Dashboard <ArrowRightOutlined />
            </Button>
          ) : (
            <>
              <Button onClick={() => navigate('/login')}
                style={{ borderRadius: 10, height: 40, fontWeight: 600, background: 'transparent', borderColor: 'var(--c-glass-border)', color: 'var(--c-text-bright)' }}>
                Sign In
              </Button>
              <Button type="primary" onClick={() => navigate('/login')}
                style={{ ...primaryBtn, height: 40, padding: '0 24px' }}>
                Get Started <ArrowRightOutlined />
              </Button>
            </>
          )}
        </Space>
      </header>

      {/* Hero */}
      <section style={{ textAlign: 'center', padding: '96px 20px 64px', position: 'relative', zIndex: 1, maxWidth: 860, margin: '0 auto' }}>
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: 8,
            padding: '6px 18px', borderRadius: 20,
            background: 'var(--c-accent-muted)', border: '1px solid rgba(124,106,239,0.15)',
            marginBottom: 28,
          }}>
            <span style={{ color: 'var(--c-accent-soft)', fontWeight: 600, fontSize: 12, letterSpacing: 1, textTransform: 'uppercase' }}>
              Community Operating System
            </span>
          </div>

          <Title level={1} style={{
            fontFamily: "'Outfit', sans-serif", fontWeight: 900, fontSize: 64, lineHeight: 1.08,
            margin: '0 auto', color: 'var(--c-text-bright)',
          }}>
            Build Together.{' '}
            <span style={{ color: 'var(--c-accent)' }}>Ship Faster.</span>
          </Title>

          <Text style={{
            color: 'var(--c-text-muted)', fontSize: 18, display: 'block',
            maxWidth: 520, margin: '20px auto 0', lineHeight: 1.7,
          }}>
            Form micro-communities, collaborate on tasks, attend events, and grow your reputation — all in one platform.
          </Text>

          <Space size={12} style={{ marginTop: 40 }}>
            <Button type="primary" size="large" onClick={() => navigate(isAuthenticated ? '/dashboard' : '/login')}
              style={{ ...primaryBtn, height: 50, fontSize: 16, padding: '0 32px' }}>
              {isAuthenticated ? 'Open Dashboard' : 'Start Building'} <ArrowRightOutlined />
            </Button>
            <Button size="large" icon={<GithubOutlined />} onClick={() => window.open('https://github.com', '_blank')}
              style={{ borderRadius: 12, height: 50, fontWeight: 600, fontSize: 16, padding: '0 28px', background: 'var(--c-bg-surface)', borderColor: 'var(--c-glass-border)', color: 'var(--c-text-bright)' }}>
              Star on GitHub
            </Button>
          </Space>
        </motion.div>
      </section>

      {/* Stats */}
      <section style={{ maxWidth: 820, margin: '0 auto', padding: '0 20px 72px' }}>
        <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={stagger}
          style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16 }}>
          {stats.map((s) => (
            <motion.div key={s.label} variants={fadeUp}
              style={{
                textAlign: 'center', padding: '24px 12px', borderRadius: 14,
                background: 'var(--c-bg-surface)', border: '1px solid var(--c-glass-border)',
              }}>
              <div style={{ fontSize: 32, fontWeight: 800, fontFamily: "'Outfit', sans-serif", color: 'var(--c-accent)' }}>{s.value}</div>
              <div style={{ color: 'var(--c-text-dim)', fontSize: 12, fontWeight: 500, marginTop: 4 }}>{s.label}</div>
            </motion.div>
          ))}
        </motion.div>
      </section>

      {/* Features */}
      <section style={{ maxWidth: 900, margin: '0 auto', padding: '0 20px 88px' }}>
        <motion.div initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }}>
          <Title level={2} style={{
            textAlign: 'center', fontFamily: "'Outfit', sans-serif", fontWeight: 800,
            fontSize: 36, color: 'var(--c-text-bright)', marginBottom: 48,
          }}>
            Everything you need to build{' '}
            <span style={{ color: 'var(--c-accent)' }}>together</span>
          </Title>
        </motion.div>

        <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={stagger}
          style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 16 }}>
          {features.map((f) => (
            <motion.div key={f.title} variants={fadeUp}
              style={{
                padding: 28, borderRadius: 16, background: 'var(--c-bg-surface)',
                border: '1px solid var(--c-glass-border)', transition: 'border-color 0.2s',
              }}
              whileHover={{ borderColor: 'var(--c-glass-border-hover)' }}
            >
              <div style={{
                width: 40, height: 40, borderRadius: 10,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 20, color: f.color, background: `color-mix(in srgb, ${f.color} 12%, transparent)`,
                marginBottom: 14,
              }}>{f.icon}</div>
              <Title level={4} style={{ fontFamily: "'Outfit', sans-serif", fontWeight: 700, color: 'var(--c-text-bright)', margin: '0 0 6px', fontSize: 17 }}>{f.title}</Title>
              <Text style={{ color: 'var(--c-text-muted)', fontSize: 14, lineHeight: 1.65 }}>{f.desc}</Text>
            </motion.div>
          ))}
        </motion.div>
      </section>

      {/* CTA */}
      <section style={{ textAlign: 'center', padding: '64px 20px 80px', position: 'relative' }}>
        <div style={{
          position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)',
          width: 500, height: 250, background: 'radial-gradient(ellipse at center, rgba(124,106,239,0.08) 0%, transparent 60%)',
          pointerEvents: 'none',
        }} />
        <motion.div initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} style={{ position: 'relative', zIndex: 1 }}>
          <Title level={2} style={{ fontFamily: "'Outfit', sans-serif", fontWeight: 800, fontSize: 38, color: 'var(--c-text-bright)', margin: '0 0 12px' }}>
            Ready to join?
          </Title>
          <Text style={{ color: 'var(--c-text-muted)', fontSize: 16, display: 'block', marginBottom: 28 }}>
            Start building with your community today.
          </Text>
          <Button type="primary" size="large" onClick={() => navigate(isAuthenticated ? '/dashboard' : '/login')}
            style={{ ...primaryBtn, height: 50, fontSize: 16, padding: '0 36px' }}>
            {isAuthenticated ? 'Go to Dashboard' : 'Get Started Free'} <ArrowRightOutlined />
          </Button>
        </motion.div>
      </section>

      {/* Footer */}
      <footer style={{ borderTop: '1px solid var(--c-glass-border)', padding: '24px 40px', textAlign: 'center' }}>
        <Text style={{ color: 'var(--c-text-ghost)', fontSize: 12 }}>
          © {new Date().getFullYear()} COMMUNE · Community Operating System
        </Text>
      </footer>
    </div>
  );
};

export default LandingPage;

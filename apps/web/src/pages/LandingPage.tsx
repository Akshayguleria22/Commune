import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button, Space, Typography, Avatar } from "antd";
import {
  TeamOutlined,
  ThunderboltOutlined,
  CalendarOutlined,
  SafetyCertificateOutlined,
  ArrowRightOutlined,
  GithubOutlined,
  UserOutlined,
  MessageOutlined,
  TrophyOutlined,
} from "@ant-design/icons";
import { motion } from 'framer-motion';
import { useAuthStore } from '../stores/auth.store';
import CommuneLogo from "../shared/components/CommuneLogo";

const { Title, Text } = Typography;

const features = [
  {
    icon: <TeamOutlined />,
    title: "Micro-Communities",
    desc: "Create or join focused communities around technologies, projects, or interests.",
    color: "var(--c-accent)",
  },
  {
    icon: <ThunderboltOutlined />,
    title: "Kanban Tasks",
    desc: "Drag-and-drop task boards. Assign work and track progress together.",
    color: "var(--c-accent-2)",
  },
  {
    icon: <CalendarOutlined />,
    title: "Events",
    desc: "Host workshops, hackathons, and meetups with RSVP tracking.",
    color: "var(--c-warning)",
  },
  {
    icon: <SafetyCertificateOutlined />,
    title: "Reputation",
    desc: "Earn reputation through contributions. Show off your portfolio.",
    color: "var(--c-success)",
  },
  {
    icon: <MessageOutlined />,
    title: "Messaging",
    desc: "Direct messaging and community chat in real-time.",
    color: "#36BFAA",
  },
  {
    icon: <TrophyOutlined />,
    title: "Portfolio",
    desc: "Auto-generated developer portfolio showcasing your activity and skills.",
    color: "#F5A623",
  },
];

/* A mock screenshot card showing what the app looks like inside */
const AppPreviewCard: React.FC<{ title: string; description: string; gradient: string }> = ({ title, description, gradient }) => (
  <div style={{
    borderRadius: 16, overflow: 'hidden',
    border: '1px solid var(--c-glass-border)',
    background: 'var(--c-bg-surface)',
  }}>
    {/* Simulated app header bar */}
    <div style={{
      height: 160, background: gradient,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      position: 'relative',
    }}>
      <div style={{
        position: 'absolute', top: 12, left: 16,
        display: 'flex', gap: 6,
      }}>
        <div style={{ width: 10, height: 10, borderRadius: '50%', background: 'rgba(255,255,255,0.3)' }} />
        <div style={{ width: 10, height: 10, borderRadius: '50%', background: 'rgba(255,255,255,0.3)' }} />
        <div style={{ width: 10, height: 10, borderRadius: '50%', background: 'rgba(255,255,255,0.3)' }} />
      </div>
      <span style={{ color: '#fff', fontWeight: 700, fontSize: 14, letterSpacing: 1.5, opacity: 0.9 }}>
        {title}
      </span>
    </div>
    <div style={{ padding: '16px 20px' }}>
      <Text style={{ color: 'var(--c-text-muted)', fontSize: 13, lineHeight: 1.6 }}>
        {description}
      </Text>
    </div>
  </div>
);

const fadeUp = { hidden: { opacity: 0, y: 16 }, visible: { opacity: 1, y: 0 } };
const stagger = { hidden: { opacity: 0 }, visible: { opacity: 1, transition: { staggerChildren: 0.08 } } };

const LandingPage: React.FC = () => {
  const navigate = useNavigate();
  const { isAuthenticated, user } = useAuthStore();

  const primaryBtn = {
    background: 'var(--c-accent)', border: 'none', borderRadius: 12,
    fontWeight: 700, boxShadow: '0 4px 16px rgba(124,106,239,0.25)',
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "var(--c-bg-void)",
        position: "relative",
      }}
    >
      {/* Static ambient gradients */}
      <div
        style={{
          position: "fixed",
          inset: 0,
          pointerEvents: "none",
          zIndex: 0,
          background:
            "radial-gradient(ellipse 70% 50% at 15% 5%, rgba(124,106,239,0.06) 0%, transparent 60%), radial-gradient(ellipse 50% 40% at 85% 90%, rgba(54,191,170,0.04) 0%, transparent 60%)",
        }}
      />

      {/* Header */}
      <header
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          padding: "12px 40px",
          position: "sticky",
          top: 0,
          zIndex: 50,
          background: "color-mix(in srgb, var(--c-bg-void) 80%, transparent)",
          backdropFilter: "blur(16px)",
          borderBottom: "1px solid var(--c-glass-border)",
        }}
      >
        <div style={{ cursor: "pointer" }} onClick={() => navigate("/")}>
          <CommuneLogo size={30} />
        </div>
        <Space size={12}>
          {isAuthenticated ? (
            <Space size={12} align="center">
              <span style={{ color: "var(--c-text-muted)", fontSize: 14 }}>
                Welcome back
                {user?.displayName ? `, ${user.displayName.split(" ")[0]}` : ""}
              </span>
              <Avatar
                src={user?.avatarUrl}
                icon={<UserOutlined />}
                size={34}
                style={{
                  background: "var(--c-accent)",
                  cursor: "pointer",
                  fontWeight: 600,
                }}
                onClick={() => navigate("/dashboard")}
              />
              <Button
                type="primary"
                onClick={() => navigate("/dashboard")}
                style={{ ...primaryBtn, height: 40, padding: "0 24px" }}
              >
                Dashboard <ArrowRightOutlined />
              </Button>
            </Space>
          ) : (
            <>
              <Button
                onClick={() => navigate("/login")}
                style={{
                  borderRadius: 10,
                  height: 40,
                  fontWeight: 600,
                  background: "transparent",
                  borderColor: "var(--c-glass-border)",
                  color: "var(--c-text-bright)",
                }}
              >
                Sign In
              </Button>
              <Button
                type="primary"
                onClick={() => navigate("/login")}
                style={{ ...primaryBtn, height: 40, padding: "0 24px" }}
              >
                Get Started <ArrowRightOutlined />
              </Button>
            </>
          )}
        </Space>
      </header>

      {/* Hero */}
      <section
        style={{
          textAlign: "center",
          padding: "80px 20px 48px",
          position: "relative",
          zIndex: 1,
          maxWidth: 800,
          margin: "0 auto",
        }}
      >
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div
            style={{
              display: "flex",
              justifyContent: "center",
              marginBottom: 28,
            }}
          >
            <CommuneLogo size={48} showText={false} />
          </div>

          <Title
            level={1}
            style={{
              fontFamily: "'Outfit', sans-serif",
              fontWeight: 900,
              fontSize: 56,
              lineHeight: 1.1,
              margin: "0 auto",
              color: "var(--c-text-bright)",
            }}
          >
            {isAuthenticated ? (
              <>
                Welcome back to{" "}
                <span style={{ color: "var(--c-accent)" }}>Commune</span>
              </>
            ) : (
              <>
                Build Together.{" "}
                <span style={{ color: "var(--c-accent)" }}>Ship Faster.</span>
              </>
            )}
          </Title>

          <Text
            style={{
              color: "var(--c-text-muted)",
              fontSize: 17,
              display: "block",
              maxWidth: 500,
              margin: "20px auto 0",
              lineHeight: 1.7,
            }}
          >
            {isAuthenticated
              ? "Jump back into your communities, check tasks, and keep building."
              : "Form micro-communities, collaborate on tasks, attend events, and grow your developer reputation."}
          </Text>

          <Space size={12} style={{ marginTop: 36 }}>
            <Button
              type="primary"
              size="large"
              onClick={() =>
                navigate(isAuthenticated ? "/dashboard" : "/login")
              }
              style={{
                ...primaryBtn,
                height: 50,
                fontSize: 16,
                padding: "0 32px",
              }}
            >
              {isAuthenticated ? "Open Dashboard" : "Get Started Free"}{" "}
              <ArrowRightOutlined />
            </Button>
            <Button
              size="large"
              icon={<GithubOutlined />}
              onClick={() =>
                window.open(
                  "https://github.com/AkshayGuleria22/Commune",
                  "_blank",
                )
              }
              style={{
                borderRadius: 12,
                height: 50,
                fontWeight: 600,
                fontSize: 16,
                padding: "0 28px",
                background: "var(--c-bg-surface)",
                borderColor: "var(--c-glass-border)",
                color: "var(--c-text-bright)",
              }}
            >
              Star on GitHub
            </Button>
          </Space>
        </motion.div>
      </section>

      {/* App Preview / Screenshots */}
      <section
        style={{ maxWidth: 960, margin: "0 auto", padding: "24px 20px 72px" }}
      >
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
        >
          <Title
            level={3}
            style={{
              textAlign: "center",
              fontFamily: "'Outfit', sans-serif",
              fontWeight: 700,
              fontSize: 22,
              color: "var(--c-text-muted)",
              marginBottom: 32,
              letterSpacing: 0.5,
            }}
          >
            See what&apos;s inside
          </Title>
        </motion.div>
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={stagger}
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
            gap: 20,
          }}
        >
          <motion.div variants={fadeUp}>
            <AppPreviewCard
              title="COMMUNITIES"
              description="Browse and join communities, or create your own. Each community gets its own tasks, events, and chat."
              gradient="linear-gradient(135deg, #7C6AEF 0%, #9B8AFB 100%)"
            />
          </motion.div>
          <motion.div variants={fadeUp}>
            <AppPreviewCard
              title="KANBAN BOARD"
              description="Drag-and-drop task management with columns for backlog, in-progress, review, and done."
              gradient="linear-gradient(135deg, #36BFAA 0%, #4DD9C0 100%)"
            />
          </motion.div>
          <motion.div variants={fadeUp}>
            <AppPreviewCard
              title="PORTFOLIO"
              description="Your contribution history, reputation score, skill tags, and activity heatmap — all in one place."
              gradient="linear-gradient(135deg, #F5A623 0%, #F7C948 100%)"
            />
          </motion.div>
        </motion.div>
      </section>

      {/* Features */}
      <section
        style={{ maxWidth: 960, margin: "0 auto", padding: "0 20px 88px" }}
      >
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
        >
          <Title
            level={2}
            style={{
              textAlign: "center",
              fontFamily: "'Outfit', sans-serif",
              fontWeight: 800,
              fontSize: 34,
              color: "var(--c-text-bright)",
              marginBottom: 48,
            }}
          >
            Everything you need to build{" "}
            <span style={{ color: "var(--c-accent)" }}>together</span>
          </Title>
        </motion.div>

        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={stagger}
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
            gap: 16,
          }}
        >
          {features.map((f) => (
            <motion.div
              key={f.title}
              variants={fadeUp}
              style={{
                padding: 24,
                borderRadius: 16,
                background: "var(--c-bg-surface)",
                border: "1px solid var(--c-glass-border)",
                transition: "border-color 0.2s",
              }}
              whileHover={{ borderColor: "var(--c-glass-border-hover)" }}
            >
              <div
                style={{
                  width: 40,
                  height: 40,
                  borderRadius: 10,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: 20,
                  color: f.color,
                  background: `color-mix(in srgb, ${f.color} 12%, transparent)`,
                  marginBottom: 14,
                }}
              >
                {f.icon}
              </div>
              <Title
                level={4}
                style={{
                  fontFamily: "'Outfit', sans-serif",
                  fontWeight: 700,
                  color: "var(--c-text-bright)",
                  margin: "0 0 6px",
                  fontSize: 16,
                }}
              >
                {f.title}
              </Title>
              <Text
                style={{
                  color: "var(--c-text-muted)",
                  fontSize: 13,
                  lineHeight: 1.65,
                }}
              >
                {f.desc}
              </Text>
            </motion.div>
          ))}
        </motion.div>
      </section>

      {/* CTA */}
      <section
        style={{
          textAlign: "center",
          padding: "48px 20px 72px",
          position: "relative",
        }}
      >
        <div
          style={{
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            width: 500,
            height: 250,
            background:
              "radial-gradient(ellipse at center, rgba(124,106,239,0.08) 0%, transparent 60%)",
            pointerEvents: "none",
          }}
        />
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          style={{ position: "relative", zIndex: 1 }}
        >
          <Title
            level={2}
            style={{
              fontFamily: "'Outfit', sans-serif",
              fontWeight: 800,
              fontSize: 34,
              color: "var(--c-text-bright)",
              margin: "0 0 12px",
            }}
          >
            Ready to join?
          </Title>
          <Text
            style={{
              color: "var(--c-text-muted)",
              fontSize: 15,
              display: "block",
              marginBottom: 24,
            }}
          >
            Start building with your community today.
          </Text>
          <Button
            type="primary"
            size="large"
            onClick={() => navigate(isAuthenticated ? "/dashboard" : "/login")}
            style={{
              ...primaryBtn,
              height: 50,
              fontSize: 16,
              padding: "0 36px",
            }}
          >
            {isAuthenticated ? "Go to Dashboard" : "Get Started Free"}{" "}
            <ArrowRightOutlined />
          </Button>
        </motion.div>
      </section>

      {/* Footer */}
      <footer
        style={{
          borderTop: "1px solid var(--c-glass-border)",
          padding: "20px 40px",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          flexWrap: "wrap",
          gap: 12,
        }}
      >
        <CommuneLogo size={20} />
        <Text style={{ color: "var(--c-text-ghost)", fontSize: 12 }}>
          © {new Date().getFullYear()} Commune · Community Operating System
        </Text>
      </footer>
    </div>
  );
};

export default LandingPage;

import React, { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
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
  CheckCircleFilled,
  RocketOutlined,
  GlobalOutlined,
  CodeOutlined,
  StarFilled,
  PlayCircleFilled,
  ArrowDownOutlined,
} from "@ant-design/icons";
import { motion, useScroll, useTransform, useInView } from "framer-motion";
import { useAuthStore } from "../stores/auth.store";
import CommuneLogo from "../shared/components/CommuneLogo";

const { Title, Text } = Typography;

/* ─── Animation Variants ─── */
const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, ease: [0.16, 1, 0.3, 1] },
  },
};
const fadeIn = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { duration: 0.8 } },
};
const stagger = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1, delayChildren: 0.15 },
  },
};
const scaleIn = {
  hidden: { opacity: 0, scale: 0.9 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: { duration: 0.5, ease: [0.16, 1, 0.3, 1] },
  },
};

/* ─── Animated counter hook ─── */
function useCounter(end: number, duration = 2000) {
  const [count, setCount] = useState(0);
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true });
  useEffect(() => {
    if (!inView) return;
    let start = 0;
    const step = end / (duration / 16);
    const timer = setInterval(() => {
      start += step;
      if (start >= end) {
        setCount(end);
        clearInterval(timer);
      } else setCount(Math.floor(start));
    }, 16);
    return () => clearInterval(timer);
  }, [inView, end, duration]);
  return { count, ref };
}

/* ─── Data ─── */
const features = [
  {
    icon: <TeamOutlined />,
    title: "Micro-Communities",
    desc: "Create or join focused groups around technologies, projects, or shared interests. Every community gets its own workspace.",
    color: "#7C6AEF",
  },
  {
    icon: <ThunderboltOutlined />,
    title: "Kanban Task Boards",
    desc: "Organize work with drag-and-drop boards. Assign tasks, set priorities, and track progress in real-time.",
    color: "#36BFAA",
  },
  {
    icon: <CalendarOutlined />,
    title: "Events & Meetups",
    desc: "Host workshops, hackathons, and meetups with built-in RSVP tracking and reminders.",
    color: "#FCD34D",
  },
  {
    icon: <SafetyCertificateOutlined />,
    title: "Reputation System",
    desc: "Earn reputation through meaningful contributions. Build credibility that follows you across communities.",
    color: "#34D399",
  },
  {
    icon: <MessageOutlined />,
    title: "Real-time Messaging",
    desc: "Direct messages and community channels with instant delivery. Stay connected with your team.",
    color: "#60A5FA",
  },
  {
    icon: <TrophyOutlined />,
    title: "Developer Portfolio",
    desc: "Auto-generated portfolio showcasing your contributions, skills, and activity heatmap.",
    color: "#F5A623",
  },
];

const testimonials = [
  {
    name: "Sarah Chen",
    role: "Full Stack Developer",
    text: "Commune transformed how our open-source team collaborates. The reputation system is brilliant.",
    rating: 5,
  },
  {
    name: "Marcus Rivera",
    role: "DevOps Engineer",
    text: "Finally, a platform that understands developer workflows. The Kanban boards + community chat is perfect.",
    rating: 5,
  },
  {
    name: "Emily Park",
    role: "UX Designer",
    text: "The portfolio feature alone is worth it. It auto-tracks everything and looks stunning.",
    rating: 5,
  },
];

const techLogos = [
  "React",
  "Node.js",
  "TypeScript",
  "PostgreSQL",
  "Redis",
  "Docker",
];

/* ─── Floating particle component ─── */
const FloatingOrb: React.FC<{
  delay: number;
  size: number;
  x: string;
  y: string;
  color: string;
}> = ({ delay, size, x, y, color }) => (
  <motion.div
    animate={{ y: [0, -20, 0], opacity: [0.3, 0.6, 0.3] }}
    transition={{ duration: 6, delay, repeat: Infinity, ease: "easeInOut" }}
    style={{
      position: "absolute",
      width: size,
      height: size,
      borderRadius: "50%",
      background: `radial-gradient(circle, ${color} 0%, transparent 70%)`,
      left: x,
      top: y,
      pointerEvents: "none",
      filter: "blur(30px)",
    }}
  />
);

/* ─── Section wrapper ─── */
const Section: React.FC<{
  children: React.ReactNode;
  id?: string;
  style?: React.CSSProperties;
  maxWidth?: number;
}> = ({ children, id, style, maxWidth = 1200 }) => (
  <section
    id={id}
    style={{
      maxWidth,
      margin: "0 auto",
      padding: "80px 24px",
      position: "relative",
      zIndex: 1,
      ...style,
    }}
  >
    {children}
  </section>
);

/* ─── App Preview Card ─── */
const AppPreviewCard: React.FC<{
  title: string;
  description: string;
  gradient: string;
  icon: React.ReactNode;
  features: string[];
}> = ({ title, description, gradient, icon, features: feats }) => (
  <motion.div
    variants={fadeUp}
    whileHover={{ y: -8, transition: { duration: 0.3 } }}
    style={{
      borderRadius: 20,
      overflow: "hidden",
      border: "1px solid rgba(255,255,255,0.06)",
      background: "rgba(24,24,42,0.6)",
      backdropFilter: "blur(20px)",
      cursor: "default",
    }}
  >
    <div
      style={{
        height: 180,
        background: gradient,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        position: "relative",
        overflow: "hidden",
      }}
    >
      <div
        style={{
          position: "absolute",
          inset: 0,
          background:
            "linear-gradient(to bottom, transparent 40%, rgba(24,24,42,0.9) 100%)",
        }}
      />
      {/* Browser chrome dots */}
      <div
        style={{
          position: "absolute",
          top: 14,
          left: 18,
          display: "flex",
          gap: 7,
        }}
      >
        <div
          style={{
            width: 10,
            height: 10,
            borderRadius: "50%",
            background: "rgba(255,255,255,0.25)",
          }}
        />
        <div
          style={{
            width: 10,
            height: 10,
            borderRadius: "50%",
            background: "rgba(255,255,255,0.2)",
          }}
        />
        <div
          style={{
            width: 10,
            height: 10,
            borderRadius: "50%",
            background: "rgba(255,255,255,0.15)",
          }}
        />
      </div>
      <div
        style={{
          position: "relative",
          zIndex: 2,
          fontSize: 40,
          color: "rgba(255,255,255,0.9)",
        }}
      >
        {icon}
      </div>
    </div>
    <div style={{ padding: "20px 24px 24px" }}>
      <Text
        strong
        style={{
          color: "#F0F0F5",
          fontSize: 17,
          fontFamily: "'Outfit'",
          display: "block",
          marginBottom: 8,
        }}
      >
        {title}
      </Text>
      <Text
        style={{
          color: "#8E8EA0",
          fontSize: 13,
          lineHeight: 1.7,
          display: "block",
          marginBottom: 14,
        }}
      >
        {description}
      </Text>
      <Space direction="vertical" size={6}>
        {feats.map((f) => (
          <Space key={f} size={8}>
            <CheckCircleFilled style={{ color: "#34D399", fontSize: 12 }} />
            <Text style={{ color: "#CBCBD7", fontSize: 12 }}>{f}</Text>
          </Space>
        ))}
      </Space>
    </div>
  </motion.div>
);

/* ═══════════════════════════════════════
   LANDING PAGE COMPONENT
   ═══════════════════════════════════════ */
const LandingPage: React.FC = () => {
  const navigate = useNavigate();
  const { isAuthenticated, user } = useAuthStore();
  const heroRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll();
  const heroOpacity = useTransform(scrollYProgress, [0, 0.15], [1, 0]);
  const heroScale = useTransform(scrollYProgress, [0, 0.15], [1, 0.96]);

  const stat1 = useCounter(2500);
  const stat2 = useCounter(180);
  const stat3 = useCounter(12000);
  const stat4 = useCounter(99);

  const primaryBtn: React.CSSProperties = {
    background: "linear-gradient(135deg, #7C6AEF 0%, #9B8AFB 100%)",
    border: "none",
    borderRadius: 14,
    fontWeight: 700,
    boxShadow: "0 4px 20px rgba(124,106,239,0.35)",
  };

  const ghostBtn: React.CSSProperties = {
    borderRadius: 14,
    fontWeight: 600,
    background: "rgba(255,255,255,0.04)",
    borderColor: "rgba(255,255,255,0.1)",
    color: "#F0F0F5",
    backdropFilter: "blur(10px)",
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#0E0E16",
        position: "relative",
        overflow: "hidden",
      }}
    >
      {/* ─── Ambient Background ─── */}
      <div
        style={{
          position: "fixed",
          inset: 0,
          pointerEvents: "none",
          zIndex: 0,
        }}
      >
        <div
          style={{
            position: "absolute",
            width: "100%",
            height: "100%",
            background:
              "radial-gradient(ellipse 80% 50% at 20% 0%, rgba(124,106,239,0.08) 0%, transparent 60%), radial-gradient(ellipse 60% 40% at 80% 100%, rgba(54,191,170,0.05) 0%, transparent 60%), radial-gradient(ellipse 40% 30% at 50% 50%, rgba(245,166,35,0.03) 0%, transparent 60%)",
          }}
        />
        <FloatingOrb
          delay={0}
          size={300}
          x="10%"
          y="5%"
          color="rgba(124,106,239,0.15)"
        />
        <FloatingOrb
          delay={2}
          size={200}
          x="75%"
          y="15%"
          color="rgba(54,191,170,0.1)"
        />
        <FloatingOrb
          delay={4}
          size={250}
          x="60%"
          y="70%"
          color="rgba(124,106,239,0.08)"
        />
        <FloatingOrb
          delay={1}
          size={150}
          x="25%"
          y="60%"
          color="rgba(245,166,35,0.06)"
        />
      </div>

      {/* ─── Grid pattern overlay ─── */}
      <div
        style={{
          position: "fixed",
          inset: 0,
          pointerEvents: "none",
          zIndex: 0,
          backgroundImage:
            "linear-gradient(rgba(255,255,255,0.015) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.015) 1px, transparent 1px)",
          backgroundSize: "80px 80px",
          maskImage:
            "radial-gradient(ellipse 60% 60% at 50% 30%, black 0%, transparent 70%)",
          WebkitMaskImage:
            "radial-gradient(ellipse 60% 60% at 50% 30%, black 0%, transparent 70%)",
        }}
      />

      {/* ═══ HEADER ═══ */}
      <motion.header
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5, delay: 0.1 }}
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          padding: "14px 40px",
          position: "sticky",
          top: 0,
          zIndex: 100,
          background: "rgba(14,14,22,0.7)",
          backdropFilter: "blur(20px) saturate(180%)",
          borderBottom: "1px solid rgba(255,255,255,0.04)",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 32,
            cursor: "pointer",
          }}
          onClick={() => navigate("/")}
        >
          <CommuneLogo size={28} />
        </div>

        {/* Nav links */}
        <nav style={{ display: "flex", gap: 28, alignItems: "center" }}>
          {["Features", "How it Works", "Testimonials"].map((item) => (
            <a
              key={item}
              href={`#${item.toLowerCase().replace(/ /g, "-")}`}
              style={{
                color: "#8E8EA0",
                fontSize: 13,
                fontWeight: 500,
                textDecoration: "none",
                transition: "color 0.2s",
                fontFamily: "'Inter', sans-serif",
              }}
              onMouseEnter={(e) => (e.currentTarget.style.color = "#F0F0F5")}
              onMouseLeave={(e) => (e.currentTarget.style.color = "#8E8EA0")}
            >
              {item}
            </a>
          ))}
        </nav>

        <Space size={10}>
          {isAuthenticated ? (
            <Space size={10} align="center">
              <Text style={{ color: "#8E8EA0", fontSize: 13 }}>
                Welcome
                {user?.displayName ? `, ${user.displayName.split(" ")[0]}` : ""}
              </Text>
              <Avatar
                src={user?.avatarUrl}
                icon={<UserOutlined />}
                size={34}
                style={{
                  background: "#7C6AEF",
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
                style={{ ...ghostBtn, height: 40, padding: "0 20px" }}
              >
                Sign In
              </Button>
              <Button
                type="primary"
                onClick={() => navigate("/login")}
                style={{ ...primaryBtn, height: 40, padding: "0 24px" }}
              >
                Get Started Free <ArrowRightOutlined />
              </Button>
            </>
          )}
        </Space>
      </motion.header>

      {/* ═══ HERO SECTION ═══ */}
      <motion.div
        ref={heroRef}
        style={{ opacity: heroOpacity, scale: heroScale }}
      >
        <Section
          style={{ textAlign: "center", paddingTop: 80, paddingBottom: 40 }}
          maxWidth={900}
        >
          <motion.div initial="hidden" animate="visible" variants={stagger}>
            {/* Badge */}
            <motion.div variants={fadeUp} style={{ marginBottom: 28 }}>
              <div
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 8,
                  padding: "6px 16px 6px 10px",
                  borderRadius: 100,
                  background: "rgba(124,106,239,0.1)",
                  border: "1px solid rgba(124,106,239,0.2)",
                  fontSize: 13,
                  fontWeight: 600,
                  color: "#9B8AFB",
                }}
              >
                <RocketOutlined /> Now in Public Beta — Join 2,500+ developers
              </div>
            </motion.div>

            {/* Headline */}
            <motion.div variants={fadeUp}>
              <Title
                level={1}
                style={{
                  fontFamily: "'Outfit', sans-serif",
                  fontWeight: 900,
                  fontSize: 72,
                  lineHeight: 1.05,
                  margin: "0 auto 24px",
                  color: "#F0F0F5",
                  letterSpacing: -2,
                  maxWidth: 800,
                }}
              >
                {isAuthenticated ? (
                  <>
                    Welcome back to{" "}
                    <span
                      style={{
                        background:
                          "linear-gradient(135deg, #7C6AEF, #9B8AFB, #36BFAA)",
                        WebkitBackgroundClip: "text",
                        WebkitTextFillColor: "transparent",
                      }}
                    >
                      Commune
                    </span>
                  </>
                ) : (
                  <>
                    Where Developers{" "}
                    <span
                      style={{
                        background:
                          "linear-gradient(135deg, #7C6AEF, #9B8AFB, #36BFAA)",
                        WebkitBackgroundClip: "text",
                        WebkitTextFillColor: "transparent",
                      }}
                    >
                      Build Together
                    </span>
                  </>
                )}
              </Title>
            </motion.div>

            {/* Subheadline */}
            <motion.div variants={fadeUp}>
              <Text
                style={{
                  color: "#8E8EA0",
                  fontSize: 18,
                  display: "block",
                  maxWidth: 560,
                  margin: "0 auto",
                  lineHeight: 1.7,
                  fontFamily: "'Inter', sans-serif",
                }}
              >
                {isAuthenticated
                  ? "Jump back into your communities, track tasks, and keep building."
                  : "The community operating system for developers. Form teams, manage tasks, attend events, and build your reputation — all in one place."}
              </Text>
            </motion.div>

            {/* CTA Buttons */}
            <motion.div variants={fadeUp}>
              <Space size={14} style={{ marginTop: 40 }}>
                <Button
                  type="primary"
                  size="large"
                  onClick={() =>
                    navigate(isAuthenticated ? "/dashboard" : "/login")
                  }
                  style={{
                    ...primaryBtn,
                    height: 54,
                    fontSize: 16,
                    padding: "0 36px",
                  }}
                >
                  {isAuthenticated ? "Open Dashboard" : "Start Building Free"}{" "}
                  <ArrowRightOutlined />
                </Button>
                <Button
                  size="large"
                  icon={<PlayCircleFilled />}
                  onClick={() => {
                    document
                      .getElementById("how-it-works")
                      ?.scrollIntoView({ behavior: "smooth" });
                  }}
                  style={{
                    ...ghostBtn,
                    height: 54,
                    fontSize: 16,
                    padding: "0 28px",
                  }}
                >
                  See How It Works
                </Button>
              </Space>
            </motion.div>

            {/* Social proof mini */}
            <motion.div variants={fadeUp} style={{ marginTop: 40 }}>
              <Space size={16} align="center">
                <Avatar.Group maxCount={5} size={32} style={{ marginRight: 4 }}>
                  {["A", "B", "C", "D", "E"].map((l, i) => (
                    <Avatar
                      key={l}
                      style={{
                        background: [
                          "#7C6AEF",
                          "#36BFAA",
                          "#F5A623",
                          "#FB7185",
                          "#60A5FA",
                        ][i],
                        fontWeight: 700,
                        fontSize: 13,
                        border: "2px solid #0E0E16",
                      }}
                    >
                      {l}
                    </Avatar>
                  ))}
                </Avatar.Group>
                <div>
                  <Text
                    style={{ color: "#CBCBD7", fontSize: 13, fontWeight: 600 }}
                  >
                    Trusted by 2,500+ developers
                  </Text>
                  <div style={{ display: "flex", gap: 2, marginTop: 2 }}>
                    {[1, 2, 3, 4, 5].map((s) => (
                      <StarFilled
                        key={s}
                        style={{ color: "#FCD34D", fontSize: 12 }}
                      />
                    ))}
                    <Text
                      style={{ color: "#626273", fontSize: 11, marginLeft: 6 }}
                    >
                      4.9/5
                    </Text>
                  </div>
                </div>
              </Space>
            </motion.div>

            {/* Scroll indicator */}
            <motion.div
              variants={fadeIn}
              animate={{ y: [0, 8, 0] }}
              transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
              style={{ marginTop: 48 }}
            >
              <ArrowDownOutlined style={{ color: "#626273", fontSize: 18 }} />
            </motion.div>
          </motion.div>
        </Section>
      </motion.div>

      {/* ═══ HERO PREVIEW — App Screenshot ═══ */}
      <Section style={{ paddingTop: 0, paddingBottom: 60 }} maxWidth={1100}>
        <motion.div
          initial={{ opacity: 0, y: 40, scale: 0.95 }}
          whileInView={{ opacity: 1, y: 0, scale: 1 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
        >
          <div
            style={{
              borderRadius: 20,
              border: "1px solid rgba(255,255,255,0.08)",
              background: "rgba(24,24,42,0.5)",
              backdropFilter: "blur(20px)",
              overflow: "hidden",
              boxShadow:
                "0 40px 100px rgba(0,0,0,0.5), 0 0 0 1px rgba(255,255,255,0.02)",
            }}
          >
            {/* Fake browser chrome */}
            <div
              style={{
                padding: "12px 18px",
                borderBottom: "1px solid rgba(255,255,255,0.06)",
                display: "flex",
                alignItems: "center",
                gap: 10,
                background: "rgba(14,14,22,0.6)",
              }}
            >
              <div style={{ display: "flex", gap: 7 }}>
                <div
                  style={{
                    width: 11,
                    height: 11,
                    borderRadius: "50%",
                    background: "#FB7185",
                  }}
                />
                <div
                  style={{
                    width: 11,
                    height: 11,
                    borderRadius: "50%",
                    background: "#FCD34D",
                  }}
                />
                <div
                  style={{
                    width: 11,
                    height: 11,
                    borderRadius: "50%",
                    background: "#34D399",
                  }}
                />
              </div>
              <div
                style={{
                  flex: 1,
                  height: 28,
                  borderRadius: 8,
                  background: "rgba(255,255,255,0.04)",
                  border: "1px solid rgba(255,255,255,0.05)",
                  display: "flex",
                  alignItems: "center",
                  paddingLeft: 12,
                  gap: 6,
                }}
              >
                <GlobalOutlined style={{ color: "#626273", fontSize: 11 }} />
                <Text style={{ color: "#626273", fontSize: 11 }}>
                  commune.dev/dashboard
                </Text>
              </div>
            </div>

            {/* App content mock */}
            <div style={{ display: "flex", height: 400 }}>
              {/* Sidebar mock */}
              <div
                style={{
                  width: 200,
                  borderRight: "1px solid rgba(255,255,255,0.06)",
                  padding: "16px 12px",
                  background: "rgba(14,14,22,0.4)",
                }}
              >
                <div style={{ padding: "8px 10px", marginBottom: 16 }}>
                  <div
                    style={{ display: "flex", alignItems: "center", gap: 8 }}
                  >
                    <div
                      style={{
                        width: 24,
                        height: 24,
                        borderRadius: 6,
                        background: "linear-gradient(135deg, #7C6AEF, #9B8AFB)",
                      }}
                    />
                    <Text
                      style={{
                        color: "#F0F0F5",
                        fontWeight: 700,
                        fontSize: 13,
                        fontFamily: "'Outfit'",
                      }}
                    >
                      Commune
                    </Text>
                  </div>
                </div>
                {[
                  { icon: "\u{1F3E0}", label: "Home", active: true },
                  { icon: "\u{1F465}", label: "Communities", active: false },
                  { icon: "\u{1F9ED}", label: "Discover", active: false },
                  { icon: "\u{1F4CB}", label: "Tasks", active: false },
                  { icon: "\u{1F4C5}", label: "Events", active: false },
                  { icon: "\u{1F4AC}", label: "Messages", active: false },
                  { icon: "\u{1F464}", label: "Portfolio", active: false },
                ].map((item) => (
                  <div
                    key={item.label}
                    style={{
                      padding: "8px 10px",
                      borderRadius: 8,
                      display: "flex",
                      alignItems: "center",
                      gap: 10,
                      background: item.active
                        ? "rgba(124,106,239,0.12)"
                        : "transparent",
                      marginBottom: 2,
                    }}
                  >
                    <span style={{ fontSize: 14 }}>{item.icon}</span>
                    <Text
                      style={{
                        color: item.active ? "#9B8AFB" : "#8E8EA0",
                        fontSize: 12,
                        fontWeight: item.active ? 600 : 400,
                      }}
                    >
                      {item.label}
                    </Text>
                  </div>
                ))}
              </div>

              {/* Main content mock */}
              <div
                style={{ flex: 1, padding: "20px 24px", overflow: "hidden" }}
              >
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    marginBottom: 20,
                  }}
                >
                  <div>
                    <Text
                      style={{
                        color: "#F0F0F5",
                        fontSize: 18,
                        fontWeight: 800,
                        fontFamily: "'Outfit'",
                        display: "block",
                      }}
                    >
                      Good morning, Developer! {"\u{1F44B}"}
                    </Text>
                    <Text style={{ color: "#626273", fontSize: 12 }}>
                      Here&apos;s your workspace overview
                    </Text>
                  </div>
                  <div style={{ display: "flex", gap: 8 }}>
                    {["\u{1F50D}", "\u{1F514}", "\u{2699}\u{FE0F}"].map((e) => (
                      <div
                        key={e}
                        style={{
                          width: 32,
                          height: 32,
                          borderRadius: 8,
                          background: "rgba(255,255,255,0.04)",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          fontSize: 14,
                        }}
                      >
                        {e}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Stats row */}
                <div style={{ display: "flex", gap: 12, marginBottom: 20 }}>
                  {[
                    { label: "Communities", val: "5", color: "#7C6AEF" },
                    { label: "Tasks", val: "12", color: "#36BFAA" },
                    { label: "Events", val: "3", color: "#FCD34D" },
                    { label: "Reputation", val: "847", color: "#F5A623" },
                  ].map((s) => (
                    <div
                      key={s.label}
                      style={{
                        flex: 1,
                        padding: "14px 16px",
                        borderRadius: 12,
                        background: `linear-gradient(135deg, ${s.color}08, ${s.color}04)`,
                        border: `1px solid ${s.color}15`,
                      }}
                    >
                      <Text
                        style={{
                          color: "#626273",
                          fontSize: 10,
                          fontWeight: 500,
                          display: "block",
                        }}
                      >
                        {s.label}
                      </Text>
                      <Text
                        style={{
                          color: "#F0F0F5",
                          fontSize: 20,
                          fontWeight: 800,
                          fontFamily: "'Outfit'",
                        }}
                      >
                        {s.val}
                      </Text>
                    </div>
                  ))}
                </div>

                {/* Activity cards mock */}
                <div style={{ display: "flex", gap: 12 }}>
                  <div
                    style={{
                      flex: 2,
                      padding: 16,
                      borderRadius: 12,
                      background: "rgba(255,255,255,0.02)",
                      border: "1px solid rgba(255,255,255,0.05)",
                    }}
                  >
                    <Text
                      style={{
                        color: "#CBCBD7",
                        fontSize: 13,
                        fontWeight: 700,
                        fontFamily: "'Outfit'",
                        display: "block",
                        marginBottom: 12,
                      }}
                    >
                      Recent Activity
                    </Text>
                    {[
                      {
                        text: "Completed: Fix auth middleware",
                        tag: "task",
                        color: "#34D399",
                      },
                      {
                        text: "Joined: React Devs community",
                        tag: "community",
                        color: "#7C6AEF",
                      },
                      {
                        text: "RSVP: Weekend Hackathon",
                        tag: "event",
                        color: "#FCD34D",
                      },
                    ].map((a) => (
                      <div
                        key={a.text}
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: 10,
                          padding: "8px 0",
                          borderBottom: "1px solid rgba(255,255,255,0.03)",
                        }}
                      >
                        <div
                          style={{
                            width: 6,
                            height: 6,
                            borderRadius: "50%",
                            background: a.color,
                          }}
                        />
                        <Text
                          style={{ color: "#CBCBD7", fontSize: 12, flex: 1 }}
                        >
                          {a.text}
                        </Text>
                        <span
                          style={{
                            fontSize: 10,
                            color: a.color,
                            background: `${a.color}15`,
                            padding: "2px 8px",
                            borderRadius: 4,
                            fontWeight: 600,
                          }}
                        >
                          {a.tag}
                        </span>
                      </div>
                    ))}
                  </div>
                  <div
                    style={{
                      flex: 1,
                      padding: 16,
                      borderRadius: 12,
                      background: "rgba(255,255,255,0.02)",
                      border: "1px solid rgba(255,255,255,0.05)",
                    }}
                  >
                    <Text
                      style={{
                        color: "#CBCBD7",
                        fontSize: 13,
                        fontWeight: 700,
                        fontFamily: "'Outfit'",
                        display: "block",
                        marginBottom: 12,
                      }}
                    >
                      Top Skills
                    </Text>
                    {["React", "TypeScript", "Node.js"].map((s, i) => (
                      <div key={s} style={{ marginBottom: 10 }}>
                        <div
                          style={{
                            display: "flex",
                            justifyContent: "space-between",
                            marginBottom: 4,
                          }}
                        >
                          <Text style={{ color: "#8E8EA0", fontSize: 11 }}>
                            {s}
                          </Text>
                          <Text style={{ color: "#626273", fontSize: 10 }}>
                            {[92, 87, 78][i]}%
                          </Text>
                        </div>
                        <div
                          style={{
                            height: 4,
                            borderRadius: 2,
                            background: "rgba(255,255,255,0.04)",
                          }}
                        >
                          <div
                            style={{
                              height: "100%",
                              borderRadius: 2,
                              width: `${[92, 87, 78][i]}%`,
                              background:
                                "linear-gradient(90deg, #7C6AEF, #9B8AFB)",
                            }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </Section>

      {/* ═══ TRUSTED BY / TECH STRIP ═══ */}
      <Section style={{ paddingTop: 0, paddingBottom: 40 }}>
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={fadeIn}
          style={{ textAlign: "center" }}
        >
          <Text
            style={{
              color: "#626273",
              fontSize: 12,
              fontWeight: 600,
              letterSpacing: 2,
              textTransform: "uppercase",
            }}
          >
            Built with the tools developers love
          </Text>
          <div
            style={{
              display: "flex",
              justifyContent: "center",
              gap: 48,
              marginTop: 24,
              flexWrap: "wrap",
            }}
          >
            {techLogos.map((t) => (
              <motion.div
                key={t}
                whileHover={{ scale: 1.1, color: "#F0F0F5" }}
                style={{
                  color: "#3F3F50",
                  fontSize: 14,
                  fontWeight: 600,
                  fontFamily: "'Inter'",
                  transition: "color 0.2s",
                  cursor: "default",
                }}
              >
                <CodeOutlined style={{ marginRight: 6 }} />
                {t}
              </motion.div>
            ))}
          </div>
        </motion.div>
      </Section>

      {/* ═══ STATS SECTION ═══ */}
      <Section>
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={stagger}
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(4, 1fr)",
            gap: 20,
          }}
        >
          {[
            {
              label: "Developers",
              value: stat1,
              suffix: "+",
              icon: <UserOutlined />,
            },
            {
              label: "Communities",
              value: stat2,
              suffix: "+",
              icon: <TeamOutlined />,
            },
            {
              label: "Tasks Completed",
              value: stat3,
              suffix: "+",
              icon: <ThunderboltOutlined />,
            },
            {
              label: "Uptime",
              value: stat4,
              suffix: "%",
              icon: <CheckCircleFilled />,
            },
          ].map((s) => (
            <motion.div
              key={s.label}
              variants={scaleIn}
              ref={s.value.ref}
              style={{
                textAlign: "center",
                padding: "32px 20px",
                borderRadius: 20,
                background: "rgba(24,24,42,0.4)",
                border: "1px solid rgba(255,255,255,0.05)",
                backdropFilter: "blur(10px)",
              }}
            >
              <div style={{ fontSize: 20, color: "#7C6AEF", marginBottom: 12 }}>
                {s.icon}
              </div>
              <Title
                level={2}
                style={{
                  fontFamily: "'Outfit'",
                  fontWeight: 900,
                  fontSize: 42,
                  color: "#F0F0F5",
                  margin: "0 0 4px",
                  letterSpacing: -1,
                }}
              >
                {s.value.count.toLocaleString()}
                {s.suffix}
              </Title>
              <Text style={{ color: "#8E8EA0", fontSize: 14, fontWeight: 500 }}>
                {s.label}
              </Text>
            </motion.div>
          ))}
        </motion.div>
      </Section>

      {/* ═══ FEATURES SECTION ═══ */}
      <Section id="features">
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={stagger}
        >
          <motion.div
            variants={fadeUp}
            style={{ textAlign: "center", marginBottom: 60 }}
          >
            <Text
              style={{
                color: "#7C6AEF",
                fontSize: 13,
                fontWeight: 700,
                letterSpacing: 2,
                textTransform: "uppercase",
                display: "block",
                marginBottom: 12,
              }}
            >
              Features
            </Text>
            <Title
              level={2}
              style={{
                fontFamily: "'Outfit'",
                fontWeight: 800,
                fontSize: 44,
                color: "#F0F0F5",
                margin: "0 0 16px",
                letterSpacing: -1,
              }}
            >
              Everything you need to{" "}
              <span
                style={{
                  background: "linear-gradient(135deg, #7C6AEF, #36BFAA)",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                }}
              >
                collaborate
              </span>
            </Title>
            <Text
              style={{
                color: "#8E8EA0",
                fontSize: 16,
                maxWidth: 500,
                display: "block",
                margin: "0 auto",
                lineHeight: 1.7,
              }}
            >
              A complete toolkit for developer communities. From task management
              to reputation tracking.
            </Text>
          </motion.div>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(3, 1fr)",
              gap: 20,
            }}
          >
            {features.map((f) => (
              <motion.div
                key={f.title}
                variants={fadeUp}
                whileHover={{ y: -6, borderColor: `${f.color}30` }}
                style={{
                  padding: "32px 28px",
                  borderRadius: 20,
                  background: "rgba(24,24,42,0.4)",
                  border: "1px solid rgba(255,255,255,0.05)",
                  backdropFilter: "blur(10px)",
                  transition: "border-color 0.3s",
                  cursor: "default",
                }}
              >
                <div
                  style={{
                    width: 48,
                    height: 48,
                    borderRadius: 14,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: 22,
                    color: f.color,
                    background: `${f.color}12`,
                    marginBottom: 20,
                  }}
                >
                  {f.icon}
                </div>
                <Title
                  level={4}
                  style={{
                    fontFamily: "'Outfit'",
                    fontWeight: 700,
                    color: "#F0F0F5",
                    margin: "0 0 8px",
                    fontSize: 18,
                  }}
                >
                  {f.title}
                </Title>
                <Text
                  style={{ color: "#8E8EA0", fontSize: 14, lineHeight: 1.7 }}
                >
                  {f.desc}
                </Text>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </Section>

      {/* ═══ HOW IT WORKS ═══ */}
      <Section id="how-it-works">
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={stagger}
        >
          <motion.div
            variants={fadeUp}
            style={{ textAlign: "center", marginBottom: 60 }}
          >
            <Text
              style={{
                color: "#36BFAA",
                fontSize: 13,
                fontWeight: 700,
                letterSpacing: 2,
                textTransform: "uppercase",
                display: "block",
                marginBottom: 12,
              }}
            >
              How It Works
            </Text>
            <Title
              level={2}
              style={{
                fontFamily: "'Outfit'",
                fontWeight: 800,
                fontSize: 44,
                color: "#F0F0F5",
                margin: 0,
                letterSpacing: -1,
              }}
            >
              Get started in{" "}
              <span
                style={{
                  background: "linear-gradient(135deg, #36BFAA, #34D399)",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                }}
              >
                three steps
              </span>
            </Title>
          </motion.div>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(3, 1fr)",
              gap: 32,
              position: "relative",
            }}
          >
            {/* Connecting line */}
            <div
              style={{
                position: "absolute",
                top: 50,
                left: "20%",
                right: "20%",
                height: 2,
                background:
                  "linear-gradient(90deg, transparent, rgba(124,106,239,0.3), rgba(54,191,170,0.3), transparent)",
                zIndex: 0,
              }}
            />

            {[
              {
                step: "1",
                title: "Create Your Profile",
                desc: "Sign up in seconds. Set up your developer profile with skills, bio, and interests.",
                color: "#7C6AEF",
                icon: <UserOutlined />,
              },
              {
                step: "2",
                title: "Join Communities",
                desc: "Browse open communities or create your own. Each one gets a full workspace with tasks, events, and chat.",
                color: "#36BFAA",
                icon: <TeamOutlined />,
              },
              {
                step: "3",
                title: "Build & Earn",
                desc: "Contribute code, complete tasks, and attend events. Your reputation grows automatically.",
                color: "#F5A623",
                icon: <TrophyOutlined />,
              },
            ].map((s) => (
              <motion.div
                key={s.step}
                variants={fadeUp}
                style={{ textAlign: "center", position: "relative", zIndex: 1 }}
              >
                <div
                  style={{
                    width: 72,
                    height: 72,
                    borderRadius: 24,
                    background: `${s.color}15`,
                    border: `2px solid ${s.color}30`,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    margin: "0 auto 20px",
                    fontSize: 28,
                    color: s.color,
                  }}
                >
                  {s.icon}
                </div>
                <div
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    justifyContent: "center",
                    width: 28,
                    height: 28,
                    borderRadius: "50%",
                    background: s.color,
                    color: "#fff",
                    fontSize: 13,
                    fontWeight: 800,
                    marginBottom: 12,
                  }}
                >
                  {s.step}
                </div>
                <Title
                  level={4}
                  style={{
                    fontFamily: "'Outfit'",
                    fontWeight: 700,
                    color: "#F0F0F5",
                    margin: "0 0 8px",
                  }}
                >
                  {s.title}
                </Title>
                <Text
                  style={{ color: "#8E8EA0", fontSize: 14, lineHeight: 1.7 }}
                >
                  {s.desc}
                </Text>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </Section>

      {/* ═══ APP PREVIEWS ═══ */}
      <Section maxWidth={1100}>
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={stagger}
        >
          <motion.div
            variants={fadeUp}
            style={{ textAlign: "center", marginBottom: 48 }}
          >
            <Title
              level={2}
              style={{
                fontFamily: "'Outfit'",
                fontWeight: 800,
                fontSize: 36,
                color: "#F0F0F5",
                margin: 0,
                letterSpacing: -0.5,
              }}
            >
              See what&apos;s inside
            </Title>
          </motion.div>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(3, 1fr)",
              gap: 20,
            }}
          >
            <AppPreviewCard
              title="Community Workspaces"
              description="Each community gets its own full-featured workspace with everything your team needs."
              gradient="linear-gradient(135deg, #7C6AEF 0%, #9B8AFB 100%)"
              icon={<TeamOutlined />}
              features={[
                "Task boards",
                "Event calendar",
                "Community chat",
                "Member directory",
              ]}
            />
            <AppPreviewCard
              title="Kanban Task Boards"
              description="Drag-and-drop task management with priorities, assignees, and due dates."
              gradient="linear-gradient(135deg, #36BFAA 0%, #4DD9C0 100%)"
              icon={<ThunderboltOutlined />}
              features={[
                "Drag & drop",
                "Priority labels",
                "Assignee tracking",
                "Status filters",
              ]}
            />
            <AppPreviewCard
              title="Developer Portfolio"
              description="Your contribution history, reputation scores, and skills — beautifully presented."
              gradient="linear-gradient(135deg, #F5A623 0%, #F7C948 100%)"
              icon={<TrophyOutlined />}
              features={[
                "Activity heatmap",
                "Skill progress",
                "Reputation score",
                "Auto-generated",
              ]}
            />
          </div>
        </motion.div>
      </Section>

      {/* ═══ TESTIMONIALS ═══ */}
      <Section id="testimonials">
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={stagger}
        >
          <motion.div
            variants={fadeUp}
            style={{ textAlign: "center", marginBottom: 48 }}
          >
            <Text
              style={{
                color: "#F5A623",
                fontSize: 13,
                fontWeight: 700,
                letterSpacing: 2,
                textTransform: "uppercase",
                display: "block",
                marginBottom: 12,
              }}
            >
              Testimonials
            </Text>
            <Title
              level={2}
              style={{
                fontFamily: "'Outfit'",
                fontWeight: 800,
                fontSize: 44,
                color: "#F0F0F5",
                margin: 0,
                letterSpacing: -1,
              }}
            >
              Loved by developers
            </Title>
          </motion.div>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(3, 1fr)",
              gap: 20,
            }}
          >
            {testimonials.map((t) => (
              <motion.div
                key={t.name}
                variants={fadeUp}
                whileHover={{ y: -4 }}
                style={{
                  padding: "28px 24px",
                  borderRadius: 20,
                  background: "rgba(24,24,42,0.4)",
                  border: "1px solid rgba(255,255,255,0.05)",
                  backdropFilter: "blur(10px)",
                  cursor: "default",
                }}
              >
                <div style={{ display: "flex", gap: 2, marginBottom: 16 }}>
                  {Array.from({ length: t.rating }).map((_, i) => (
                    <StarFilled
                      key={i}
                      style={{ color: "#FCD34D", fontSize: 14 }}
                    />
                  ))}
                </div>
                <Text
                  style={{
                    color: "#CBCBD7",
                    fontSize: 14,
                    lineHeight: 1.8,
                    display: "block",
                    marginBottom: 20,
                    fontStyle: "italic",
                  }}
                >
                  &ldquo;{t.text}&rdquo;
                </Text>
                <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                  <Avatar
                    size={40}
                    style={{
                      background: `linear-gradient(135deg, ${["#7C6AEF", "#36BFAA", "#F5A623"][testimonials.indexOf(t)]}, ${["#9B8AFB", "#4DD9C0", "#F7C948"][testimonials.indexOf(t)]})`,
                      fontWeight: 700,
                      fontSize: 16,
                    }}
                  >
                    {t.name[0]}
                  </Avatar>
                  <div>
                    <Text
                      style={{
                        color: "#F0F0F5",
                        fontWeight: 600,
                        fontSize: 14,
                        display: "block",
                      }}
                    >
                      {t.name}
                    </Text>
                    <Text style={{ color: "#626273", fontSize: 12 }}>
                      {t.role}
                    </Text>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </Section>

      {/* ═══ FINAL CTA ═══ */}
      <Section style={{ paddingBottom: 40 }}>
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={fadeUp}
          style={{
            textAlign: "center",
            padding: "64px 40px",
            borderRadius: 28,
            background:
              "linear-gradient(135deg, rgba(124,106,239,0.12) 0%, rgba(54,191,170,0.08) 100%)",
            border: "1px solid rgba(124,106,239,0.15)",
            position: "relative",
            overflow: "hidden",
          }}
        >
          {/* Background glow */}
          <div
            style={{
              position: "absolute",
              top: "50%",
              left: "50%",
              transform: "translate(-50%, -50%)",
              width: 600,
              height: 300,
              background:
                "radial-gradient(ellipse at center, rgba(124,106,239,0.15) 0%, transparent 70%)",
              pointerEvents: "none",
            }}
          />

          <div style={{ position: "relative", zIndex: 1 }}>
            <Title
              level={2}
              style={{
                fontFamily: "'Outfit'",
                fontWeight: 800,
                fontSize: 44,
                color: "#F0F0F5",
                margin: "0 0 16px",
                letterSpacing: -1,
              }}
            >
              Ready to build something{" "}
              <span
                style={{
                  background: "linear-gradient(135deg, #7C6AEF, #9B8AFB)",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                }}
              >
                amazing
              </span>
              ?
            </Title>
            <Text
              style={{
                color: "#8E8EA0",
                fontSize: 16,
                display: "block",
                marginBottom: 32,
                maxWidth: 460,
                margin: "0 auto 32px",
              }}
            >
              Join thousands of developers building, learning, and growing
              together on Commune.
            </Text>
            <Space size={14}>
              <Button
                type="primary"
                size="large"
                onClick={() =>
                  navigate(isAuthenticated ? "/dashboard" : "/login")
                }
                style={{
                  ...primaryBtn,
                  height: 54,
                  fontSize: 16,
                  padding: "0 40px",
                }}
              >
                {isAuthenticated
                  ? "Go to Dashboard"
                  : "Get Started — It\u2019s Free"}{" "}
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
                  ...ghostBtn,
                  height: 54,
                  fontSize: 16,
                  padding: "0 28px",
                }}
              >
                Star on GitHub
              </Button>
            </Space>
          </div>
        </motion.div>
      </Section>

      {/* ═══ FOOTER ═══ */}
      <footer
        style={{
          borderTop: "1px solid rgba(255,255,255,0.04)",
          maxWidth: 1200,
          margin: "0 auto",
          padding: "48px 24px 32px",
        }}
      >
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "2fr 1fr 1fr 1fr",
            gap: 40,
            marginBottom: 40,
          }}
        >
          {/* Brand column */}
          <div>
            <div style={{ marginBottom: 16 }}>
              <CommuneLogo size={28} />
            </div>
            <Text
              style={{
                color: "#626273",
                fontSize: 13,
                lineHeight: 1.7,
                display: "block",
                maxWidth: 280,
              }}
            >
              The community operating system for developers. Build, collaborate,
              and grow your reputation.
            </Text>
            <Space size={16} style={{ marginTop: 16 }}>
              <GithubOutlined
                style={{
                  color: "#626273",
                  fontSize: 18,
                  cursor: "pointer",
                  transition: "color 0.2s",
                }}
                onClick={() =>
                  window.open(
                    "https://github.com/AkshayGuleria22/Commune",
                    "_blank",
                  )
                }
                onMouseEnter={(e) => (e.currentTarget.style.color = "#F0F0F5")}
                onMouseLeave={(e) => (e.currentTarget.style.color = "#626273")}
              />
            </Space>
          </div>

          {/* Link columns */}
          {[
            {
              title: "Product",
              links: [
                "Features",
                "Communities",
                "Task Boards",
                "Events",
                "Portfolio",
              ],
            },
            {
              title: "Developers",
              links: ["Documentation", "API Reference", "Changelog", "Status"],
            },
            {
              title: "Company",
              links: ["About", "Blog", "Careers", "Contact", "Privacy"],
            },
          ].map((col) => (
            <div key={col.title}>
              <Text
                style={{
                  color: "#F0F0F5",
                  fontSize: 13,
                  fontWeight: 700,
                  display: "block",
                  marginBottom: 16,
                  fontFamily: "'Outfit'",
                }}
              >
                {col.title}
              </Text>
              <Space direction="vertical" size={10}>
                {col.links.map((link) => (
                  <Text
                    key={link}
                    style={{
                      color: "#626273",
                      fontSize: 13,
                      cursor: "pointer",
                      transition: "color 0.2s",
                      display: "block",
                    }}
                    onMouseEnter={(e) =>
                      (e.currentTarget.style.color = "#CBCBD7")
                    }
                    onMouseLeave={(e) =>
                      (e.currentTarget.style.color = "#626273")
                    }
                  >
                    {link}
                  </Text>
                ))}
              </Space>
            </div>
          ))}
        </div>

        {/* Bottom bar */}
        <div
          style={{
            borderTop: "1px solid rgba(255,255,255,0.04)",
            paddingTop: 20,
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            flexWrap: "wrap",
            gap: 12,
          }}
        >
          <Text style={{ color: "#3F3F50", fontSize: 12 }}>
            &copy; {new Date().getFullYear()} Commune &middot; Community
            Operating System
          </Text>
          <Space size={20}>
            {["Terms", "Privacy", "Cookies"].map((t) => (
              <Text
                key={t}
                style={{ color: "#3F3F50", fontSize: 12, cursor: "pointer" }}
              >
                {t}
              </Text>
            ))}
          </Space>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;

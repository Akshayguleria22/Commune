import React from 'react';
import { useParams, useNavigate } from "react-router-dom";
import { Typography, Row, Col, Card, Tag, Space, Avatar, Progress, Empty, Button, message as antMsg } from 'antd';
import {
  CodeOutlined,
  TeamOutlined,
  CalendarOutlined,
  StarOutlined,
  TrophyOutlined,
  LinkOutlined,
  CrownOutlined,
  PlusOutlined,
  FilePdfOutlined,
} from "@ant-design/icons";
import { motion } from 'framer-motion';
import { ContributionHeatmap, StatCard, PortfolioSkeleton } from '../../../shared/components';
import { useUserPortfolio, useMyPortfolio } from '../hooks/usePortfolio';
import { useCommunities } from "../../community/hooks/useCommunities";
import { useAuthStore } from '../../../stores/auth.store';

const { Title, Text, Paragraph } = Typography;

const stagger = { hidden: { opacity: 0 }, visible: { opacity: 1, transition: { staggerChildren: 0.08 } } };
const fadeUp = { hidden: { opacity: 0, y: 16 }, visible: { opacity: 1, y: 0, transition: { duration: 0.4, ease: [0.16, 1, 0.3, 1] } } };

const PortfolioPage: React.FC = () => {
  const { username } = useParams<{ username: string }>();
  const navigate = useNavigate();
  const { user: authUser } = useAuthStore();
  const isMe = !username || username === authUser?.username;

  const { data: myPortfolio, isLoading: myLoading } = useMyPortfolio();
  const { data: userPortfolio, isLoading: userLoading } = useUserPortfolio(isMe ? '' : (username ?? ''));
  const { data: communitiesData } = useCommunities();
  const myCommunities: any[] = isMe
    ? Array.isArray(communitiesData)
      ? communitiesData
      : ((communitiesData as any)?.items ?? [])
    : [];

  const isLoading = isMe ? myLoading : userLoading;
  const portfolio: any = isMe ? myPortfolio : userPortfolio;

  if (isLoading) return <PortfolioSkeleton />;

  // Extract data from portfolio or fallback to auth user
  const user = portfolio?.user ?? authUser ?? {};
  const displayName = user.displayName ?? username ?? 'User';
  const headline = portfolio?.headline ?? user.bio ?? '';
  const summary = portfolio?.summary ?? '';
  const website = portfolio?.websiteUrl ?? user.website ?? '';
  const skills: any[] = portfolio?.skills ?? [];
  const entries: any[] = portfolio?.entries ?? [];
  const contribs: any[] = portfolio?.contributions ?? [];

  // Reputation scores
  const builder = portfolio?.builderScore ?? 0;
  const mentor = portfolio?.mentorScore ?? 0;
  const organizer = portfolio?.organizerScore ?? 0;

  let builderRank = "Rookie Builder";
  let rankColor = "var(--c-text-dim)";
  let rankBg = "var(--c-bg-hover)";
  if (builder >= 100) { builderRank = "Master Builder"; rankColor = "#fff"; rankBg = "var(--c-warning)"; }
  else if (builder >= 50) { builderRank = "Pro Builder"; rankColor = "#fff"; rankBg = "var(--c-accent)"; }
  else if (builder >= 10) { builderRank = "Active Builder"; rankColor = "var(--c-info)"; rankBg = "rgba(52,152,219,0.15)"; }

  return (
    <motion.div
      variants={stagger}
      initial="hidden"
      animate="visible"
      style={{ position: "relative" }}
    >
      {/* Cover Banner */}
      <motion.div
        variants={fadeUp}
        style={{
          height: 260,
          borderRadius: 28,
          position: "relative",
          background: portfolio?.coverUrl
            ? `url(${portfolio.coverUrl}) center/cover no-repeat`
            : "linear-gradient(135deg, rgba(124,106,239,0.3) 0%, rgba(16,185,129,0.2) 50%, rgba(251,191,36,0.2) 100%)",
          boxShadow: "0 8px 40px rgba(0,0,0,0.4)",
          overflow: "hidden",
        }}
      >
        <div
          style={{
            position: "absolute",
            inset: 0,
            background:
              "linear-gradient(to bottom, transparent 20%, rgba(5,5,10,0.95) 100%)",
          }}
        />

        {website && (
          <div
            style={{
              position: "absolute",
              top: 20,
              right: 24,
              display: "flex",
              alignItems: "center",
              gap: 8,
              padding: "8px 16px",
              background: "rgba(0,0,0,0.4)",
              backdropFilter: "blur(20px)",
              borderRadius: 12,
              border: "1px solid rgba(255,255,255,0.08)",
              cursor: "pointer",
            }}
            onClick={() => window.open(website, "_blank")}
          >
            <LinkOutlined style={{ color: "var(--c-accent-soft)" }} />
            <Text
              style={{
                color: "var(--c-text-base)",
                fontSize: 13,
                fontWeight: 500,
              }}
            >
              {website.replace(/^https?:\/\//, "")}
            </Text>
          </div>
        )}
      </motion.div>

      {/* Profile Header */}
      <motion.div
        variants={fadeUp}
        style={{
          display: "flex",
          gap: 28,
          flexWrap: "wrap",
          marginTop: -80,
          padding: "0 32px",
          position: "relative",
          zIndex: 10,
          marginBottom: 40,
        }}
      >
        <div
          style={{
            position: "relative",
            width: 160,
            height: 160,
            flexShrink: 0,
            alignSelf: "flex-start",
          }}
        >
          <Avatar
            size={160}
            src={user.avatarUrl}
            style={{
              background: "var(--c-accent)",
              fontSize: 64,
              fontWeight: 800,
              fontFamily: "'Outfit', sans-serif",
              border: "8px solid var(--c-bg-void)",
              boxShadow: "0 16px 40px rgba(124,106,239,0.4)",
            }}
          >
            {displayName[0]}
          </Avatar>
          {user.isVerified && (
            <div
              style={{
                position: "absolute",
                bottom: 8,
                right: 4,
                background: "var(--c-bg-void)",
                borderRadius: "50%",
                padding: 4,
              }}
            >
              <div
                style={{
                  background: "var(--c-accent)",
                  color: "var(--c-text-bright)",
                  borderRadius: "50%",
                  width: 26,
                  height: 26,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: 14,
                  fontWeight: 700,
                }}
              >
                ✓
              </div>
            </div>
          )}
        </div>

        <div style={{ flex: 1, minWidth: 200, marginTop: 50 }}>
          <Space size={12} align="center" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div>
              <Title
                level={1}
                style={{
                  margin: 0,
                  color: "var(--c-text-bright)",
                  fontFamily: "'Outfit', sans-serif",
                  fontSize: 40,
                  fontWeight: 800,
                  letterSpacing: -0.5,
                }}
              >
                {displayName}
              </Title>
              <Text
                style={{
                  color: "var(--c-text-muted)",
                  fontSize: 16,
                  display: "block",
                  marginBottom: 8,
                }}
              >
                @{user.username ?? username}
              </Text>
            </div>
            {isMe && (
              <Button
                type="primary"
                ghost
                icon={<FilePdfOutlined />}
                style={{ borderRadius: 12 }}
                onClick={() => antMsg.info("Resume upload coming soon")}
              >
                Add Resume
              </Button>
            )}
          </Space>
          {headline && (
            <Text
              style={{
                color: "var(--c-accent-soft)",
                fontWeight: 600,
                display: "block",
                fontSize: 17,
                marginTop: 4,
              }}
            >
              {headline}
            </Text>
          )}
          <Space size={8} style={{ marginTop: 8, flexWrap: "wrap", alignItems: "center" }}>
            <Text
              style={{
                color: "var(--c-text-muted)",
                fontSize: 14,
              }}
            >
              {user.location ? user.location : ""}
            </Text>
            <div style={{ width: 4, height: 4, borderRadius: "50%", background: "var(--c-text-dim)" }} />
            <Tag color={rankBg === "var(--c-bg-hover)" ? "default" : undefined} style={{ margin: 0, border: "none", background: rankBg, color: rankColor, fontWeight: 700, borderRadius: 12, padding: "2px 10px" }}>
              <TrophyOutlined style={{ marginRight: 4 }} />
              {builderRank}
            </Tag>
          </Space>
          {summary && (
            <Paragraph
              style={{
                color: "var(--c-text-base)",
                marginTop: 20,
                maxWidth: 600,
                lineHeight: 1.7,
                fontSize: 15,
                background: "rgba(255,255,255,0.02)",
                padding: "18px 24px",
                borderRadius: 14,
                border: "1px solid rgba(255,255,255,0.04)",
                backdropFilter: "blur(16px)",
              }}
            >
              {summary}
            </Paragraph>
          )}
        </div>
      </motion.div>

      <Row gutter={[20, 20]}>
        {/* Left column */}
        <Col xs={24} lg={16}>
          {/* Reputation */}
          <motion.div variants={fadeUp}>
            <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
              <Col xs={8}>
                <StatCard
                  title="Builder"
                  value={builder}
                  icon={<CodeOutlined />}
                  color="var(--c-accent)"
                />
              </Col>
              <Col xs={8}>
                <StatCard
                  title="Mentor"
                  value={mentor}
                  icon={<TeamOutlined />}
                  color="var(--c-success)"
                />
              </Col>
              <Col xs={8}>
                <StatCard
                  title="Organizer"
                  value={organizer}
                  icon={<CalendarOutlined />}
                  color="var(--c-warning)"
                />
              </Col>
            </Row>
          </motion.div>

          {/* Contributions */}
          {contribs.length > 0 && (
            <motion.div variants={fadeUp}>
              <Card
                title={
                  <span
                    style={{
                      color: "var(--c-text-bright)",
                      fontWeight: 700,
                      fontFamily: "'Outfit'",
                    }}
                  >
                    Contribution Activity
                  </span>
                }
                style={{
                  background: "var(--c-bg-surface)",
                  backdropFilter: "blur(20px)",
                  border: "1px solid var(--c-glass-border)",
                  borderRadius: 14,
                  marginBottom: 24,
                }}
                styles={{ body: { padding: "20px 24px" } }}
              >
                <ContributionHeatmap data={contribs} weeks={26} />
              </Card>
            </motion.div>
          )}

          {/* Timeline */}
          <motion.div variants={fadeUp}>
            <Card
              title={
                <span
                  style={{
                    color: "var(--c-text-bright)",
                    fontWeight: 700,
                    fontFamily: "'Outfit'",
                  }}
                >
                  <TrophyOutlined
                    style={{ color: "var(--c-warning)", marginRight: 10 }}
                  />
                  Portfolio Timeline
                </span>
              }
              style={{
                background: "var(--c-bg-surface)",
                backdropFilter: "blur(20px)",
                border: "1px solid var(--c-glass-border)",
                borderRadius: 14,
              }}
              styles={{ body: { padding: 0 } }}
            >
              {entries.length === 0 ? (
                <div style={{ padding: 40, textAlign: "center" }}>
                  <Empty
                    description={
                      <Text style={{ color: "var(--c-text-dim)" }}>
                        No portfolio entries yet
                      </Text>
                    }
                  />
                </div>
              ) : (
                entries.map((entry: any, i: number) => (
                  <motion.div
                    key={entry.id ?? i}
                    whileHover={{ backgroundColor: "rgba(124,106,239,0.06)" }}
                    style={{
                      padding: "18px 24px",
                      borderBottom: "1px solid var(--c-glass-highlight)",
                      display: "flex",
                      gap: 14,
                      alignItems: "flex-start",
                      cursor: "pointer",
                      transition: "background 0.2s",
                    }}
                  >
                    <div
                      style={{
                        width: 10,
                        height: 10,
                        borderRadius: "50%",
                        marginTop: 6,
                        flexShrink: 0,
                        background:
                          entry.type === "task_completed"
                            ? "var(--c-success)"
                            : entry.type === "event_organized"
                              ? "var(--c-warning)"
                              : "var(--c-accent)",
                        boxShadow: `0 0 8px ${
                          entry.type === "task_completed"
                            ? "rgba(16,185,129,0.4)"
                            : entry.type === "event_organized"
                              ? "rgba(251,191,36,0.4)"
                              : "rgba(124,106,239,0.4)"
                        }`,
                      }}
                    />
                    <div style={{ flex: 1 }}>
                      <Text
                        style={{
                          color: "var(--c-text-bright)",
                          fontWeight: 600,
                          display: "block",
                          fontSize: 14,
                        }}
                      >
                        {entry.title}
                      </Text>
                      <Text
                        style={{ color: "var(--c-text-dim)", fontSize: 12 }}
                      >
                        {entry.community && `${entry.community} · `}
                        {entry.date ?? ""}
                      </Text>
                    </div>
                    <Tag
                      style={{
                        margin: 0,
                        background: "var(--c-accent-muted)",
                        borderColor: "rgba(124,106,239,0.12)",
                        color: "var(--c-accent-soft)",
                        fontSize: 11,
                        borderRadius: 8,
                        padding: "2px 10px",
                        fontWeight: 500,
                      }}
                    >
                      {(entry.type ?? "entry").replace(/_/g, " ")}
                    </Tag>
                  </motion.div>
                ))
              )}
            </Card>
          </motion.div>
        </Col>

        {/* Right column */}
        <Col xs={24} lg={8}>
          <motion.div variants={fadeUp}>
            <Card
              title={
                <span
                  style={{
                    color: "var(--c-text-bright)",
                    fontWeight: 700,
                    fontFamily: "'Outfit'",
                  }}
                >
                  <StarOutlined
                    style={{ color: "var(--c-accent-soft)", marginRight: 8 }}
                  />
                  Skills
                </span>
              }
              extra={
                isMe && (
                  <Button
                    type="text"
                    size="small"
                    icon={<PlusOutlined />}
                    style={{ color: 'var(--c-accent-soft)' }}
                    onClick={() => antMsg.info("Skill management coming soon")}
                  >
                    Add Skill
                  </Button>
                )
              }
              style={{
                background: "var(--c-bg-surface)",
                backdropFilter: "blur(20px)",
                border: "1px solid var(--c-glass-border)",
                borderRadius: 14,
              }}
            >
              {skills.length === 0 ? (
                <Empty
                  description={
                    <Text style={{ color: "var(--c-text-dim)" }}>
                      No skills added yet
                    </Text>
                  }
                />
              ) : (
                <Space direction="vertical" size={18} style={{ width: "100%" }}>
                  {skills.map((skill: any) => (
                    <div key={skill.id ?? skill.name}>
                      <div
                        style={{
                          display: "flex",
                          justifyContent: "space-between",
                          marginBottom: 6,
                        }}
                      >
                        <Text
                          style={{
                            color: "var(--c-text-base)",
                            fontSize: 14,
                            fontWeight: 600,
                          }}
                        >
                          {skill.name}
                        </Text>
                        <Text
                          style={{
                            color: "var(--c-text-dim)",
                            fontSize: 12,
                            fontWeight: 500,
                          }}
                        >
                          {skill.level ?? 0}/5
                        </Text>
                      </div>
                      <Progress
                        percent={(skill.level ?? 0) * 20}
                        showInfo={false}
                        strokeColor="var(--c-accent)"
                        trailColor="rgba(255,255,255,0.04)"
                        size="small"
                      />
                    </div>
                  ))}
                </Space>
              )}
            </Card>
          </motion.div>

          {/* Communities Section */}
          {isMe && myCommunities.length > 0 && (
            <motion.div variants={fadeUp} style={{ marginTop: 20 }}>
              <Card
                title={
                  <span
                    style={{
                      color: "var(--c-text-bright)",
                      fontWeight: 700,
                      fontFamily: "'Outfit'",
                    }}
                  >
                    <TeamOutlined
                      style={{ color: "var(--c-accent-soft)", marginRight: 8 }}
                    />
                    My Communities
                  </span>
                }
                style={{
                  background: "var(--c-bg-surface)",
                  backdropFilter: "blur(20px)",
                  border: "1px solid var(--c-glass-border)",
                  borderRadius: 14,
                }}
                styles={{ body: { padding: "12px 16px" } }}
              >
                <Space direction="vertical" size={8} style={{ width: "100%" }}>
                  {myCommunities.map((c: any) => (
                    <div
                      key={c.id}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: 10,
                        padding: "8px 10px",
                        borderRadius: 10,
                        cursor: "pointer",
                        transition: "background 0.2s",
                        border: "1px solid transparent",
                      }}
                      onClick={() =>
                        navigate(`/dashboard/communities/${c.slug}`)
                      }
                      onMouseEnter={(e) => {
                        e.currentTarget.style.background =
                          "var(--c-glass-highlight)";
                        e.currentTarget.style.borderColor =
                          "var(--c-glass-border)";
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.background = "transparent";
                        e.currentTarget.style.borderColor = "transparent";
                      }}
                    >
                      <Avatar
                        size={32}
                        style={{
                          background: "var(--c-accent)",
                          fontSize: 13,
                          fontWeight: 700,
                        }}
                      >
                        {c.name?.[0] ?? "C"}
                      </Avatar>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <Text
                          style={{
                            color: "var(--c-text-bright)",
                            fontWeight: 600,
                            fontSize: 13,
                            display: "block",
                            whiteSpace: "nowrap",
                            overflow: "hidden",
                            textOverflow: "ellipsis",
                          }}
                        >
                          {c.name}
                        </Text>
                      </div>
                      {(c.role === "owner" || c.role === "Owner") && (
                        <CrownOutlined
                          style={{
                            color: "var(--c-warning)",
                            fontSize: 13,
                          }}
                        />
                      )}
                    </div>
                  ))}
                </Space>
              </Card>
            </motion.div>
          )}
        </Col>
      </Row>
    </motion.div>
  );
};

export default PortfolioPage;

import React, { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  Typography,
  Row,
  Col,
  Card,
  Tag,
  Space,
  Avatar,
  Progress,
  Empty,
  Button,
  message as antMsg,
  Modal,
  Input,
  Slider,
  Popconfirm,
} from "antd";
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
  DeleteOutlined,
  GlobalOutlined,
} from "@ant-design/icons";
import { motion, AnimatePresence } from "framer-motion";
import {
  ContributionHeatmap,
  StatCard,
  PortfolioSkeleton,
} from "../../../shared/components";
import {
  useUserPortfolio,
  useMyPortfolio,
  useAddSkill,
  useRemoveSkill,
  useUpdatePortfolio,
} from "../hooks/usePortfolio";
import { useMyCommunities } from "../../community/hooks/useCommunities";
import { useAuthStore } from "../../../stores/auth.store";

const { Title, Text, Paragraph } = Typography;

const stagger = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.08 } },
};
const fadeUp = {
  hidden: { opacity: 0, y: 16 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.4, ease: [0.16, 1, 0.3, 1] },
  },
};

const PortfolioPage: React.FC = () => {
  const { username } = useParams<{ username: string }>();
  const navigate = useNavigate();
  const { user: authUser } = useAuthStore();
  const isMe = !username || username === authUser?.username;

  const { data: myPortfolio, isLoading: myLoading } = useMyPortfolio();
  const { data: userPortfolio, isLoading: userLoading } = useUserPortfolio(
    isMe ? "" : (username ?? ""),
  );
  const { data: communitiesData } = useMyCommunities();
  const addSkillMut = useAddSkill();
  const removeSkillMut = useRemoveSkill();
  const updatePortfolioMut = useUpdatePortfolio();
  const myCommunities: any[] = isMe
    ? Array.isArray(communitiesData)
      ? communitiesData
      : ((communitiesData as any)?.items ?? [])
    : [];

  const isLoading = isMe ? myLoading : userLoading;
  const portfolio: any = isMe ? myPortfolio : userPortfolio;

  // Skill modal state
  const [skillModalOpen, setSkillModalOpen] = useState(false);
  const [newSkillName, setNewSkillName] = useState("");
  const [newSkillLevel, setNewSkillLevel] = useState(3);

  // Resume modal state
  const [resumeModalOpen, setResumeModalOpen] = useState(false);
  const [resumeUrl, setResumeUrl] = useState("");

  const handleAddSkill = async () => {
    if (!newSkillName.trim()) {
      antMsg.warning("Please enter a skill name");
      return;
    }
    try {
      await addSkillMut.mutateAsync({
        name: newSkillName.trim(),
        level: newSkillLevel,
      });
      antMsg.success(`Skill "${newSkillName}" added!`);
      setNewSkillName("");
      setNewSkillLevel(3);
      setSkillModalOpen(false);
    } catch {
      antMsg.error("Failed to add skill");
    }
  };

  const handleRemoveSkill = async (skillId: string, skillName: string) => {
    try {
      await removeSkillMut.mutateAsync(skillId);
      antMsg.success(`Removed "${skillName}"`);
    } catch {
      antMsg.error("Failed to remove skill");
    }
  };

  const handleSaveResume = async () => {
    if (!resumeUrl.trim()) {
      antMsg.warning("Please enter a resume URL");
      return;
    }
    try {
      await updatePortfolioMut.mutateAsync({
        websiteUrl: resumeUrl.trim(),
      } as any);
      antMsg.success("Resume link saved!");
      setResumeModalOpen(false);
    } catch {
      antMsg.error("Failed to save resume link");
    }
  };

  if (isLoading) return <PortfolioSkeleton />;

  // Extract data from portfolio or fallback to auth user for own profile only
  const profileUser = portfolio?.user ?? (isMe ? authUser : null) ?? {};
  const displayName = profileUser.displayName ?? username ?? "User";
  const headline = portfolio?.headline ?? profileUser.bio ?? "";
  const summary = portfolio?.summary ?? "";
  const website = portfolio?.websiteUrl ?? profileUser.website ?? "";
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
  if (builder >= 100) {
    builderRank = "Master Builder";
    rankColor = "#fff";
    rankBg = "var(--c-warning)";
  } else if (builder >= 50) {
    builderRank = "Pro Builder";
    rankColor = "#fff";
    rankBg = "var(--c-accent)";
  } else if (builder >= 10) {
    builderRank = "Active Builder";
    rankColor = "var(--c-info)";
    rankBg = "rgba(52,152,219,0.15)";
  }

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
            src={profileUser.avatarUrl}
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
          {profileUser.isVerified && (
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
          <Space
            size={12}
            align="center"
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "flex-start",
            }}
          >
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
                @{profileUser.username ?? username}
              </Text>
            </div>
            {isMe && (
              <Button
                type="primary"
                ghost
                icon={<FilePdfOutlined />}
                style={{ borderRadius: 12 }}
                onClick={() => {
                  setResumeUrl(website || "");
                  setResumeModalOpen(true);
                }}
              >
                {website ? "Edit Resume" : "Add Resume"}
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
          <Space
            size={8}
            style={{ marginTop: 8, flexWrap: "wrap", alignItems: "center" }}
          >
            <Text
              style={{
                color: "var(--c-text-muted)",
                fontSize: 14,
              }}
            >
              {profileUser.location ? profileUser.location : ""}
            </Text>
            <div
              style={{
                width: 4,
                height: 4,
                borderRadius: "50%",
                background: "var(--c-text-dim)",
              }}
            />
            <Tag
              color={rankBg === "var(--c-bg-hover)" ? "default" : undefined}
              style={{
                margin: 0,
                border: "none",
                background: rankBg,
                color: rankColor,
                fontWeight: 700,
                borderRadius: 12,
                padding: "2px 10px",
              }}
            >
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
                    style={{ color: "var(--c-accent-soft)" }}
                    onClick={() => setSkillModalOpen(true)}
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
                  <AnimatePresence mode="popLayout">
                    {skills.map((skill: any) => (
                      <motion.div
                        key={skill.id ?? skill.name}
                        layout
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: 10, height: 0 }}
                        transition={{ duration: 0.25 }}
                      >
                        <div
                          style={{
                            display: "flex",
                            justifyContent: "space-between",
                            alignItems: "center",
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
                          <Space size={8}>
                            <Text
                              style={{
                                color: "var(--c-text-dim)",
                                fontSize: 12,
                                fontWeight: 500,
                              }}
                            >
                              {skill.level ?? 0}/5
                            </Text>
                            {isMe && (
                              <Popconfirm
                                title="Remove skill?"
                                onConfirm={() =>
                                  handleRemoveSkill(skill.id, skill.name)
                                }
                                okText="Yes"
                                cancelText="No"
                              >
                                <DeleteOutlined
                                  style={{
                                    color: "var(--c-text-dim)",
                                    fontSize: 12,
                                    cursor: "pointer",
                                    transition: "color 0.2s",
                                  }}
                                  onMouseEnter={(e) =>
                                    (e.currentTarget.style.color = "#ef4444")
                                  }
                                  onMouseLeave={(e) =>
                                    (e.currentTarget.style.color =
                                      "var(--c-text-dim)")
                                  }
                                />
                              </Popconfirm>
                            )}
                          </Space>
                        </div>
                        <Progress
                          percent={(skill.level ?? 0) * 20}
                          showInfo={false}
                          strokeColor="var(--c-accent)"
                          trailColor="rgba(255,255,255,0.04)"
                          size="small"
                        />
                      </motion.div>
                    ))}
                  </AnimatePresence>
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

      {/* Add Skill Modal */}
      <Modal
        title={
          <span
            style={{
              fontFamily: "'Outfit'",
              fontWeight: 700,
              color: "var(--c-text-bright)",
            }}
          >
            Add New Skill
          </span>
        }
        open={skillModalOpen}
        onCancel={() => {
          setSkillModalOpen(false);
          setNewSkillName("");
          setNewSkillLevel(3);
        }}
        onOk={handleAddSkill}
        confirmLoading={addSkillMut.isPending}
        okText="Add Skill"
        okButtonProps={{
          style: {
            background: "var(--c-accent)",
            border: "none",
            borderRadius: 10,
          },
        }}
        cancelButtonProps={{
          style: { borderRadius: 10, borderColor: "var(--c-glass-border)" },
        }}
        styles={{
          content: {
            background: "var(--c-bg-surface)",
            border: "1px solid var(--c-glass-border)",
            borderRadius: 16,
          },
          header: {
            background: "var(--c-bg-surface)",
            borderBottom: "1px solid var(--c-glass-border)",
          },
          footer: { borderTop: "1px solid var(--c-glass-border)" },
        }}
      >
        <div style={{ padding: "16px 0" }}>
          <Text
            style={{
              color: "var(--c-text-muted)",
              fontSize: 13,
              display: "block",
              marginBottom: 8,
            }}
          >
            Skill Name
          </Text>
          <Input
            placeholder="e.g. React, Python, UI Design..."
            value={newSkillName}
            onChange={(e) => setNewSkillName(e.target.value)}
            onPressEnter={handleAddSkill}
            maxLength={50}
            style={{
              background: "var(--c-bg-deep, var(--c-bg-void))",
              borderColor: "var(--c-glass-border)",
              borderRadius: 10,
              color: "var(--c-text-bright)",
              height: 42,
            }}
          />
          <div style={{ marginTop: 20 }}>
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                marginBottom: 8,
              }}
            >
              <Text style={{ color: "var(--c-text-muted)", fontSize: 13 }}>
                Proficiency Level
              </Text>
              <Text
                style={{
                  color: "var(--c-accent-soft)",
                  fontSize: 14,
                  fontWeight: 700,
                }}
              >
                {newSkillLevel}/5
              </Text>
            </div>
            <Slider
              min={1}
              max={5}
              value={newSkillLevel}
              onChange={setNewSkillLevel}
              marks={{ 1: "1", 2: "2", 3: "3", 4: "4", 5: "5" }}
              styles={{ track: { background: "var(--c-accent)" } }}
            />
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                marginTop: 4,
              }}
            >
              <Text style={{ color: "var(--c-text-dim)", fontSize: 11 }}>
                Beginner
              </Text>
              <Text style={{ color: "var(--c-text-dim)", fontSize: 11 }}>
                Expert
              </Text>
            </div>
          </div>
        </div>
      </Modal>

      {/* Resume Link Modal */}
      <Modal
        title={
          <span
            style={{
              fontFamily: "'Outfit'",
              fontWeight: 700,
              color: "var(--c-text-bright)",
            }}
          >
            <GlobalOutlined
              style={{ marginRight: 8, color: "var(--c-accent-soft)" }}
            />
            Resume / Portfolio Link
          </span>
        }
        open={resumeModalOpen}
        onCancel={() => setResumeModalOpen(false)}
        onOk={handleSaveResume}
        confirmLoading={updatePortfolioMut.isPending}
        okText="Save Link"
        okButtonProps={{
          style: {
            background: "var(--c-accent)",
            border: "none",
            borderRadius: 10,
          },
        }}
        cancelButtonProps={{
          style: { borderRadius: 10, borderColor: "var(--c-glass-border)" },
        }}
        styles={{
          content: {
            background: "var(--c-bg-surface)",
            border: "1px solid var(--c-glass-border)",
            borderRadius: 16,
          },
          header: {
            background: "var(--c-bg-surface)",
            borderBottom: "1px solid var(--c-glass-border)",
          },
          footer: { borderTop: "1px solid var(--c-glass-border)" },
        }}
      >
        <div style={{ padding: "16px 0" }}>
          <Text
            style={{
              color: "var(--c-text-muted)",
              fontSize: 13,
              display: "block",
              marginBottom: 8,
            }}
          >
            Paste a link to your resume, portfolio site, or LinkedIn profile
          </Text>
          <Input
            placeholder="https://drive.google.com/your-resume.pdf"
            value={resumeUrl}
            onChange={(e) => setResumeUrl(e.target.value)}
            onPressEnter={handleSaveResume}
            prefix={<LinkOutlined style={{ color: "var(--c-text-dim)" }} />}
            style={{
              background: "var(--c-bg-deep, var(--c-bg-void))",
              borderColor: "var(--c-glass-border)",
              borderRadius: 10,
              color: "var(--c-text-bright)",
              height: 42,
            }}
          />
          <Text
            style={{
              color: "var(--c-text-dim)",
              fontSize: 11,
              display: "block",
              marginTop: 8,
            }}
          >
            Tip: Use Google Drive, Dropbox, or any public URL to host your
            resume
          </Text>
        </div>
      </Modal>
    </motion.div>
  );
};;

export default PortfolioPage;

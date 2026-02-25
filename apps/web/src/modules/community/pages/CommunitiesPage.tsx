import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Typography, Row, Col, Input, Button, Select, Empty, Modal, Form, message, Space } from 'antd';
import { PlusOutlined, SearchOutlined, ThunderboltOutlined, TeamOutlined } from '@ant-design/icons';
import { motion } from 'framer-motion';
import { CommunityCard, CommunityGridSkeleton } from '../../../shared/components';
import { useCommunities, useCreateCommunity } from '../hooks/useCommunities';

const { Title, Text } = Typography;

const stagger = { hidden: { opacity: 0 }, visible: { opacity: 1, transition: { staggerChildren: 0.07, delayChildren: 0.2 } } };
const fadeUp = { hidden: { opacity: 0, y: 20, scale: 0.97 }, visible: { opacity: 1, y: 0, scale: 1, transition: { duration: 0.4, ease: [0.16, 1, 0.3, 1] } } };

const CommunitiesPage: React.FC = () => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [filter, setFilter] = useState<"all" | "mine">("mine");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [form] = Form.useForm();

  // Real API data
  const { data: apiCommunities, isLoading } = useCommunities();
  const createCommunity = useCreateCommunity();

  // Use API data
  const apiData = apiCommunities?.items ?? apiCommunities;
  const communities = Array.isArray(apiData) ? apiData : [];

  const filteredCommunities = communities.filter((c: any) => {
    const matchesSearch = c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (c.tags || []).some((t: string) => t.includes(searchQuery.toLowerCase()));
    const matchesFilter = filter === 'all' || c.role;
    return matchesSearch && matchesFilter;
  });

  const handleCreate = async (values: any) => {
    try {
      await createCommunity.mutateAsync(values);
      message.success(`Community "${values.name}" created!`);
      setIsModalOpen(false);
      form.resetFields();
    } catch (error: any) {
      message.error(error?.response?.data?.message || 'Failed to create community');
    }
  };

  const totalMembers = communities.reduce((a: number, c: any) => a + (c.memberCount || 0), 0);

  return (
    <div style={{ paddingBottom: 60, position: "relative" }}>
      {/* Ambient glow behind hero */}
      <div
        style={{
          position: "absolute",
          top: -100,
          left: "50%",
          transform: "translateX(-50%)",
          width: 800,
          height: 400,
          background: "var(--c-accent-muted)",
          filter: "blur(60px)",
          pointerEvents: "none",
          zIndex: 0,
        }}
      />

      {/* Hero Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
        style={{
          position: "relative",
          borderRadius: 28,
          overflow: "hidden",
          marginBottom: 40,
          zIndex: 1,
        }}
      >
        <div
          style={{
            background:
              "url(https://images.unsplash.com/photo-1550745165-9bc0b252726f?w=1600&q=80) center/cover no-repeat",
            position: "absolute",
            inset: 0,
          }}
        />
        <div
          style={{
            position: "absolute",
            inset: 0,
            background:
              "linear-gradient(135deg, rgba(5,5,10,0.92) 0%, rgba(124,106,239,0.5) 100%)",
          }}
        />

        <div style={{ position: "relative", padding: "72px 56px", zIndex: 1 }}>
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
          >
            <div
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 8,
                padding: "8px 20px",
                background: "var(--c-glass-border)",
                borderRadius: 16,
                color: "var(--c-text-base)",
                fontSize: 13,
                fontWeight: 600,
                letterSpacing: 0.5,
                marginBottom: 24,
                backdropFilter: "blur(16px)",
                border: "1px solid rgba(255,255,255,0.08)",
              }}
            >
              <ThunderboltOutlined style={{ color: "var(--c-warning)" }} /> THE
              HUB OF INNOVATION
            </div>
          </motion.div>

          <Title
            level={1}
            style={{
              color: "var(--c-text-bright)",
              fontSize: 52,
              fontWeight: 800,
              margin: "0 0 20px",
              lineHeight: 1.05,
              fontFamily: "'Outfit', sans-serif",
              maxWidth: 600,
              letterSpacing: -1,
            }}
          >
            Find your{" "}
            <span
              style={{
                background: "var(--c-accent)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
              }}
            >
              tribe
            </span>
            .<br />
            Build the{" "}
            <span
              style={{
                background: "var(--c-accent)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
              }}
            >
              future
            </span>
            .
          </Title>
          <Text
            style={{
              color: "rgba(255,255,255,0.7)",
              fontSize: 17,
              display: "block",
              maxWidth: 520,
              lineHeight: 1.7,
            }}
          >
            Join thousands of builders forming micro-communities around the most
            cutting edge technologies.
          </Text>

          {/* Inline stats */}
          <div style={{ display: "flex", gap: 32, marginTop: 32 }}>
            <div>
              <div
                style={{
                  fontSize: 28,
                  fontWeight: 800,
                  color: "var(--c-text-bright)",
                  fontFamily: "'Outfit'",
                }}
              >
                {communities.length}
              </div>
              <div
                style={{
                  fontSize: 12,
                  color: "rgba(255,255,255,0.5)",
                  fontWeight: 500,
                }}
              >
                Active Communities
              </div>
            </div>
            <div style={{ width: 1, background: "rgba(255,255,255,0.1)" }} />
            <div>
              <div
                style={{
                  fontSize: 28,
                  fontWeight: 800,
                  color: "var(--c-accent-soft)",
                  fontFamily: "'Outfit'",
                }}
              >
                {totalMembers.toLocaleString()}
              </div>
              <div
                style={{
                  fontSize: 12,
                  color: "rgba(255,255,255,0.5)",
                  fontWeight: 500,
                }}
              >
                Total Members
              </div>
            </div>
            <div style={{ width: 1, background: "rgba(255,255,255,0.1)" }} />
            <div>
              <motion.div
                animate={{ scale: [1, 1.1, 1], opacity: [0.7, 1, 0.7] }}
                transition={{ duration: 2, repeat: Infinity }}
                style={{
                  width: 10,
                  height: 10,
                  borderRadius: "50%",
                  background: "var(--c-success)",
                  boxShadow: "0 0 16px rgba(16,185,129,0.5)",
                  display: "inline-block",
                  marginRight: 6,
                  verticalAlign: "middle",
                }}
              />
              <span
                style={{
                  fontSize: 14,
                  color: "var(--c-success)",
                  fontWeight: 600,
                }}
              >
                Live
              </span>
            </div>
          </div>

          <Space size={16} style={{ marginTop: 36 }}>
            <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }}>
              <Button
                type="primary"
                icon={<PlusOutlined />}
                size="large"
                onClick={() => setIsModalOpen(true)}
                style={{
                  height: 52,
                  padding: "0 32px",
                  fontSize: 16,
                  fontWeight: 700,
                  borderRadius: 16,
                  background: "var(--c-accent)",
                  border: "none",
                  boxShadow: "0 8px 32px rgba(124, 106, 239, 0.4)",
                }}
              >
                Create Community
              </Button>
            </motion.div>
          </Space>
        </div>
      </motion.div>

      {/* Search / Filters Bar */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.25 }}
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          flexWrap: "wrap",
          gap: 12,
          marginBottom: 32,
          padding: "16px 20px",
          background: "var(--c-bg-surface)",
          borderRadius: 14,
          border: "1px solid var(--c-glass-border)",
          backdropFilter: "blur(20px)",
          position: "relative",
          zIndex: 1,
        }}
      >
        <Space size={16} style={{ width: "100%", flexWrap: "wrap" }}>
          <Input
            prefix={
              <SearchOutlined
                style={{ color: "var(--c-text-dim)", fontSize: 16 }}
              />
            }
            placeholder="Search communities..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{
              flex: "1 1 200px",
              minWidth: 200,
              maxWidth: 400,
              borderRadius: 14,
              height: 48,
              fontSize: 15,
            }}
            size="large"
          />
          <Select
            value={filter}
            onChange={setFilter}
            style={{ minWidth: 180 }}
            size="large"
            popupMatchSelectWidth={false}
            options={[
              { value: "all", label: "🌍 All Communities" },
              { value: "mine", label: "💼 My Communities" },
            ]}
          />
        </Space>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 8,
            color: "var(--c-text-dim)",
            fontWeight: 500,
            fontSize: 14,
            whiteSpace: "nowrap",
            flexShrink: 0,
          }}
        >
          <TeamOutlined />{" "}
          <span style={{ color: "var(--c-accent-soft)", fontWeight: 700 }}>
            {filteredCommunities.length}
          </span>{" "}
          results
        </div>
      </motion.div>

      {/* Community Grid */}
      {isLoading ? (
        <CommunityGridSkeleton />
      ) : filteredCommunities.length === 0 ? (
        <Empty
          description={
            <Text style={{ color: "var(--c-text-dim)" }}>
              No communities found
            </Text>
          }
          style={{ marginTop: 80 }}
        />
      ) : (
        <motion.div variants={stagger} initial="hidden" animate="visible">
          <Row gutter={[20, 20]}>
            {filteredCommunities.map((community: any) => (
              <Col key={community.slug} xs={24} sm={12} lg={8} xl={6}>
                <motion.div variants={fadeUp}>
                  <CommunityCard
                    {...community}
                    onClick={() =>
                      navigate(`/dashboard/communities/${community.slug}`)
                    }
                  />
                </motion.div>
              </Col>
            ))}
          </Row>
        </motion.div>
      )}

      {/* Create Modal */}
      <Modal
        title={
          <span
            style={{
              fontFamily: "'Outfit', sans-serif",
              fontWeight: 700,
              fontSize: 20,
            }}
          >
            Create Community
          </span>
        }
        open={isModalOpen}
        onCancel={() => setIsModalOpen(false)}
        footer={null}
        styles={{ body: { paddingTop: 16 } }}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleCreate}
          requiredMark={false}
        >
          <Form.Item name="name" label="Name" rules={[{ required: true }]}>
            <Input
              placeholder="AI Builders"
              size="large"
              style={{ borderRadius: 14, height: 48 }}
            />
          </Form.Item>
          <Form.Item
            name="slug"
            label="URL Slug"
            rules={[
              { required: true },
              {
                pattern: /^[a-z0-9]+(?:-[a-z0-9]+)*$/,
                message: "Lowercase + hyphens only",
              },
            ]}
          >
            <Input
              prefix="commune.dev/"
              placeholder="ai-builders"
              size="large"
              style={{ borderRadius: 14, height: 48 }}
            />
          </Form.Item>
          <Form.Item name="description" label="Description">
            <Input.TextArea
              rows={3}
              placeholder="What is your community about?"
              style={{ borderRadius: 14 }}
            />
          </Form.Item>
          <Form.Item name="visibility" label="Visibility" initialValue="public">
            <Select
              options={[
                { value: "public", label: "🌍 Public" },
                { value: "private", label: "🔒 Private" },
              ]}
              size="large"
            />
          </Form.Item>
          <Form.Item>
            <motion.div whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.98 }}>
              <Button
                type="primary"
                htmlType="submit"
                block
                size="large"
                style={{
                  background: "var(--c-accent)",
                  border: "none",
                  fontWeight: 700,
                  borderRadius: 14,
                  height: 52,
                  boxShadow: "0 8px 24px rgba(124,106,239,0.3)",
                }}
              >
                Create Community
              </Button>
            </motion.div>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default CommunitiesPage;

import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Typography,
  Input,
  Row,
  Col,
  Tag,
  Empty,
  Avatar,
  Segmented,
  Button,
  Tooltip,
  message as antMsg,
} from "antd";
import {
  SearchOutlined,
  UserOutlined,
  TeamOutlined,
  UserAddOutlined,
} from "@ant-design/icons";
import { motion } from 'framer-motion';
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { CommunityCard, CommunityGridSkeleton } from '../../../shared/components';
import { useCommunities } from '../../community/hooks/useCommunities';
import { searchApi } from "../../../api/search.api";
import { messagingApi } from "../../../api/messaging.api";

const { Title, Text } = Typography;

const TAGS = ['ai', 'react', 'typescript', 'rust', 'design', 'devops', 'data', 'mobile', 'opensource', 'python'];

const DiscoverPage: React.FC = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [search, setSearch] = useState("");
  const [selTag, setSelTag] = useState<string | null>(null);
  const [searchMode, setSearchMode] = useState<string>("communities");
  const [sentRequests, setSentRequests] = useState<Set<string>>(new Set());

  const sendFriendReqMut = useMutation({
    mutationFn: (addresseeId: string) =>
      messagingApi.sendFriendRequest(addresseeId),
    onSuccess: (_, addresseeId) => {
      setSentRequests((prev) => new Set(prev).add(addresseeId));
      queryClient.invalidateQueries({ queryKey: ["friends-pending"] });
      antMsg.success("Friend request sent!");
    },
    onError: () => antMsg.error("Could not send friend request"),
  });

  const { data: communitiesData, isLoading } = useCommunities(
    selTag ? { tags: selTag } : undefined,
  );
  const communities = useMemo(() => {
    const d = communitiesData;
    const arr: any[] = Array.isArray(d) ? d : ((d as any)?.items ?? []);
    return arr;
  }, [communitiesData]);

  // Search for users when in people mode and there's a query
  const { data: searchResults, isLoading: searchLoading } = useQuery({
    queryKey: ["discover-search", search],
    queryFn: () => searchApi.search(search, 20),
    enabled: search.length >= 2 && searchMode === "people",
    staleTime: 30_000,
  });

  const userResults = useMemo(() => {
    if (!searchResults) return [];
    return searchResults.filter((r) => r.type === "user");
  }, [searchResults]);

  const filtered = useMemo(() => {
    if (!search) return communities;
    return communities.filter(
      (c: any) =>
        (c.name ?? "").toLowerCase().includes(search.toLowerCase()) ||
        (c.description ?? "").toLowerCase().includes(search.toLowerCase()),
    );
  }, [communities, search]);

  return (
    <div style={{ position: "relative" }}>
      {/* Background glowing search orb */}
      <motion.div
        animate={{ scale: [1, 1.1, 1], opacity: [0.3, 0.4, 0.3] }}
        transition={{ duration: 8, repeat: Infinity }}
        style={{
          position: "absolute",
          top: 100,
          left: "50%",
          transform: "translateX(-50%)",
          width: 500,
          height: 150,
          background:
            "radial-gradient(ellipse at center, var(--c-accent) 0%, transparent 60%)",
          filter: "blur(60px)",
          zIndex: 0,
          pointerEvents: "none",
        }}
      />

      <motion.div
        initial={{ opacity: 0, y: -15 }}
        animate={{ opacity: 1, y: 0 }}
        style={{
          textAlign: "center",
          padding: "60px 20px 48px",
          position: "relative",
          zIndex: 1,
        }}
      >
        <Title
          level={1}
          style={{
            fontFamily: "'Outfit', sans-serif",
            fontSize: 44,
            fontWeight: 800,
            margin: 0,
            background:
              "linear-gradient(135deg, var(--c-text-bright) 0%, var(--c-accent-soft) 100%)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
          }}
        >
          Explore the Ecosystem
        </Title>
        <Text
          style={{
            color: "var(--c-text-muted)",
            display: "block",
            marginTop: 12,
            fontSize: 16,
          }}
        >
          Discover communities and people shaping the future.
        </Text>

        {/* Search mode toggle */}
        <div
          style={{ display: "flex", justifyContent: "center", marginTop: 24 }}
        >
          <Segmented
            value={searchMode}
            onChange={(v) => setSearchMode(v as string)}
            options={[
              {
                label: (
                  <>
                    <TeamOutlined /> Communities
                  </>
                ),
                value: "communities",
              },
              {
                label: (
                  <>
                    <UserOutlined /> People
                  </>
                ),
                value: "people",
              },
            ]}
            style={{
              background: "var(--c-glass-highlight)",
              borderRadius: 12,
              padding: 2,
            }}
          />
        </div>

        <div
          style={{ display: "flex", justifyContent: "center", marginTop: 32 }}
        >
          <Input
            prefix={
              <SearchOutlined
                style={{ color: "var(--c-text-dim)", fontSize: 18 }}
              />
            }
            placeholder="Search communities, topics, or people..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            size="large"
            style={{
              maxWidth: 560,
              background: "var(--c-glass-highlight)",
              backdropFilter: "blur(20px)",
              border: "1px solid var(--c-glass-border)",
              borderRadius: 16,
              height: 56,
              fontSize: 16,
              boxShadow: "var(--shadow-md)",
            }}
          />
        </div>

        <motion.div
          initial="hidden"
          animate="visible"
          variants={{
            hidden: { opacity: 0 },
            visible: {
              opacity: 1,
              transition: { staggerChildren: 0.05, delayChildren: 0.2 },
            },
          }}
          style={{
            display: "flex",
            flexWrap: "wrap",
            gap: 10,
            justifyContent: "center",
            marginTop: 32,
            maxWidth: 600,
            margin: "32px auto 0",
          }}
        >
          {TAGS.map((tag) => (
            <motion.div
              key={tag}
              variants={{
                hidden: { opacity: 0, y: 10, scale: 0.9 },
                visible: { opacity: 1, y: 0, scale: 1 },
              }}
            >
              <Tag
                onClick={() => setSelTag(selTag === tag ? null : tag)}
                style={{
                  cursor: "pointer",
                  background:
                    selTag === tag
                      ? "var(--c-accent-muted)"
                      : "var(--c-glass-highlight)",
                  borderColor:
                    selTag === tag
                      ? "var(--c-accent)"
                      : "var(--c-glass-border)",
                  color:
                    selTag === tag
                      ? "var(--c-text-bright)"
                      : "var(--c-text-muted)",
                  borderRadius: 14,
                  padding: "8px 16px",
                  fontSize: 14,
                  fontWeight: 500,
                  transition: "all 0.2s",
                  margin: 0,
                }}
              >
                {selTag === tag && "✓ "}
                {tag}
              </Tag>
            </motion.div>
          ))}
        </motion.div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3 }}
        style={{ position: "relative", zIndex: 1 }}
      >
        {searchMode === "people" ? (
          /* People search results */
          searchLoading ? (
            <CommunityGridSkeleton />
          ) : search.length < 2 ? (
            <Empty
              description={
                <Text style={{ color: "var(--c-text-dim)" }}>
                  Type at least 2 characters to search for people
                </Text>
              }
              style={{ marginTop: 60 }}
            />
          ) : userResults.length === 0 ? (
            <Empty
              description={
                <Text style={{ color: "var(--c-text-dim)" }}>
                  No people found matching &quot;{search}&quot;
                </Text>
              }
              style={{ marginTop: 60 }}
            />
          ) : (
            <Row gutter={[16, 16]}>
              {userResults.map((u) => (
                <Col key={u.id} xs={24} sm={12} lg={8} xl={6}>
                  <motion.div
                    whileHover={{
                      y: -4,
                      boxShadow: "0 12px 32px rgba(0,0,0,0.2)",
                    }}
                    style={{
                      padding: 24,
                      borderRadius: 16,
                      background: "var(--c-bg-surface)",
                      border: "1px solid var(--c-glass-border)",
                      cursor: "pointer",
                      textAlign: "center",
                      transition: "border-color 0.2s",
                    }}
                    onClick={() =>
                      navigate(
                        `/dashboard/portfolio/${u.subtitle?.replace("@", "") ?? u.id}`,
                      )
                    }
                  >
                    <Avatar
                      size={64}
                      src={u.avatarUrl}
                      icon={<UserOutlined />}
                      style={{
                        background: "var(--c-accent)",
                        fontWeight: 700,
                        marginBottom: 12,
                      }}
                    />
                    <Text
                      style={{
                        color: "var(--c-text-bright)",
                        fontWeight: 600,
                        display: "block",
                        fontSize: 15,
                      }}
                    >
                      {u.title}
                    </Text>
                    {u.subtitle && (
                      <Text
                        style={{ color: "var(--c-text-dim)", fontSize: 12 }}
                      >
                        {u.subtitle}
                      </Text>
                    )}
                    <div style={{ marginTop: 12 }}>
                      {sentRequests.has(u.id) ? (
                        <Button
                          size="small"
                          disabled
                          style={{ borderRadius: 8, fontSize: 12 }}
                        >
                          Request Sent
                        </Button>
                      ) : (
                        <Tooltip title="Send friend request">
                          <Button
                            size="small"
                            icon={<UserAddOutlined />}
                            style={{ borderRadius: 8, fontSize: 12 }}
                            loading={sendFriendReqMut.isPending}
                            onClick={(e) => {
                              e.stopPropagation();
                              sendFriendReqMut.mutate(u.id);
                            }}
                          >
                            Add Friend
                          </Button>
                        </Tooltip>
                      )}
                    </div>
                  </motion.div>
                </Col>
              ))}
            </Row>
          )
        ) : (
          /* Community results (existing) */
          <>
            {isLoading ? (
              <CommunityGridSkeleton />
            ) : (
              <Row gutter={[20, 20]}>
                {filtered.map((c: any) => (
                  <Col key={c.slug ?? c.id} xs={24} sm={12} lg={8} xl={6}>
                    <CommunityCard
                      name={c.name}
                      slug={c.slug}
                      description={c.description}
                      avatarUrl={c.avatarUrl}
                      coverUrl={c.coverUrl}
                      memberCount={c.memberCount ?? 0}
                      tags={c.tags ?? []}
                      visibility={c.visibility ?? "public"}
                      onClick={() =>
                        navigate(`/dashboard/communities/${c.slug}`)
                      }
                    />
                  </Col>
                ))}
              </Row>
            )}
            {!isLoading && filtered.length === 0 && (
              <Empty
                description={
                  <Text style={{ color: "var(--c-text-dim)" }}>
                    No communities match
                  </Text>
                }
                style={{ marginTop: 60 }}
              />
            )}
          </>
        )}
      </motion.div>
    </div>
  );
};;

export default DiscoverPage;

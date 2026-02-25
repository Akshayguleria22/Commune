import React, { useState, useRef, useEffect } from 'react';
import {
  Typography,
  Input,
  Button,
  Avatar,
  Badge,
  Empty,
  Space,
  Tabs,
  message as antMsg,
  Skeleton,
} from "antd";
import {
  SendOutlined, UserAddOutlined, CheckOutlined, CloseOutlined,
  MessageOutlined, TeamOutlined, SearchOutlined, SmileOutlined,
} from '@ant-design/icons';
import { motion } from 'framer-motion';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { messagingApi } from '../../../api/messaging.api';
import { useAuthStore } from '../../../stores/auth.store';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';

dayjs.extend(relativeTime);

const { Title, Text } = Typography;

const MessagingPage: React.FC = () => {
  const { user: me } = useAuthStore();
  const queryClient = useQueryClient();
  const [selectedChannel, setSelectedChannel] = useState<any>(null);
  const [newMessage, setNewMessage] = useState('');
  const [friendSearch, setFriendSearch] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Queries
  const { data: friends = [], isLoading: friendsLoading } = useQuery({
    queryKey: ['friends'],
    queryFn: messagingApi.getFriends,
  });
  const { data: pending = [] } = useQuery({
    queryKey: ['friends-pending'],
    queryFn: messagingApi.getPendingRequests,
  });
  const { data: dmChannels = [], isLoading: channelsLoading } = useQuery({
    queryKey: ['dm-channels'],
    queryFn: messagingApi.getDMChannels,
  });
  const { data: messages = [], isLoading: msgsLoading } = useQuery({
    queryKey: ['dm-messages', selectedChannel?.channelId],
    queryFn: () => messagingApi.getMessages(selectedChannel!.channelId),
    enabled: !!selectedChannel?.channelId,
    refetchInterval: 5000,
  });

  // Mutations
  const respondMut = useMutation({
    mutationFn: ({ id, accept }: { id: string; accept: boolean }) =>
      messagingApi.respondToRequest(id, accept),
    onSuccess: (_, { accept }) => {
      queryClient.invalidateQueries({ queryKey: ['friends'] });
      queryClient.invalidateQueries({ queryKey: ['friends-pending'] });
      queryClient.invalidateQueries({ queryKey: ['dm-channels'] });
      antMsg.success(accept ? 'Friend request accepted!' : 'Request declined');
    },
  });
  const sendMut = useMutation({
    mutationFn: ({ channelId, content }: { channelId: string; content: string }) =>
      messagingApi.sendMessage(channelId, content),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['dm-messages', selectedChannel?.channelId] });
      setNewMessage('');
    },
  });

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = () => {
    if (!newMessage.trim() || !selectedChannel) return;
    sendMut.mutate({ channelId: selectedChannel.channelId, content: newMessage.trim() });
  };

  const cardStyle: React.CSSProperties = {
    background: 'var(--c-bg-surface)',
    border: '1px solid var(--c-glass-border)',
    borderRadius: 16,
    overflow: 'hidden',
  };

  return (
    <div
      style={{
        display: "flex",
        gap: 16,
        height: "calc(100vh - 140px)",
        position: "relative",
      }}
    >
      {/* Sidebar — Conversations list */}
      <div
        style={{
          ...cardStyle,
          width: 340,
          flexShrink: 0,
          display: "flex",
          flexDirection: "column",
        }}
      >
        {/* Header */}
        <div
          style={{
            padding: "20px 20px 12px",
            borderBottom: "1px solid var(--c-glass-border)",
          }}
        >
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              marginBottom: 16,
            }}
          >
            <Title
              level={4}
              style={{
                margin: 0,
                color: "var(--c-text-bright)",
                fontFamily: "'Outfit', sans-serif",
                fontWeight: 800,
              }}
            >
              <MessageOutlined
                style={{ marginRight: 10, color: "var(--c-accent)" }}
              />
              Messages
            </Title>
            {pending.length > 0 && (
              <Badge count={pending.length} size="small">
                <Button
                  type="text"
                  icon={<UserAddOutlined />}
                  style={{
                    color: "var(--c-text-muted)",
                    width: 32,
                    height: 32,
                  }}
                />
              </Badge>
            )}
          </div>
          <Input
            prefix={<SearchOutlined style={{ color: "var(--c-text-dim)" }} />}
            placeholder="Search conversations..."
            value={friendSearch}
            onChange={(e) => setFriendSearch(e.target.value)}
            style={{
              borderRadius: 10,
              background: "var(--c-glass-highlight)",
              border: "1px solid var(--c-glass-border)",
            }}
          />
        </div>

        {/* Tabs */}
        <Tabs
          defaultActiveKey="dms"
          size="small"
          style={{ flex: 1, display: "flex", flexDirection: "column" }}
          tabBarStyle={{ padding: "0 16px", marginBottom: 0 }}
          items={[
            {
              key: "dms",
              label: (
                <span>
                  <MessageOutlined /> DMs
                </span>
              ),
              children: (
                <div style={{ flex: 1, overflowY: "auto", padding: "4px 0" }}>
                  {channelsLoading ? (
                    <div style={{ padding: "12px 20px" }}>
                      {Array.from({ length: 4 }).map((_, i) => (
                        <div
                          key={i}
                          style={{
                            display: "flex",
                            gap: 12,
                            padding: "8px 0",
                            alignItems: "center",
                          }}
                        >
                          <Skeleton.Avatar active size={40} />
                          <div style={{ flex: 1 }}>
                            <Skeleton
                              active
                              paragraph={{ rows: 1, width: "80%" }}
                              title={{ width: "50%" }}
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : dmChannels.length === 0 ? (
                    <Empty
                      image={Empty.PRESENTED_IMAGE_SIMPLE}
                      description={
                        <Text style={{ color: "var(--c-text-dim)" }}>
                          No conversations yet
                        </Text>
                      }
                      style={{ marginTop: 40 }}
                    />
                  ) : (
                    dmChannels
                      .filter(
                        (c: any) =>
                          !friendSearch ||
                          c.friend.displayName
                            .toLowerCase()
                            .includes(friendSearch.toLowerCase()),
                      )
                      .map((ch: any) => (
                        <motion.div
                          key={ch.channelId}
                          whileHover={{ backgroundColor: "var(--c-bg-hover)" }}
                          onClick={() => setSelectedChannel(ch)}
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: 12,
                            padding: "12px 20px",
                            cursor: "pointer",
                            background:
                              selectedChannel?.channelId === ch.channelId
                                ? "var(--c-accent-muted)"
                                : "transparent",
                            borderLeft:
                              selectedChannel?.channelId === ch.channelId
                                ? "3px solid var(--c-accent)"
                                : "3px solid transparent",
                            transition: "all 0.15s",
                          }}
                        >
                          <Avatar
                            src={ch.friend.avatarUrl}
                            size={40}
                            style={{
                              background: "var(--c-accent)",
                              fontWeight: 600,
                              flexShrink: 0,
                            }}
                          >
                            {ch.friend.displayName[0]}
                          </Avatar>
                          <div style={{ flex: 1, minWidth: 0 }}>
                            <Text
                              style={{
                                color: "var(--c-text-bright)",
                                fontWeight: 600,
                                display: "block",
                                fontSize: 14,
                              }}
                              ellipsis
                            >
                              {ch.friend.displayName}
                            </Text>
                            {ch.lastMessage && (
                              <Text
                                style={{
                                  color: "var(--c-text-dim)",
                                  fontSize: 12,
                                }}
                                ellipsis
                              >
                                {ch.lastMessage.authorId === me?.id
                                  ? "You: "
                                  : ""}
                                {ch.lastMessage.content}
                              </Text>
                            )}
                          </div>
                          {ch.lastMessage && (
                            <Text
                              style={{
                                color: "var(--c-text-ghost)",
                                fontSize: 10,
                                whiteSpace: "nowrap",
                              }}
                            >
                              {dayjs(ch.lastMessage.createdAt).fromNow(true)}
                            </Text>
                          )}
                        </motion.div>
                      ))
                  )}
                </div>
              ),
            },
            {
              key: "friends",
              label: (
                <span>
                  <TeamOutlined /> Friends (
                  {Array.isArray(friends) ? friends.length : 0})
                </span>
              ),
              children: (
                <div style={{ flex: 1, overflowY: "auto", padding: "4px 0" }}>
                  {/* Pending requests */}
                  {pending.length > 0 && (
                    <div
                      style={{
                        padding: "8px 20px",
                        borderBottom: "1px solid var(--c-glass-border)",
                      }}
                    >
                      <Text
                        style={{
                          color: "var(--c-text-dim)",
                          fontSize: 11,
                          fontWeight: 600,
                          textTransform: "uppercase",
                          letterSpacing: 1,
                        }}
                      >
                        Pending Requests ({pending.length})
                      </Text>
                      {pending.map((p: any) => (
                        <div
                          key={p.id}
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: 10,
                            padding: "10px 0",
                          }}
                        >
                          <Avatar
                            src={p.requester?.avatarUrl}
                            size={32}
                            style={{ background: "var(--c-accent)" }}
                          >
                            {p.requester?.displayName?.[0] ?? "?"}
                          </Avatar>
                          <div style={{ flex: 1 }}>
                            <Text
                              style={{
                                color: "var(--c-text-bright)",
                                fontSize: 13,
                                fontWeight: 600,
                              }}
                            >
                              {p.requester?.displayName}
                            </Text>
                          </div>
                          <Space size={4}>
                            <Button
                              type="primary"
                              size="small"
                              icon={<CheckOutlined />}
                              onClick={() =>
                                respondMut.mutate({ id: p.id, accept: true })
                              }
                              style={{
                                background: "var(--c-success)",
                                border: "none",
                                borderRadius: 8,
                              }}
                            />
                            <Button
                              size="small"
                              icon={<CloseOutlined />}
                              onClick={() =>
                                respondMut.mutate({ id: p.id, accept: false })
                              }
                              style={{ borderRadius: 8 }}
                            />
                          </Space>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Friends list */}
                  {friendsLoading ? (
                    <div style={{ padding: "12px 20px" }}>
                      {Array.from({ length: 3 }).map((_, i) => (
                        <div
                          key={i}
                          style={{
                            display: "flex",
                            gap: 12,
                            padding: "8px 0",
                            alignItems: "center",
                          }}
                        >
                          <Skeleton.Avatar active size={36} />
                          <div style={{ flex: 1 }}>
                            <Skeleton
                              active
                              paragraph={{ rows: 1 }}
                              title={{ width: "40%" }}
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : !Array.isArray(friends) || friends.length === 0 ? (
                    <Empty
                      image={Empty.PRESENTED_IMAGE_SIMPLE}
                      description={
                        <Text style={{ color: "var(--c-text-dim)" }}>
                          No friends yet. Join communities to meet people!
                        </Text>
                      }
                      style={{ marginTop: 40 }}
                    />
                  ) : (
                    friends.map((f: any) => {
                      const friend =
                        f.requesterId === me?.id ? f.addressee : f.requester;
                      return (
                        <div
                          key={f.id}
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: 12,
                            padding: "10px 20px",
                            cursor: "pointer",
                          }}
                        >
                          <Avatar
                            src={friend?.avatarUrl}
                            size={36}
                            style={{
                              background: "var(--c-accent)",
                              fontWeight: 600,
                            }}
                          >
                            {friend?.displayName?.[0] ?? "?"}
                          </Avatar>
                          <div style={{ flex: 1 }}>
                            <Text
                              style={{
                                color: "var(--c-text-bright)",
                                fontWeight: 600,
                                fontSize: 14,
                              }}
                            >
                              {friend?.displayName}
                            </Text>
                            <Text
                              style={{
                                color: "var(--c-text-dim)",
                                fontSize: 12,
                                display: "block",
                              }}
                            >
                              @{friend?.username}
                            </Text>
                          </div>
                          {f.dmChannelId && (
                            <Button
                              type="text"
                              icon={<MessageOutlined />}
                              onClick={() => {
                                const ch = dmChannels.find(
                                  (c: any) => c.channelId === f.dmChannelId,
                                );
                                if (ch) setSelectedChannel(ch);
                              }}
                              style={{ color: "var(--c-accent)" }}
                            />
                          )}
                        </div>
                      );
                    })
                  )}
                </div>
              ),
            },
          ]}
        />
      </div>

      {/* Chat area */}
      <div
        style={{
          ...cardStyle,
          flex: 1,
          display: "flex",
          flexDirection: "column",
        }}
      >
        {!selectedChannel ? (
          <div
            style={{
              flex: 1,
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              gap: 16,
            }}
          >
            <div
              style={{
                width: 80,
                height: 80,
                borderRadius: 24,
                background: "var(--c-accent-muted)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <MessageOutlined
                style={{ fontSize: 32, color: "var(--c-accent)" }}
              />
            </div>
            <Title
              level={4}
              style={{
                color: "var(--c-text-bright)",
                margin: 0,
                fontFamily: "'Outfit'",
              }}
            >
              Your Messages
            </Title>
            <Text
              style={{
                color: "var(--c-text-muted)",
                textAlign: "center",
                maxWidth: 300,
              }}
            >
              Select a conversation from the sidebar to start chatting with
              friends.
            </Text>
          </div>
        ) : (
          <>
            {/* Chat header */}
            <div
              style={{
                padding: "16px 24px",
                borderBottom: "1px solid var(--c-glass-border)",
                display: "flex",
                alignItems: "center",
                gap: 12,
              }}
            >
              <Avatar
                src={selectedChannel.friend.avatarUrl}
                size={40}
                style={{ background: "var(--c-accent)", fontWeight: 600 }}
              >
                {selectedChannel.friend.displayName[0]}
              </Avatar>
              <div>
                <Text
                  style={{
                    color: "var(--c-text-bright)",
                    fontWeight: 700,
                    fontSize: 16,
                    display: "block",
                  }}
                >
                  {selectedChannel.friend.displayName}
                </Text>
                <Text style={{ color: "var(--c-text-dim)", fontSize: 12 }}>
                  @{selectedChannel.friend.username}
                </Text>
              </div>
            </div>

            {/* Messages */}
            <div
              style={{
                flex: 1,
                overflowY: "auto",
                padding: "16px 24px",
                display: "flex",
                flexDirection: "column",
                gap: 12,
              }}
            >
              {msgsLoading ? (
                <div style={{ padding: "16px 0" }}>
                  {Array.from({ length: 5 }).map((_, i) => (
                    <div
                      key={i}
                      style={{
                        display: "flex",
                        gap: 10,
                        marginBottom: 16,
                        justifyContent: i % 2 === 0 ? "flex-start" : "flex-end",
                      }}
                    >
                      {i % 2 === 0 && <Skeleton.Avatar active size={28} />}
                      <Skeleton.Button
                        active
                        shape="round"
                        style={{
                          width: 150 + i * 25,
                          height: 32,
                          borderRadius: 12,
                        }}
                      />
                    </div>
                  ))}
                </div>
              ) : messages.length === 0 ? (
                <div
                  style={{
                    flex: 1,
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: 8,
                  }}
                >
                  <SmileOutlined
                    style={{ fontSize: 36, color: "var(--c-text-dim)" }}
                  />
                  <Text style={{ color: "var(--c-text-dim)" }}>
                    No messages yet. Say hello!
                  </Text>
                </div>
              ) : (
                <>
                  {messages.map((msg: any, i: number) => {
                    const isMe = msg.authorId === me?.id;
                    return (
                      <motion.div
                        key={msg.id ?? i}
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        style={{
                          display: "flex",
                          flexDirection: isMe ? "row-reverse" : "row",
                          gap: 10,
                          alignItems: "flex-end",
                        }}
                      >
                        {!isMe && (
                          <Avatar
                            src={selectedChannel.friend.avatarUrl}
                            size={32}
                            style={{
                              background: "var(--c-accent)",
                              flexShrink: 0,
                              fontWeight: 600,
                            }}
                          >
                            {selectedChannel.friend.displayName[0]}
                          </Avatar>
                        )}
                        <div
                          style={{
                            maxWidth: "65%",
                            padding: "10px 16px",
                            borderRadius: isMe
                              ? "16px 16px 4px 16px"
                              : "16px 16px 16px 4px",
                            background: isMe
                              ? "linear-gradient(135deg, rgba(124,106,239,0.2), rgba(124,106,239,0.35))"
                              : "var(--c-glass-highlight)",
                            border: isMe
                              ? "1px solid rgba(124,106,239,0.3)"
                              : "1px solid var(--c-glass-border)",
                          }}
                        >
                          <Text
                            style={{
                              color: "var(--c-text-bright)",
                              fontSize: 14,
                              lineHeight: 1.5,
                              wordBreak: "break-word",
                            }}
                          >
                            {msg.content}
                          </Text>
                          <div style={{ textAlign: "right", marginTop: 4 }}>
                            <Text
                              style={{
                                color: "var(--c-text-ghost)",
                                fontSize: 10,
                              }}
                            >
                              {dayjs(msg.createdAt).format("HH:mm")}
                            </Text>
                          </div>
                        </div>
                      </motion.div>
                    );
                  })}
                  <div ref={messagesEndRef} />
                </>
              )}
            </div>

            {/* Input */}
            <div
              style={{
                padding: "12px 24px 16px",
                borderTop: "1px solid var(--c-glass-border)",
                display: "flex",
                gap: 12,
                alignItems: "flex-end",
              }}
            >
              <Input.TextArea
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    handleSend();
                  }
                }}
                placeholder="Type a message..."
                autoSize={{ minRows: 1, maxRows: 4 }}
                style={{
                  flex: 1,
                  borderRadius: 14,
                  background: "var(--c-glass-highlight)",
                  border: "1px solid var(--c-glass-border)",
                  fontSize: 14,
                  resize: "none",
                }}
              />
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Button
                  type="primary"
                  shape="circle"
                  icon={<SendOutlined />}
                  onClick={handleSend}
                  loading={sendMut.isPending}
                  disabled={!newMessage.trim()}
                  style={{
                    background: "var(--c-accent)",
                    border: "none",
                    width: 44,
                    height: 44,
                    boxShadow: newMessage.trim()
                      ? "0 4px 16px rgba(124,106,239,0.3)"
                      : "none",
                  }}
                />
              </motion.div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default MessagingPage;

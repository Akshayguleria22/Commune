import React from 'react';
import { Typography, Button, Empty } from "antd";
import {
  BellOutlined,
  CheckOutlined,
  TeamOutlined,
  CalendarOutlined,
  MessageOutlined,
  UserAddOutlined,
  ProjectOutlined,
} from '@ant-design/icons';
import { motion } from 'framer-motion';
import { NotificationsSkeleton } from "../../../shared/components";
import { useNotifications, useMarkAsRead, useMarkAllRead, useUnreadCount } from '../../../shared/hooks/useNotifications';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';

dayjs.extend(relativeTime);

const { Title, Text } = Typography;

const NOTIF_ICON_MAP: Record<string, React.ReactNode> = {
  community_invite: <TeamOutlined style={{ color: 'var(--c-accent)' }} />,
  community_join: <UserAddOutlined style={{ color: 'var(--c-success)' }} />,
  event_reminder: <CalendarOutlined style={{ color: 'var(--c-warning)' }} />,
  task_assigned: <ProjectOutlined style={{ color: '#3B82F6' }} />,
  task_completed: <CheckOutlined style={{ color: 'var(--c-success)' }} />,
  message: <MessageOutlined style={{ color: 'var(--c-accent-2, #36BFAA)' }} />,
  mention: <MessageOutlined style={{ color: 'var(--c-accent)' }} />,
};

const NotificationsPage: React.FC = () => {
  const { data: notifications, isLoading } = useNotifications({ limit: 50 });
  const { data: unreadData } = useUnreadCount();
  const markRead = useMarkAsRead();
  const markAllRead = useMarkAllRead();
  const unreadCount = unreadData?.count ?? 0;

  const notifList: any[] = Array.isArray(notifications)
    ? notifications
    : (notifications as any)?.items ?? [];

  return (
    <div style={{ position: "relative", maxWidth: 720, margin: "0 auto" }}>
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: 32,
        }}
      >
        <div>
          <Title
            level={2}
            style={{
              color: "var(--c-text-bright)",
              margin: 0,
              fontFamily: "'Outfit', sans-serif",
              fontWeight: 800,
              fontSize: 36,
              letterSpacing: -0.5,
            }}
          >
            <BellOutlined
              style={{ marginRight: 14, color: "var(--c-accent)" }}
            />
            Notifications
          </Title>
          <Text
            style={{
              color: "var(--c-text-muted)",
              fontSize: 15,
              display: "block",
              marginTop: 6,
            }}
          >
            {unreadCount > 0 ? `${unreadCount} unread` : "All caught up!"}
          </Text>
        </div>

        {unreadCount > 0 && (
          <Button
            icon={<CheckOutlined />}
            onClick={() => markAllRead.mutate()}
            loading={markAllRead.isPending}
            style={{
              background: "var(--c-glass-highlight)",
              borderColor: "var(--c-glass-border)",
              color: "var(--c-text-muted)",
              borderRadius: 12,
              height: 40,
              fontWeight: 600,
            }}
          >
            Mark all read
          </Button>
        )}
      </motion.div>

      {/* Notifications List */}
      {isLoading ? (
        <NotificationsSkeleton />
      ) : notifList.length === 0 ? (
        <Empty
          image={
            <BellOutlined
              style={{ fontSize: 48, color: "var(--c-text-dim)" }}
            />
          }
          description={
            <Text style={{ color: "var(--c-text-dim)" }}>
              No notifications yet. Activity from your communities will show up
              here.
            </Text>
          }
          style={{ marginTop: 80 }}
        />
      ) : (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          style={{ display: "flex", flexDirection: "column", gap: 8 }}
        >
          {notifList.map((notif: any, idx: number) => {
            const isRead = notif.readAt || notif.isRead;
            const icon = NOTIF_ICON_MAP[notif.type] ?? (
              <BellOutlined style={{ color: "var(--c-text-dim)" }} />
            );

            return (
              <motion.div
                key={notif.id ?? idx}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.03 }}
                style={{
                  display: "flex",
                  alignItems: "flex-start",
                  gap: 14,
                  padding: "14px 18px",
                  borderRadius: 14,
                  background: isRead
                    ? "transparent"
                    : "var(--c-glass-highlight)",
                  border: `1px solid ${isRead ? "var(--c-glass-border)" : "rgba(124,106,239,0.15)"}`,
                  cursor: isRead ? "default" : "pointer",
                  transition: "all 0.2s",
                }}
                onClick={() => {
                  if (!isRead && notif.id) markRead.mutate(notif.id);
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = "var(--c-glass-highlight)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = isRead
                    ? "transparent"
                    : "var(--c-glass-highlight)";
                }}
              >
                {/* Icon */}
                <div
                  style={{
                    width: 38,
                    height: 38,
                    borderRadius: 10,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    background: "var(--c-bg-surface)",
                    border: "1px solid var(--c-glass-border)",
                    fontSize: 16,
                    flexShrink: 0,
                  }}
                >
                  {icon}
                </div>

                {/* Content */}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <Text
                    style={{
                      color: isRead
                        ? "var(--c-text-muted)"
                        : "var(--c-text-bright)",
                      fontWeight: isRead ? 400 : 600,
                      display: "block",
                      fontSize: 14,
                      lineHeight: 1.5,
                    }}
                  >
                    {notif.title ?? notif.message ?? "Notification"}
                  </Text>
                  {notif.body && (
                    <Text
                      style={{
                        color: "var(--c-text-dim)",
                        fontSize: 12,
                        display: "block",
                        marginTop: 2,
                      }}
                    >
                      {notif.body}
                    </Text>
                  )}
                  <Text
                    style={{
                      color: "var(--c-text-ghost)",
                      fontSize: 11,
                      marginTop: 4,
                      display: "block",
                    }}
                  >
                    {notif.createdAt ? dayjs(notif.createdAt).fromNow() : ""}
                  </Text>
                </div>

                {/* Unread dot */}
                {!isRead && (
                  <div
                    style={{
                      width: 8,
                      height: 8,
                      borderRadius: "50%",
                      background: "var(--c-accent)",
                      flexShrink: 0,
                      marginTop: 6,
                      boxShadow: "0 0 8px rgba(124,106,239,0.4)",
                    }}
                  />
                )}
              </motion.div>
            );
          })}
        </motion.div>
      )}
    </div>
  );
};

export default NotificationsPage;

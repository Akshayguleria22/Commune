import React, { useEffect, useCallback } from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { Layout, Menu, Avatar, Dropdown, Space, Badge, Button, Tooltip, Modal, Input, List, Typography, Tag, Empty } from 'antd';
import {
  TeamOutlined,
  CompassOutlined,
  CalendarOutlined,
  ProjectOutlined,
  UserOutlined,
  BellOutlined,
  SearchOutlined,
  MenuFoldOutlined,
  MenuUnfoldOutlined,
  LogoutOutlined,
  SettingOutlined,
  MessageOutlined,
  HomeOutlined,
  PlusOutlined,
} from "@ant-design/icons";
import { motion } from "framer-motion";
import { useAuthStore } from '../stores/auth.store';
import { useUIStore } from '../stores/ui.store';
import { useSearch } from '../shared/hooks/useSearch';
import { useUnreadCount } from '../shared/hooks/useNotifications';
import CommuneLogo from "../shared/components/CommuneLogo";

const { Header, Sider, Content } = Layout;
const { Text } = Typography;

const AppLayout: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useAuthStore();
  const { sidebarCollapsed, toggleSidebar, theme, setTheme } = useUIStore();
  const search = useSearch();
  const { data: unreadData } = useUnreadCount();
  const unreadCount = unreadData?.count ?? 0;

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') { e.preventDefault(); search.open(); }
      if (e.key === 'Escape') search.close();
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [search]);

  const handleSearchSelect = useCallback((type: string, id: string) => {
    search.close();
    if (type === 'community') navigate(`/dashboard/communities/${id}`);
    else if (type === 'event') navigate(`/dashboard/events`);
    else if (type === 'task') navigate(`/dashboard/tasks`);
  }, [navigate, search]);

  const isDark = theme === 'dark';

  const menuItems = [
    {
      key: "/dashboard",
      icon: <HomeOutlined />,
      label: "Home",
    },
    {
      key: "/dashboard/communities",
      icon: <TeamOutlined />,
      label: "Communities",
    },
    {
      key: "/dashboard/discover",
      icon: <CompassOutlined />,
      label: "Discover",
    },
    { key: "/dashboard/tasks", icon: <ProjectOutlined />, label: "Tasks" },
    { key: "/dashboard/events", icon: <CalendarOutlined />, label: "Events" },
    {
      key: `/dashboard/portfolio/${user?.username}`,
      icon: <UserOutlined />,
      label: "Portfolio",
    },
    {
      key: "/dashboard/messages",
      icon: <MessageOutlined />,
      label: "Messages",
    },
  ];

  const userMenuItems = [
    { key: 'profile', icon: <UserOutlined />, label: 'Profile', onClick: () => navigate(`/dashboard/portfolio/${user?.username}`) },
    { key: 'settings', icon: <SettingOutlined />, label: 'Settings', onClick: () => navigate('/dashboard/settings') },
    { type: 'divider' as const },
    { key: 'logout', icon: <LogoutOutlined />, label: 'Logout', danger: true, onClick: () => { logout(); navigate('/'); } },
  ];

  return (
    <Layout style={{ minHeight: "100vh", background: "var(--c-bg-void)" }}>
      {/* Subtle ambient gradient — single, static, non-distracting */}
      <div
        style={{
          position: "fixed",
          inset: 0,
          pointerEvents: "none",
          zIndex: 0,
          background: isDark
            ? "radial-gradient(ellipse 80% 60% at 20% 10%, rgba(124,106,239,0.04) 0%, transparent 60%), radial-gradient(ellipse 60% 50% at 80% 90%, rgba(54,191,170,0.03) 0%, transparent 60%)"
            : "none",
        }}
      />

      {/* Sidebar */}
      <Sider
        trigger={null}
        collapsible
        collapsed={sidebarCollapsed}
        width={240}
        collapsedWidth={72}
        style={{
          background: "var(--c-bg-deep)",
          borderRight: "1px solid var(--c-glass-border)",
          position: "fixed",
          left: 0,
          top: 0,
          bottom: 0,
          zIndex: 100,
          transition: "width 0.3s var(--ease-out)",
        }}
      >
        {/* Logo */}
        <div
          style={{
            height: 64,
            display: "flex",
            alignItems: "center",
            justifyContent: sidebarCollapsed ? "center" : "flex-start",
            padding: sidebarCollapsed ? "0" : "0 24px",
            borderBottom: "1px solid var(--c-glass-border)",
            cursor: "pointer",
          }}
          onClick={() => navigate("/")}
        >
          <CommuneLogo
            size={sidebarCollapsed ? 26 : 24}
            collapsed={sidebarCollapsed}
          />
        </div>

        {/* Navigation */}
        <div style={{ padding: "16px 10px" }}>
          <Menu
            theme={isDark ? "dark" : "light"}
            mode="inline"
            selectedKeys={[location.pathname]}
            items={menuItems}
            onClick={({ key }) => navigate(key)}
            style={{
              background: "transparent",
              borderRight: "none",
              fontSize: 14,
              fontWeight: 500,
            }}
          />
        </div>

        {/* Bottom user pill */}
        {!sidebarCollapsed && (
          <div
            style={{
              position: "absolute",
              bottom: 16,
              left: 12,
              right: 12,
              padding: "10px 12px",
              borderRadius: 10,
              background: "var(--c-glass-highlight)",
              border: "1px solid var(--c-glass-border)",
              display: "flex",
              alignItems: "center",
              gap: 10,
              cursor: "pointer",
              transition: "background 0.2s",
            }}
            onClick={() => navigate(`/dashboard/portfolio/${user?.username}`)}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = "var(--c-bg-hover)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = "var(--c-glass-highlight)";
            }}
          >
            <Avatar
              src={user?.avatarUrl}
              size={32}
              style={{
                background: "var(--c-accent)",
                fontWeight: 700,
                fontSize: 13,
              }}
            >
              {user?.displayName?.[0] || "U"}
            </Avatar>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div
                style={{
                  color: "var(--c-text-bright)",
                  fontSize: 13,
                  fontWeight: 600,
                  lineHeight: 1.2,
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  whiteSpace: "nowrap",
                }}
              >
                {user?.displayName}
              </div>
              <div style={{ color: "var(--c-text-dim)", fontSize: 11 }}>
                @{user?.username}
              </div>
            </div>
          </div>
        )}
      </Sider>

      {/* Main area */}
      <Layout
        style={{
          marginLeft: sidebarCollapsed ? 72 : 240,
          transition: "margin-left 0.3s var(--ease-out)",
          background: "transparent",
        }}
      >
        {/* Header */}
        <Header
          style={{
            background: "var(--c-bg-deep)",
            borderBottom: "1px solid var(--c-glass-border)",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            padding: "0 28px",
            position: "sticky",
            top: 0,
            zIndex: 99,
            height: 64,
            lineHeight: "normal",
          }}
        >
          <Space size={16}>
            <Button
              type="text"
              icon={
                sidebarCollapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />
              }
              onClick={toggleSidebar}
              style={{
                color: "var(--c-text-muted)",
                fontSize: 16,
                width: 36,
                height: 36,
                borderRadius: 8,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            />

            {/* Search trigger */}
            <div
              onClick={search.open}
              style={{
                display: "flex",
                alignItems: "center",
                background: "var(--c-glass-highlight)",
                border: "1px solid var(--c-glass-border)",
                borderRadius: 10,
                padding: "0 14px",
                height: 38,
                width: 320,
                maxWidth: "35vw",
                cursor: "pointer",
                transition: "border-color 0.2s",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor =
                  "var(--c-glass-border-hover)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = "var(--c-glass-border)";
              }}
            >
              <SearchOutlined
                style={{ color: "var(--c-text-dim)", fontSize: 14 }}
              />
              <span
                style={{
                  color: "var(--c-text-dim)",
                  padding: "0 10px",
                  fontSize: 13,
                  fontWeight: 500,
                  flex: 1,
                }}
              >
                Search...
              </span>
              <kbd
                style={{
                  background: "var(--c-bg-hover)",
                  padding: "2px 6px",
                  borderRadius: 4,
                  fontSize: 11,
                  color: "var(--c-text-dim)",
                  fontWeight: 600,
                  fontFamily: "'Inter', sans-serif",
                  border: "1px solid var(--c-glass-border)",
                }}
              >
                Ctrl K
              </kbd>
            </div>
          </Space>

          <Space size={8}>
            <Tooltip title={isDark ? "Light mode" : "Dark mode"}>
              <Button
                type="text"
                onClick={() => setTheme(isDark ? "light" : "dark")}
                style={{
                  color: "var(--c-text-muted)",
                  fontSize: 16,
                  width: 36,
                  height: 36,
                  borderRadius: 8,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                {isDark ? "☀️" : "🌙"}
              </Button>
            </Tooltip>

            <Tooltip title="Notifications">
              <Badge count={unreadCount} size="small" offset={[-2, 2]}>
                <Button
                  type="text"
                  icon={<BellOutlined />}
                  style={{
                    color: "var(--c-text-muted)",
                    fontSize: 16,
                    width: 36,
                    height: 36,
                    borderRadius: 8,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                  onClick={() => navigate("/dashboard/notifications")}
                />
              </Badge>
            </Tooltip>

            {/* User dropdown */}
            <Dropdown
              menu={{ items: userMenuItems }}
              placement="bottomRight"
              trigger={["click"]}
            >
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 8,
                  cursor: "pointer",
                  padding: "4px 12px 4px 4px",
                  borderRadius: 20,
                  border: "1px solid var(--c-glass-border)",
                  transition: "border-color 0.2s",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor =
                    "var(--c-glass-border-hover)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = "var(--c-glass-border)";
                }}
              >
                <Avatar
                  src={user?.avatarUrl}
                  icon={<UserOutlined />}
                  size={30}
                  style={{
                    background: "var(--c-accent)",
                    fontWeight: 700,
                    flexShrink: 0,
                  }}
                />
                <span
                  style={{
                    color: "var(--c-text-bright)",
                    fontSize: 13,
                    fontWeight: 600,
                    maxWidth: 100,
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    whiteSpace: "nowrap",
                  }}
                >
                  {user?.displayName}
                </span>
              </div>
            </Dropdown>
          </Space>
        </Header>

        {/* Content */}
        <Content
          style={{
            padding: "24px 32px",
            minHeight: "calc(100vh - 64px)",
            position: "relative",
            zIndex: 1,
            display: "flex",
            flexDirection: "column",
          }}
        >
          <motion.div
            key={location.pathname}
            initial={{ opacity: 0, y: 12, scale: 0.995 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
            style={{ flex: 1, display: "flex", flexDirection: "column" }}
          >
            <Outlet />
          </motion.div>

          {/* Footer */}
          <footer
            style={{
              borderTop: "1px solid var(--c-glass-border)",
              padding: "24px 0 16px",
              marginTop: "auto",
              textAlign: "center",
            }}
          >
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                flexWrap: "wrap",
                gap: 16,
              }}
            >
              <span
                style={{
                  fontFamily: "'Outfit', sans-serif",
                  fontWeight: 700,
                  fontSize: 14,
                  color: "var(--c-text-dim)",
                  letterSpacing: 2,
                }}
              >
                COMMUNE{" "}
                <span style={{ fontWeight: 400, letterSpacing: 0 }}>
                  © {new Date().getFullYear()}
                </span>
              </span>
              <Space size={20}>
                <a
                  onClick={() => navigate("/dashboard/discover")}
                  style={{
                    color: "var(--c-text-dim)",
                    fontSize: 12,
                    cursor: "pointer",
                    fontWeight: 500,
                  }}
                >
                  Discover
                </a>
                <a
                  onClick={() => navigate("/dashboard/events")}
                  style={{
                    color: "var(--c-text-dim)",
                    fontSize: 12,
                    cursor: "pointer",
                    fontWeight: 500,
                  }}
                >
                  Events
                </a>
                <a
                  href="#"
                  style={{
                    color: "var(--c-text-dim)",
                    fontSize: 12,
                    fontWeight: 500,
                  }}
                >
                  Docs
                </a>
                <a
                  href="#"
                  style={{
                    color: "var(--c-text-dim)",
                    fontSize: 12,
                    fontWeight: 500,
                  }}
                >
                  Privacy
                </a>
              </Space>
            </div>
          </footer>
        </Content>
      </Layout>

      {/* Search Modal */}
      <Modal
        open={search.isOpen}
        onCancel={search.close}
        footer={null}
        closable={false}
        width={560}
        style={{ top: 80 }}
        styles={{ body: { padding: 0 } }}
      >
        <div
          style={{
            padding: "12px 16px",
            borderBottom: "1px solid var(--c-glass-border)",
          }}
        >
          <Input
            prefix={
              <SearchOutlined
                style={{ color: "var(--c-text-dim)", fontSize: 16 }}
              />
            }
            placeholder="Search communities, events, tasks..."
            value={search.query}
            onChange={(e) => search.setQuery(e.target.value)}
            autoFocus
            size="large"
            variant="borderless"
            style={{ fontSize: 15, fontWeight: 500 }}
          />
        </div>
        <div style={{ maxHeight: 380, overflowY: "auto", padding: "4px 0" }}>
          {search.query.length < 2 ? (
            <div style={{ padding: "16px" }}>
              <Text
                style={{
                  color: "var(--c-text-muted)",
                  fontSize: 12,
                  fontWeight: 600,
                  letterSpacing: 1,
                  marginBottom: 8,
                  display: "block",
                }}
              >
                QUICK ACTIONS
              </Text>
              <List
                dataSource={[
                  {
                    icon: <PlusOutlined />,
                    title: "Create Community",
                    action: () => {
                      search.close();
                      navigate("/dashboard/communities");
                    },
                  },
                  {
                    icon: <ProjectOutlined />,
                    title: "New Task",
                    action: () => {
                      search.close();
                      navigate("/dashboard/tasks");
                    },
                  },
                  {
                    icon: <CalendarOutlined />,
                    title: "New Event",
                    action: () => {
                      search.close();
                      navigate("/dashboard/events");
                    },
                  },
                  {
                    icon: <HomeOutlined />,
                    title: "Go to Command Center",
                    action: () => {
                      search.close();
                      navigate("/dashboard");
                    },
                  },
                  {
                    icon: <CompassOutlined />,
                    title: "Discover",
                    action: () => {
                      search.close();
                      navigate("/dashboard/discover");
                    },
                  },
                ]}
                renderItem={(item: any) => (
                  <List.Item
                    style={{
                      padding: "10px 16px",
                      cursor: "pointer",
                      borderBottom: 0,
                      borderRadius: 8,
                    }}
                    onClick={item.action}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.background =
                        "var(--c-accent-muted)";
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.background = "transparent";
                    }}
                  >
                    <Space size={12}>
                      <div style={{ color: "var(--c-text-dim)", fontSize: 16 }}>
                        {item.icon}
                      </div>
                      <Text
                        style={{ color: "var(--c-text-bright)", fontSize: 14 }}
                      >
                        {item.title}
                      </Text>
                    </Space>
                    <Text style={{ color: "var(--c-text-dim)", fontSize: 12 }}>
                      Jump to
                    </Text>
                  </List.Item>
                )}
              />
            </div>
          ) : search.isLoading ? (
            <div style={{ padding: "36px 16px", textAlign: "center" }}>
              <Text style={{ color: "var(--c-text-dim)", fontSize: 13 }}>
                Searching...
              </Text>
            </div>
          ) : search.results.length === 0 ? (
            <Empty description="No results" style={{ padding: 28 }} />
          ) : (
            <List
              dataSource={search.results}
              renderItem={(item: any) => (
                <List.Item
                  style={{
                    padding: "8px 16px",
                    cursor: "pointer",
                    borderBottom: "1px solid var(--c-glass-border)",
                  }}
                  onClick={() => handleSearchSelect(item.type, item.id)}
                >
                  <List.Item.Meta
                    avatar={
                      <Avatar
                        size={32}
                        style={{
                          background:
                            item.type === "community"
                              ? "var(--c-accent-muted)"
                              : item.type === "event"
                                ? "var(--c-warning-muted)"
                                : "var(--c-success-muted)",
                          color:
                            item.type === "community"
                              ? "var(--c-accent)"
                              : item.type === "event"
                                ? "var(--c-warning)"
                                : "var(--c-success)",
                        }}
                      >
                        {item.type === "community" ? (
                          <TeamOutlined />
                        ) : item.type === "event" ? (
                          <CalendarOutlined />
                        ) : (
                          <ProjectOutlined />
                        )}
                      </Avatar>
                    }
                    title={
                      <span
                        style={{ color: "var(--c-text-bright)", fontSize: 14 }}
                      >
                        {item.title}
                      </span>
                    }
                    description={
                      <Space size={6}>
                        <Tag
                          style={{ fontSize: 10, margin: 0 }}
                          color={
                            item.type === "community"
                              ? "purple"
                              : item.type === "event"
                                ? "gold"
                                : "green"
                          }
                        >
                          {item.type}
                        </Tag>
                        {item.subtitle && (
                          <Text
                            style={{ color: "var(--c-text-dim)", fontSize: 11 }}
                            ellipsis
                          >
                            {item.subtitle}
                          </Text>
                        )}
                      </Space>
                    }
                  />
                </List.Item>
              )}
            />
          )}
        </div>
      </Modal>
    </Layout>
  );
};

export default AppLayout;

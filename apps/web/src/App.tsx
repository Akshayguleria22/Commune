import { BrowserRouter, Routes, Route, Navigate, useParams } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ConfigProvider, App as AntApp } from 'antd';
import { communeTheme, communeThemeLight } from './shared/theme';
import AppLayout from './layouts/AppLayout';
import { useAuthStore } from './stores/auth.store';
import { useUIStore } from './stores/ui.store';
import React, { Suspense } from 'react';
import { authApi } from './api/auth.api';
import { getOrCreateGuestId } from './shared/utils/guest';

// Lazy-loaded pages
const LandingPage = React.lazy(() => import('./pages/LandingPage'));
const LoginPage = React.lazy(() => import('./modules/auth/pages/LoginPage'));
const OAuthCallbackPage = React.lazy(() => import('./modules/auth/pages/OAuthCallbackPage'));
const DashboardPage = React.lazy(() => import('./modules/community/pages/DashboardPage'));
const CommunitiesPage = React.lazy(() => import('./modules/community/pages/CommunitiesPage'));
const CommunityDetailPage = React.lazy(() => import('./modules/community/pages/CommunityDetailPage'));
const KanbanPage = React.lazy(() => import('./modules/collaboration/pages/KanbanPage'));
const DiscoverPage = React.lazy(() => import('./modules/discovery/pages/DiscoverPage'));
const EventsPage = React.lazy(() => import('./modules/event/pages/EventsPage'));
const PortfolioPage = React.lazy(() => import('./modules/portfolio/pages/PortfolioPage'));
const SettingsPage = React.lazy(() => import('./modules/settings/pages/SettingsPage'));
const MessagingPage = React.lazy(
  () => import("./modules/messaging/pages/MessagingPage"),
);
const NotificationsPage = React.lazy(
  () => import("./modules/notification/pages/NotificationsPage"),
);

const ProtectedRoute: React.FC<{ children: React.ReactNode; authReady: boolean }> = ({ children, authReady }) => {
  const { isAuthenticated } = useAuthStore();
  if (!authReady) return <LoadingFallback message="Preparing guest session..." />;
  if (!isAuthenticated) return <LoadingFallback message="Connecting to server..." />;
  return <>{children}</>;
};

/** Redirect /communities/:slug → /dashboard/communities/:slug (interpolates param) */
const CommunityRedirect: React.FC = () => {
  const { slug } = useParams();
  return <Navigate to={`/dashboard/communities/${slug}`} replace />;
};

const queryClient = new QueryClient({
  defaultOptions: { queries: { staleTime: 5 * 60 * 1000, retry: 1, refetchOnWindowFocus: false } },
});

const LoadingFallback: React.FC<{ message?: string }> = ({ message }) => (
  <div style={{
    display: 'flex', justifyContent: 'center', alignItems: 'center',
    height: '100vh', background: 'var(--c-bg-void, #05050A)', flexDirection: 'column', gap: 16,
  }}>
    <div style={{
      fontSize: 32, fontWeight: 800, fontFamily: "'Outfit', sans-serif",
      background: 'linear-gradient(135deg, #F4F4F5, #a29bfe)',
      WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
      letterSpacing: 4,
    }}>
      COMMUNE
    </div>
    <div style={{ color: 'var(--c-text-dim, #71717A)', fontSize: 14, fontFamily: 'Inter', fontWeight: 500 }}>
      {message || 'Loading workspace...'}
    </div>
  </div>
);

const AppInner: React.FC = () => {
  const theme = useUIStore((s) => s.theme);
  const setServerStarting = useUIStore((s) => s.setServerStarting);
  const activeTheme = theme === 'light' ? communeThemeLight : communeTheme;
  const { isAuthenticated, setAuth } = useAuthStore();
  const [authReady, setAuthReady] = React.useState(false);

  React.useEffect(() => {
    let cancelled = false;

    const ensureGuestAuth = async () => {
      if (isAuthenticated) {
        if (!cancelled) setAuthReady(true);
        return;
      }

      try {
        const guestId = getOrCreateGuestId();
        const result = await authApi.guest(guestId);
        if (!cancelled) {
          setAuth(result.user, result.accessToken, result.refreshToken);
        }
      } catch {
        if (!cancelled) setServerStarting(true);
      } finally {
        if (!cancelled) setAuthReady(true);
      }
    };

    ensureGuestAuth();
    return () => {
      cancelled = true;
    };
  }, [isAuthenticated, setAuth, setServerStarting]);

  return (
    <ConfigProvider theme={activeTheme}>
      <AntApp>
        <BrowserRouter>
          <Suspense fallback={<LoadingFallback />}>
            <Routes>
              {/* Public routes */}
              <Route path="/" element={<LandingPage />} />
              <Route path="/login" element={<LoginPage />} />
              <Route path="/oauth/callback" element={<OAuthCallbackPage />} />

              {/* Protected routes */}
              <Route
                path="/dashboard"
                element={
                  <ProtectedRoute authReady={authReady}>
                    <AppLayout />
                  </ProtectedRoute>
                }
              >
                <Route
                  index
                  element={<DashboardPage />}
                />
                <Route path="communities" element={<CommunitiesPage />} />
                <Route
                  path="communities/:slug"
                  element={<CommunityDetailPage />}
                />
                <Route
                  path="communities/:slug/tasks"
                  element={<KanbanPage />}
                />
                <Route path="discover" element={<DiscoverPage />} />
                <Route path="tasks" element={<KanbanPage />} />
                <Route path="events" element={<EventsPage />} />
                <Route path="portfolio/:username" element={<PortfolioPage />} />
                <Route path="settings" element={<SettingsPage />} />
                <Route path="messages" element={<MessagingPage />} />
                <Route path="notifications" element={<NotificationsPage />} />
              </Route>

              {/* Legacy redirect */}
              <Route
                path="/communities"
                element={<Navigate to="/dashboard/communities" replace />}
              />
              <Route
                path="/communities/:slug"
                element={<CommunityRedirect />}
              />
              <Route
                path="/tasks"
                element={<Navigate to="/dashboard/tasks" replace />}
              />
              <Route
                path="/events"
                element={<Navigate to="/dashboard/events" replace />}
              />
              <Route
                path="/discover"
                element={<Navigate to="/dashboard/discover" replace />}
              />
            </Routes>
          </Suspense>
        </BrowserRouter>
      </AntApp>
    </ConfigProvider>
  );
};

const App: React.FC = () => (
  <QueryClientProvider client={queryClient}>
    <AppInner />
  </QueryClientProvider>
);

export default App;

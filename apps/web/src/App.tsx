import { BrowserRouter, Routes, Route, Navigate, useParams } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ConfigProvider, App as AntApp } from 'antd';
import { communeTheme, communeThemeLight } from './shared/theme';
import AppLayout from './layouts/AppLayout';
import { useAuthStore } from './stores/auth.store';
import { useUIStore } from './stores/ui.store';
import React, { Suspense } from 'react';

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

const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated } = useAuthStore();
  if (!isAuthenticated) return <Navigate to="/login" replace />;
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

const LoadingFallback = () => (
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
      Loading workspace...
    </div>
  </div>
);

const AppInner: React.FC = () => {
  const theme = useUIStore((s) => s.theme);
  const activeTheme = theme === 'light' ? communeThemeLight : communeTheme;

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
                  <ProtectedRoute>
                    <AppLayout />
                  </ProtectedRoute>
                }
              >
                <Route
                  index
                  element={<Navigate to="/dashboard/communities" replace />}
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
                <Route path="notifications" element={<DashboardPage />} />
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

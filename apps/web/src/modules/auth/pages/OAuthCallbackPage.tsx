import React, { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { message, Spin } from 'antd';
import { useAuthStore } from '../../../stores/auth.store';

const OAuthCallbackPage: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { setAuth } = useAuthStore();

  useEffect(() => {
    const accessToken = searchParams.get('accessToken');
    const refreshToken = searchParams.get('refreshToken');
    const userStr = searchParams.get('user');

    if (accessToken && refreshToken && userStr) {
      try {
        const user = JSON.parse(userStr);
        setAuth(user, accessToken, refreshToken);
        message.success(`Welcome, ${user.displayName || user.username}! 🎉`);
        navigate('/dashboard', { replace: true });
      } catch {
        message.error('OAuth login failed. Please try again.');
        navigate('/login', { replace: true });
      }
    } else {
      message.error('OAuth login failed. No credentials received.');
      navigate('/login', { replace: true });
    }
  }, [searchParams, setAuth, navigate]);

  return (
    <div style={{
      display: 'flex', justifyContent: 'center', alignItems: 'center',
      height: '100vh', background: 'var(--c-bg-void)',
      flexDirection: 'column', gap: 16,
    }}>
      <Spin size="large" />
      <span style={{ color: 'var(--c-text-muted)', fontSize: 14 }}>Completing sign in...</span>
    </div>
  );
};

export default OAuthCallbackPage;

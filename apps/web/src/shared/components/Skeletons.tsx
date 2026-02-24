import React from 'react';
import { Skeleton, Card, Row, Col, Space } from 'antd';

/** Skeleton for a single community card */
export const CommunityCardSkeleton: React.FC = () => (
  <Card
    style={{
      background: 'var(--c-bg-surface)',
      border: '1px solid var(--c-glass-border)',
      borderRadius: 16,
      overflow: 'hidden',
    }}
    styles={{ body: { padding: 20 } }}
  >
    <Skeleton.Image active style={{ width: '100%', height: 120, borderRadius: 8, marginBottom: 16 }} />
    <Skeleton active paragraph={{ rows: 2 }} title={{ width: '60%' }} />
    <Space style={{ marginTop: 12 }}>
      <Skeleton.Button active size="small" shape="round" style={{ width: 60 }} />
      <Skeleton.Button active size="small" shape="round" style={{ width: 50 }} />
    </Space>
  </Card>
);

/** Skeleton grid for community listings */
export const CommunityGridSkeleton: React.FC<{ count?: number }> = ({ count = 8 }) => (
  <Row gutter={[20, 20]}>
    {Array.from({ length: count }).map((_, i) => (
      <Col key={i} xs={24} sm={12} lg={8} xl={6}>
        <CommunityCardSkeleton />
      </Col>
    ))}
  </Row>
);

/** Skeleton for stat cards row */
export const StatRowSkeleton: React.FC = () => (
  <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
    {Array.from({ length: 4 }).map((_, i) => (
      <Col key={i} xs={24} sm={12} lg={6}>
        <Card
          style={{
            background: 'var(--c-bg-surface)',
            border: '1px solid var(--c-glass-border)',
            borderRadius: 12,
          }}
          styles={{ body: { padding: 20 } }}
        >
          <Skeleton active paragraph={{ rows: 1 }} title={{ width: '50%' }} />
        </Card>
      </Col>
    ))}
  </Row>
);

/** Skeleton for the dashboard page */
export const DashboardSkeleton: React.FC = () => (
  <div>
    <Skeleton active paragraph={{ rows: 0 }} title={{ width: '40%' }} style={{ marginBottom: 24 }} />
    <StatRowSkeleton />
    <Row gutter={[16, 16]}>
      <Col xs={24} lg={16}>
        <Card
          style={{ background: 'var(--c-bg-surface)', border: '1px solid var(--c-glass-border)', borderRadius: 12 }}
          styles={{ body: { padding: 20 } }}
        >
          <Skeleton active avatar paragraph={{ rows: 1 }} />
          <Skeleton active avatar paragraph={{ rows: 1 }} style={{ marginTop: 16 }} />
          <Skeleton active avatar paragraph={{ rows: 1 }} style={{ marginTop: 16 }} />
        </Card>
      </Col>
      <Col xs={24} lg={8}>
        <Card
          style={{ background: 'var(--c-bg-surface)', border: '1px solid var(--c-glass-border)', borderRadius: 12 }}
        >
          <Skeleton active paragraph={{ rows: 4 }} />
        </Card>
      </Col>
    </Row>
  </div>
);

/** Skeleton for event cards */
export const EventListSkeleton: React.FC<{ count?: number }> = ({ count = 3 }) => (
  <div style={{ maxWidth: 800, display: 'flex', flexDirection: 'column', gap: 16 }}>
    {Array.from({ length: count }).map((_, i) => (
      <Card
        key={i}
        style={{
          background: 'var(--c-bg-surface)',
          border: '1px solid var(--c-glass-border)',
          borderRadius: 14,
        }}
        styles={{ body: { padding: 20 } }}
      >
        <Skeleton active paragraph={{ rows: 2 }} title={{ width: '45%' }} />
        <Space style={{ marginTop: 12 }}>
          <Skeleton.Button active size="small" shape="round" style={{ width: 80 }} />
          <Skeleton.Button active size="small" shape="round" style={{ width: 60 }} />
        </Space>
      </Card>
    ))}
  </div>
);

/** Skeleton for kanban columns */
export const KanbanSkeleton: React.FC = () => (
  <div style={{ display: 'flex', gap: 16, overflowX: 'auto', padding: '16px 0' }}>
    {Array.from({ length: 5 }).map((_, col) => (
      <div
        key={col}
        style={{
          minWidth: 280,
          background: 'var(--c-bg-surface)',
          border: '1px solid var(--c-glass-border)',
          borderRadius: 16,
          padding: 16,
        }}
      >
        <Skeleton.Button active shape="round" style={{ width: 100, marginBottom: 16 }} />
        {Array.from({ length: col === 0 ? 2 : col === 1 ? 3 : 1 }).map((_, card) => (
          <Card
            key={card}
            style={{
              background: 'var(--c-bg-deep, var(--c-bg-surface))',
              border: '1px solid var(--c-glass-border)',
              borderRadius: 12,
              marginBottom: 8,
            }}
            styles={{ body: { padding: 14 } }}
          >
            <Skeleton active paragraph={{ rows: 1, width: '80%' }} title={{ width: '60%' }} />
          </Card>
        ))}
      </div>
    ))}
  </div>
);

/** Skeleton for portfolio page */
export const PortfolioSkeleton: React.FC = () => (
  <div>
    <Skeleton.Image active style={{ width: '100%', height: 260, borderRadius: 28 }} />
    <div style={{ display: 'flex', gap: 28, marginTop: -80, padding: '0 32px', position: 'relative', zIndex: 10 }}>
      <Skeleton.Avatar active size={160} shape="circle" />
      <div style={{ flex: 1, marginTop: 50 }}>
        <Skeleton active paragraph={{ rows: 2 }} title={{ width: '30%' }} />
      </div>
    </div>
    <Row gutter={[20, 20]} style={{ marginTop: 40 }}>
      <Col xs={24} lg={16}>
        <StatRowSkeleton />
        <Card
          style={{ background: 'var(--c-bg-surface)', border: '1px solid var(--c-glass-border)', borderRadius: 14 }}
          styles={{ body: { padding: 20 } }}
        >
          <Skeleton active paragraph={{ rows: 5 }} />
        </Card>
      </Col>
      <Col xs={24} lg={8}>
        <Card
          style={{ background: 'var(--c-bg-surface)', border: '1px solid var(--c-glass-border)', borderRadius: 14 }}
        >
          <Skeleton active paragraph={{ rows: 6 }} />
        </Card>
      </Col>
    </Row>
  </div>
);

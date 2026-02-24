import React, { useMemo, useState } from 'react';
import { Typography, Button, Tabs, Space, Spin, Empty, Select, Modal, Form, Input, DatePicker, InputNumber, message } from 'antd';
import { CalendarOutlined, PlusOutlined, ClockCircleOutlined, ThunderboltOutlined, FilterOutlined } from '@ant-design/icons';
import { motion } from 'framer-motion';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import dayjs from 'dayjs';
import { EventCard, EventListSkeleton } from '../../../shared/components';
import { useCommunities } from '../../community/hooks/useCommunities';
import { eventsApi } from '../../../api/events.api';

const { Title, Text } = Typography;

const stagger = { hidden: { opacity: 0 }, visible: { opacity: 1, transition: { staggerChildren: 0.08 } } };
const fadeUp = { hidden: { opacity: 0, y: 16 }, visible: { opacity: 1, y: 0, transition: { duration: 0.4, ease: [0.16, 1, 0.3, 1] } } };

const EventsPage: React.FC = () => {
  const [typeFilter, setTypeFilter] = useState<string | undefined>(undefined);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [form] = Form.useForm();
  const queryClient = useQueryClient();
  const { data: communities } = useCommunities();
  const communityList: any[] = Array.isArray(communities) ? communities : (communities as any)?.items ?? [];

  // Fetch events from all user communities
  const { data: allEvents, isLoading } = useQuery({
    queryKey: ['all-events', communityList.map((c: any) => c.id)],
    queryFn: async () => {
      if (!communityList.length) return [];
      const results = await Promise.allSettled(
        communityList.map((c: any) => eventsApi.list(c.id))
      );
      return results
        .filter((r): r is PromiseFulfilledResult<any> => r.status === 'fulfilled')
        .flatMap((r) => (Array.isArray(r.value) ? r.value : r.value?.items ?? []))
        .sort((a: any, b: any) => new Date(a.startsAt).getTime() - new Date(b.startsAt).getTime());
    },
    enabled: communityList.length > 0,
  });

  const events: any[] = allEvents ?? [];
  const now = Date.now();

  const createEvent = useMutation({
    mutationFn: (values: any) => {
      const { communityId, dateRange, ...rest } = values;
      return eventsApi.create(communityId, {
        ...rest,
        startsAt: dateRange[0].toISOString(),
        endsAt: dateRange[1].toISOString(),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['all-events'] });
      message.success('Event created!');
      setIsModalOpen(false);
      form.resetFields();
    },
    onError: (err: any) => {
      message.error(err?.response?.data?.message || 'Failed to create event');
    },
  });

  const filtered = useMemo(() => {
    let list = events;
    if (typeFilter) list = list.filter((e: any) => e.type === typeFilter);
    return list;
  }, [events, typeFilter]);

  const upcoming = filtered.filter((e: any) => new Date(e.startsAt).getTime() > now);
  const past = filtered.filter((e: any) => new Date(e.startsAt).getTime() <= now);
  const totalRsvps = upcoming.reduce((a: number, e: any) => a + (e.rsvpCount ?? 0), 0);

  const nextEvent = upcoming[0];
  const daysUntilNext = nextEvent ? dayjs(nextEvent.startsAt).diff(dayjs(), 'day') : null;

  return (
    <div style={{ position: 'relative' }}>
      {/* Ambient calendar glow */}
      <div style={{
        position: 'absolute', top: -100, right: 100, width: 400, height: 400,
        background: 'radial-gradient(circle, rgba(251,191,36,0.06) 0%, transparent 60%)',
        filter: 'blur(80px)', pointerEvents: 'none', zIndex: 0
      }} />

      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 32, position: 'relative', zIndex: 1 }}
      >
        <div>
          <Title level={2} style={{
            color: 'var(--c-text-bright)', margin: 0, fontFamily: "'Outfit', sans-serif",
            fontWeight: 800, fontSize: 36, letterSpacing: -0.5,
          }}>
            <CalendarOutlined style={{ marginRight: 14, color: '#FBBF24' }} /> Events
          </Title>
          <Text style={{ color: 'var(--c-text-muted)', fontSize: 15, display: 'block', marginTop: 6 }}>
            Workshops, demos, and meetups across your communities
          </Text>
        </div>

        <Space size={12}>
          {/* Type Filter */}
          <Select
            allowClear
            placeholder={<><FilterOutlined /> Type</>}
            value={typeFilter}
            onChange={setTypeFilter}
            style={{ minWidth: 140 }}
            options={[
              { value: 'online', label: '🌐 Online' },
              { value: 'offline', label: '📍 In Person' },
              { value: 'hybrid', label: '🔀 Hybrid' },
            ]}
          />

          {/* Quick Stats */}
          <div style={{
            display: 'flex', gap: 24, padding: '14px 24px',
            background: 'var(--c-glass-highlight)', borderRadius: 16,
            border: '1px solid var(--c-glass-border)',
          }}>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: 22, fontWeight: 800, color: 'var(--c-text-bright)', fontFamily: "'Outfit', sans-serif" }}>{upcoming.length}</div>
              <div style={{ fontSize: 11, color: 'var(--c-text-dim)', fontWeight: 500 }}>Upcoming</div>
            </div>
            <div style={{ width: 1, background: 'var(--c-glass-border)' }} />
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: 22, fontWeight: 800, color: '#FBBF24', fontFamily: "'Outfit', sans-serif" }}>
                {totalRsvps}
              </div>
              <div style={{ fontSize: 11, color: 'var(--c-text-dim)', fontWeight: 500 }}>RSVPs</div>
            </div>
          </div>

          <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }}>
            <Button
              type="primary"
              icon={<PlusOutlined />}
              onClick={() => setIsModalOpen(true)}
              style={{
                background: 'var(--c-accent)',
                border: 'none', fontWeight: 700, borderRadius: 14,
                height: 48, padding: '0 24px', fontSize: 15,
                boxShadow: '0 8px 24px rgba(124,106,239,0.3)',
              }}
            >
              Create Event
            </Button>
          </motion.div>
        </Space>
      </motion.div>

      {/* Timeline indicator */}
      {nextEvent && (
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 24, position: 'relative', zIndex: 1 }}>
          <motion.div
            animate={{ scale: [1, 1.3, 1], opacity: [0.6, 1, 0.6] }}
            transition={{ duration: 2, repeat: Infinity }}
            style={{ width: 10, height: 10, borderRadius: '50%', background: 'var(--c-success)', boxShadow: '0 0 16px rgba(16,185,129,0.5)' }}
          />
          <Text style={{ color: 'var(--c-success)', fontWeight: 600, fontSize: 13 }}>
            <ThunderboltOutlined /> Next event {daysUntilNext === 0 ? 'today' : `in ${daysUntilNext} day${daysUntilNext === 1 ? '' : 's'}`}
          </Text>
          <div style={{ flex: 1, height: 1, background: 'linear-gradient(90deg, rgba(16,185,129,0.3) 0%, transparent 100%)' }} />
        </div>
      )}

      {isLoading ? (
        <EventListSkeleton />
      ) : (
        <Tabs
          defaultActiveKey="upcoming"
          style={{ position: 'relative', zIndex: 1 }}
          items={[
            {
              key: 'upcoming',
              label: <span><CalendarOutlined /> Upcoming ({upcoming.length})</span>,
              children: upcoming.length === 0 ? (
                <Empty description={<Text style={{ color: 'var(--c-text-dim)' }}>No upcoming events</Text>} style={{ marginTop: 60 }} />
              ) : (
                <motion.div variants={stagger} initial="hidden" animate="visible" style={{ maxWidth: 800, display: 'flex', flexDirection: 'column', gap: 16 }}>
                  {upcoming.map((e: any, i: number) => (
                    <motion.div key={e.id ?? i} variants={fadeUp}>
                      <EventCard
                        title={e.title}
                        description={e.description}
                        type={e.type ?? 'online'}
                        status={e.status ?? 'published'}
                        startsAt={e.startsAt}
                        endsAt={e.endsAt}
                        rsvpCount={e.rsvpCount ?? 0}
                        maxAttendees={e.maxAttendees}
                        tags={e.tags ?? []}
                        organizer={e.organizer}
                      />
                    </motion.div>
                  ))}
                </motion.div>
              ),
            },
            {
              key: 'past',
              label: <span><ClockCircleOutlined /> Past ({past.length})</span>,
              children: past.length === 0 ? (
                <Empty description={<Text style={{ color: 'var(--c-text-dim)' }}>No past events</Text>} style={{ marginTop: 60 }} />
              ) : (
                <motion.div variants={stagger} initial="hidden" animate="visible" style={{ maxWidth: 800, display: 'flex', flexDirection: 'column', gap: 16 }}>
                  {past.map((e: any, i: number) => (
                    <motion.div key={e.id ?? i} variants={fadeUp}>
                      <EventCard
                        title={e.title}
                        description={e.description}
                        type={e.type ?? 'online'}
                        status={e.status ?? 'completed'}
                        startsAt={e.startsAt}
                        endsAt={e.endsAt}
                        rsvpCount={e.rsvpCount ?? 0}
                        maxAttendees={e.maxAttendees}
                        tags={e.tags ?? []}
                        organizer={e.organizer}
                      />
                    </motion.div>
                  ))}
                </motion.div>
              ),
            },
          ]}
        />
      )}
      
      {/* Create Event Modal */}
      <Modal
        title={<span style={{ fontFamily: "'Outfit', sans-serif", fontWeight: 700, fontSize: 20 }}>Create Event</span>}
        open={isModalOpen}
        onCancel={() => setIsModalOpen(false)}
        footer={null}
        styles={{ body: { paddingTop: 16 } }}
      >
        <Form form={form} layout="vertical" onFinish={(v) => createEvent.mutate(v)} requiredMark={false}>
          <Form.Item name="communityId" label="Community" rules={[{ required: true, message: 'Select a community' }]}>
            <Select
              placeholder="Select community"
              size="large"
              options={communityList.map((c: any) => ({ value: c.id, label: c.name }))}
              style={{ borderRadius: 14 }}
            />
          </Form.Item>
          <Form.Item name="title" label="Title" rules={[{ required: true }]}>
            <Input placeholder="LLM Workshop" size="large" style={{ borderRadius: 14, height: 48 }} />
          </Form.Item>
          <Form.Item name="description" label="Description">
            <Input.TextArea rows={3} placeholder="What's this event about?" style={{ borderRadius: 14 }} />
          </Form.Item>
          <Form.Item name="type" label="Type" rules={[{ required: true }]} initialValue="online">
            <Select size="large" options={[
              { value: 'online', label: '🌐 Online' },
              { value: 'offline', label: '📍 In Person' },
              { value: 'hybrid', label: '🔀 Hybrid' },
            ]} />
          </Form.Item>
          <Form.Item name="dateRange" label="Date & Time" rules={[{ required: true, message: 'Select start and end time' }]}>
            <DatePicker.RangePicker
              showTime={{ format: 'HH:mm' }}
              format="YYYY-MM-DD HH:mm"
              size="large"
              style={{ width: '100%', borderRadius: 14 }}
            />
          </Form.Item>
          <Form.Item name="meetingUrl" label="Meeting URL">
            <Input placeholder="https://meet.google.com/..." size="large" style={{ borderRadius: 14, height: 48 }} />
          </Form.Item>
          <Form.Item name="maxAttendees" label="Max Attendees">
            <InputNumber min={1} placeholder="50" size="large" style={{ width: '100%', borderRadius: 14 }} />
          </Form.Item>
          <Form.Item>
            <motion.div whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.98 }}>
              <Button
                type="primary" htmlType="submit" block size="large"
                loading={createEvent.isPending}
                style={{
                  background: 'var(--c-accent)', border: 'none', fontWeight: 700,
                  borderRadius: 14, height: 52, boxShadow: '0 8px 24px rgba(124,106,239,0.3)',
                }}
              >
                Create Event
              </Button>
            </motion.div>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default EventsPage;

import React, { useState, useCallback, useEffect, useMemo } from 'react';
import { useParams, useNavigate } from "react-router-dom";
import {
  Typography,
  Button,
  Tag,
  Space,
  Avatar,
  Modal,
  Form,
  Input,
  Select,
  Tooltip,
  Badge,
  message,
} from "antd";
import {
  PlusOutlined,
  FilterOutlined,
  ClockCircleOutlined,
  ThunderboltOutlined,
  DeleteOutlined,
} from "@ant-design/icons";
import { motion } from 'framer-motion';
import { KanbanSkeleton } from "../../../shared/components";
import {
  DndContext, closestCorners, DragOverlay,
  PointerSensor, useSensor, useSensors, useDroppable,
} from '@dnd-kit/core';
import type { DragStartEvent, DragEndEvent, DragOverEvent } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy, useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  useCommunity,
  useMyCommunities,
} from "../../community/hooks/useCommunities";
import { tasksApi, type CreateTaskPayload } from '../../../api/tasks.api';

const { Title, Text } = Typography;

interface TaskItem {
  id: string;
  title: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  tags: string[];
  assignees: { name: string; avatarUrl: string | null }[];
  dueDate: string | null;
  commentCount: number;
  communityId: string;
}

const COLUMNS = [
  { key: 'backlog', title: 'Backlog', color: 'var(--c-text-dim)', emoji: '📋' },
  { key: 'todo', title: 'To Do', color: '#3B82F6', emoji: '📌' },
  { key: 'in_progress', title: 'In Progress', color: 'var(--c-warning)', emoji: '⚡' },
  { key: 'in_review', title: 'In Review', color: 'var(--c-accent-soft)', emoji: '👀' },
  { key: 'done', title: 'Done', color: 'var(--c-success)', emoji: '✅' },
];

const PRIORITY_CONFIG = {
  low: { color: 'var(--c-text-dim)', label: 'Low' },
  medium: { color: '#3B82F6', label: 'Medium' },
  high: { color: 'var(--c-warning)', label: 'High' },
  urgent: { color: 'var(--c-error)', label: 'Urgent' },
};

/* ═══ Sortable Task Card ═══ */
const SortableTaskCard: React.FC<{
  task: TaskItem;
  isDraggingOverlay?: boolean;
  onDelete?: (task: TaskItem) => void;
}> = ({ task, isDraggingOverlay, onDelete }) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: task.id });
  const pc = PRIORITY_CONFIG[task.priority];
  const isDueSoon =
    task.dueDate &&
    new Date(task.dueDate) < new Date(Date.now() + 3 * 86400000);

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.4 : 1,
  };

  return (
    <div ref={setNodeRef} style={style} {...attributes} {...listeners}>
      <motion.div
        layout={!isDraggingOverlay}
        whileHover={
          isDraggingOverlay
            ? undefined
            : { y: -2, boxShadow: "0 12px 32px rgba(0,0,0,0.3)" }
        }
        style={{
          background: isDraggingOverlay
            ? "rgba(30, 30, 50, 0.95)"
            : "var(--c-glass-base, rgba(22, 22, 34, 0.7))",
          backdropFilter: "blur(16px)",
          border: isDraggingOverlay
            ? "2px solid rgba(124,106,239,0.5)"
            : "1px solid var(--c-glass-border, rgba(255,255,255,0.04))",
          borderRadius: 16,
          padding: 18,
          cursor: isDragging ? "grabbing" : "grab",
          marginBottom: 12,
          position: "relative",
          overflow: "hidden",
          boxShadow: isDraggingOverlay
            ? "0 20px 50px rgba(124,106,239,0.3)"
            : "none",
        }}
      >
        <div
          style={{
            position: "absolute",
            left: 0,
            top: 0,
            bottom: 0,
            width: 3,
            background: `linear-gradient(to bottom, ${pc.color}, transparent)`,
            opacity: 0.7,
          }}
        />

        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 6,
            marginBottom: 10,
          }}
        >
          <div
            style={{
              width: 8,
              height: 8,
              borderRadius: "50%",
              background: pc.color,
              boxShadow:
                task.priority === "urgent" ? `0 0 10px ${pc.color}` : "none",
            }}
          />
          <Text
            style={{
              color: "var(--c-text-dim, #71717A)",
              fontSize: 11,
              textTransform: "uppercase",
              letterSpacing: 0.5,
              fontWeight: 600,
            }}
          >
            {pc.label}
          </Text>
        </div>

        <Text
          style={{
            color: "var(--c-text-bright, #F4F4F5)",
            fontSize: 14,
            fontWeight: 600,
            display: "block",
            lineHeight: 1.5,
            marginBottom: 12,
          }}
        >
          {task.title}
        </Text>

        {task.tags.length > 0 && (
          <div style={{ marginBottom: 12 }}>
            <Space size={4}>
              {task.tags.map((tag) => (
                <Tag
                  key={tag}
                  style={{
                    margin: 0,
                    background: "var(--c-accent-muted)",
                    borderColor: "rgba(124,106,239,0.12)",
                    color: "var(--c-accent-soft)",
                    fontSize: 10,
                    borderRadius: 6,
                    padding: "0 8px",
                    lineHeight: "20px",
                    fontWeight: 500,
                  }}
                >
                  {tag}
                </Tag>
              ))}
            </Space>
          </div>
        )}

        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <Avatar.Group
            size={24}
            max={{ count: 3 }}
            style={{ display: "flex" }}
          >
            {task.assignees.map((a, i) => (
              <Tooltip key={i} title={a.name}>
                <Avatar
                  src={a.avatarUrl}
                  size={24}
                  style={{
                    background: "var(--c-accent)",
                    fontSize: 10,
                    fontWeight: 700,
                  }}
                >
                  {a.name[0]}
                </Avatar>
              </Tooltip>
            ))}
          </Avatar.Group>

          <Space size={10}>
            {task.dueDate && (
              <Tooltip title={`Due: ${task.dueDate}`}>
                <Space size={3}>
                  <ClockCircleOutlined
                    style={{
                      color: isDueSoon
                        ? "var(--c-error)"
                        : "var(--c-text-dim, #71717A)",
                      fontSize: 11,
                    }}
                  />
                  <Text
                    style={{
                      color: isDueSoon
                        ? "var(--c-error)"
                        : "var(--c-text-dim, #71717A)",
                      fontSize: 11,
                      fontWeight: 500,
                    }}
                  >
                    {new Date(task.dueDate).toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                    })}
                  </Text>
                </Space>
              </Tooltip>
            )}
            {task.commentCount > 0 && (
              <Text
                style={{
                  color: "var(--c-text-dim, #71717A)",
                  fontSize: 11,
                  fontWeight: 500,
                }}
              >
                💬 {task.commentCount}
              </Text>
            )}
            {onDelete && !isDraggingOverlay && (
              <Tooltip title="Delete task">
                <DeleteOutlined
                  onClick={(e) => {
                    e.stopPropagation();
                    onDelete(task);
                  }}
                  style={{
                    color: "var(--c-text-dim, #71717A)",
                    fontSize: 13,
                    cursor: "pointer",
                    transition: "color 0.2s",
                  }}
                  onMouseEnter={(e) =>
                    (e.currentTarget.style.color = "var(--c-error, #EF4444)")
                  }
                  onMouseLeave={(e) =>
                    (e.currentTarget.style.color = "var(--c-text-dim, #71717A)")
                  }
                />
              </Tooltip>
            )}
          </Space>
        </div>
      </motion.div>
    </div>
  );
};

/* ═══ Droppable Column ═══ */
const DroppableColumn: React.FC<{
  col: (typeof COLUMNS)[0];
  tasks: TaskItem[];
  isOver: boolean;
  colIdx: number;
  onAddClick: () => void;
  onDelete?: (task: TaskItem) => void;
}> = ({ col, tasks, isOver, colIdx, onAddClick, onDelete }) => {
  const { setNodeRef } = useDroppable({ id: col.key });

  return (
    <motion.div
      key={col.key}
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: colIdx * 0.06, ease: [0.16, 1, 0.3, 1] }}
      style={{ minWidth: 300, maxWidth: 300, flex: "0 0 300px" }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          marginBottom: 14,
          padding: "0 6px",
        }}
      >
        <Space size={10}>
          <span style={{ fontSize: 16 }}>{col.emoji}</span>
          <Text
            style={{
              color: "var(--c-text-bright, #F4F4F5)",
              fontWeight: 700,
              fontSize: 14,
              fontFamily: "'Outfit'",
            }}
          >
            {col.title}
          </Text>
          <Badge
            count={tasks.length}
            style={{
              background: "var(--c-accent-muted)",
              color: "var(--c-text-muted, #A1A1AA)",
              fontSize: 11,
              boxShadow: "none",
              fontWeight: 600,
            }}
          />
        </Space>
        <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
          <Button
            type="text"
            size="small"
            icon={<PlusOutlined />}
            style={{ color: "var(--c-text-dim, #71717A)", fontSize: 12 }}
            onClick={onAddClick}
          />
        </motion.div>
      </div>

      <div
        ref={setNodeRef}
        style={{
          background: isOver
            ? "var(--c-accent-muted)"
            : "var(--c-glass-base, rgba(10, 10, 18, 0.4))",
          backdropFilter: "blur(12px)",
          borderRadius: 14,
          padding: 14,
          minHeight: 500,
          border: isOver
            ? "2px dashed rgba(124,106,239,0.4)"
            : "1px solid var(--c-glass-border, rgba(255,255,255,0.03))",
          boxShadow: "inset 0 4px 20px rgba(0,0,0,0.15)",
          position: "relative",
          overflow: "hidden",
          transition: "all 0.2s ease",
        }}
      >
        <div
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            height: 80,
            background: `radial-gradient(ellipse at top, color-mix(in srgb, ${col.color} 6%, transparent) 0%, transparent 70%)`,
            pointerEvents: "none",
          }}
        />

        <SortableContext
          items={tasks.map((t) => t.id)}
          strategy={verticalListSortingStrategy}
        >
          {tasks.map((task) => (
            <SortableTaskCard key={task.id} task={task} onDelete={onDelete} />
          ))}
        </SortableContext>

        {tasks.length === 0 && (
          <div
            style={{
              textAlign: "center",
              padding: "48px 16px",
              color: isOver
                ? "var(--c-accent-soft)"
                : "var(--c-text-ghost, #52525B)",
              fontSize: 13,
              fontWeight: 500,
              transition: "color 0.2s",
            }}
          >
            {isOver ? "Drop here" : "No tasks"}
          </div>
        )}
      </div>
    </motion.div>
  );
};

/* ═══ Main Kanban Board ═══ */
const KanbanPage: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const { data: communities } = useMyCommunities();
  const communityList: any[] = Array.isArray(communities)
    ? communities
    : ((communities as any)?.items ?? []);
  const { data: community } = useCommunity(slug ?? '');
  const communityId = community?.id ?? '';
  const communityName = community?.name ?? 'Tasks';
  const queryClient = useQueryClient();
  const [priorityFilter, setPriorityFilter] = useState<string | undefined>(
    undefined,
  );

  // Fetch tasks from API
  const { data: apiTasks, isLoading } = useQuery({
    queryKey: slug ? ['tasks', communityId] : ['tasks', 'personal'],
    queryFn: () => slug ? tasksApi.list(communityId) : tasksApi.listPersonal(),
    enabled: slug ? !!communityId : true,
  });

  // Mutation to update task status via API
  const updateTaskMut = useMutation({
    mutationFn: ({ taskId, taskCommunityId, data }: { taskId: string; taskCommunityId: string; data: { status?: string } }) =>
      tasksApi.update(taskCommunityId || communityId, taskId, data),
    onSettled: () => {
       setTimeout(() => {
         queryClient.invalidateQueries({ queryKey: slug ? ['tasks', communityId] : ['tasks', 'personal'] });
       }, 500);
    }
  });

  const createTaskMut = useMutation({
    mutationFn: (data: CreateTaskPayload) => tasksApi.create(communityId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks', communityId] });
      message.success('Task created');
    },
  });

  const deleteTaskMut = useMutation({
    mutationFn: ({
      taskId,
      taskCommunityId,
    }: {
      taskId: string;
      taskCommunityId: string;
    }) => tasksApi.delete(taskCommunityId || communityId, taskId),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: slug ? ["tasks", communityId] : ["tasks", "personal"],
      });
      message.success("Task deleted");
    },
    onError: () => {
      message.error("Failed to delete task");
    },
  });

  const handleDeleteTask = useCallback(
    (task: TaskItem) => {
      Modal.confirm({
        title: "Delete Task",
        content: `Are you sure you want to delete "${task.title}"?`,
        okText: "Delete",
        okButtonProps: { danger: true },
        onOk: () =>
          deleteTaskMut.mutate({
            taskId: task.id,
            taskCommunityId: task.communityId,
          }),
      });
    },
    [deleteTaskMut],
  );

  // Organize tasks into columns
  const tasksByColumn = useMemo(() => {
    const taskList: any[] = Array.isArray(apiTasks)
      ? apiTasks
      : ((apiTasks as any)?.items ?? []);
    const grouped: Record<string, TaskItem[]> = {
      backlog: [],
      todo: [],
      in_progress: [],
      in_review: [],
      done: [],
    };
    taskList.forEach((t: any) => {
      const item: TaskItem = {
        id: t.id,
        title: t.title ?? "Untitled",
        priority: t.priority ?? "medium",
        tags: t.tags ?? [],
        assignees:
          t.assignments?.map((a: any) => ({
            name: a.user?.displayName ?? "User",
            avatarUrl: a.user?.avatarUrl ?? null,
          })) ?? [],
        dueDate: t.dueDate ?? null,
        commentCount: t.commentCount ?? 0,
        communityId: t.communityId ?? communityId,
      };
      // Apply priority filter
      if (priorityFilter && item.priority !== priorityFilter) return;
      const col = t.status ?? "backlog";
      if (grouped[col]) grouped[col].push(item);
      else grouped.backlog.push(item);
    });
    return grouped;
  }, [apiTasks, priorityFilter]);

  const [localTasks, setLocalTasks] = useState<Record<string, TaskItem[]> | null>(null);
  const tasks = localTasks ?? tasksByColumn;

  // Sync local state when API data refreshes, but avoid resetting during optimistic mutation
  useEffect(() => {
    if (!updateTaskMut.isPending) {
      setLocalTasks(null);
    }
  }, [apiTasks, updateTaskMut.isPending]);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [activeTask, setActiveTask] = useState<TaskItem | null>(null);
  const [overColumn, setOverColumn] = useState<string | null>(null);
  const [form] = Form.useForm();
  const totalTasks = Object.values(tasks).flat().length;

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
  );

  const findColumn = useCallback((taskId: string): string | null => {
    for (const [colKey, colTasks] of Object.entries(tasks)) {
      if (colTasks.some(t => t.id === taskId)) return colKey;
    }
    return null;
  }, [tasks]);

  const handleDragStart = useCallback((event: DragStartEvent) => {
    const { active } = event;
    const task = Object.values(tasks).flat().find(t => t.id === active.id);
    setActiveTask(task || null);
  }, [tasks]);

  const handleDragOver = useCallback((event: DragOverEvent) => {
    const { over } = event;
    if (!over) { setOverColumn(null); return; }
    const overId = over.id as string;
    const isCol = COLUMNS.some(c => c.key === overId);
    setOverColumn(isCol ? overId : findColumn(overId));
  }, [findColumn]);

  const handleDragEnd = useCallback((event: DragEndEvent) => {
    const { active, over } = event;
    setActiveTask(null);
    setOverColumn(null);
    if (!over) return;

    const activeId = active.id as string;
    const overId = over.id as string;
    const sourceCol = findColumn(activeId);
    if (!sourceCol) return;

    // Determine target column
    const isColumn = COLUMNS.some(c => c.key === overId);
    const targetCol = isColumn ? overId : findColumn(overId);
    if (!targetCol) return;

    if (sourceCol === targetCol) {
      // Reorder within the same column
      const mergedTasks = localTasks ?? tasksByColumn;
      setLocalTasks(() => {
        const col = [...mergedTasks[sourceCol]];
        const oldIdx = col.findIndex(t => t.id === activeId);
        const newIdx = col.findIndex(t => t.id === overId);
        if (oldIdx === -1 || newIdx === -1 || oldIdx === newIdx) return mergedTasks;
        const [item] = col.splice(oldIdx, 1);
        col.splice(newIdx, 0, item);
        return { ...mergedTasks, [sourceCol]: col };
      });
    } else {
      // Move across columns — optimistic update + API call
      const mergedTasks = localTasks ?? tasksByColumn;
      setLocalTasks(() => {
        const source = [...mergedTasks[sourceCol]];
        const target = [...mergedTasks[targetCol]];
        const idx = source.findIndex(t => t.id === activeId);
        if (idx === -1) return mergedTasks;
        const [item] = source.splice(idx, 1);
        const targetIdx = isColumn ? target.length : target.findIndex(t => t.id === overId);
        target.splice(targetIdx === -1 ? target.length : targetIdx, 0, item);
        return { ...mergedTasks, [sourceCol]: source, [targetCol]: target };
      });
      // Persist status change to API
      const taskObj = [...mergedTasks[sourceCol], ...mergedTasks[targetCol]].find(t => t.id === activeId);
      updateTaskMut.mutate({ taskId: activeId, taskCommunityId: taskObj?.communityId ?? communityId, data: { status: targetCol } });
    }
  }, [findColumn, localTasks, tasksByColumn, updateTaskMut, communityId]);

  const handleCreateTask = (values: any) => {
    createTaskMut.mutate({
      title: values.title,
      description: values.description,
      priority: values.priority || 'medium',
      tags: values.tags ? values.tags.split(',').map((t: string) => t.trim()) : [],
      status: values.status || 'todo',
    });
    setIsModalOpen(false);
    form.resetFields();
  };

  return (
    <div style={{ position: "relative" }}>
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-start",
          marginBottom: 28,
        }}
      >
        <div>
          <Title
            level={2}
            style={{
              color: "var(--c-text-bright, #F4F4F5)",
              margin: 0,
              fontFamily: "'Outfit', sans-serif",
              fontWeight: 800,
              fontSize: 36,
              letterSpacing: -0.5,
            }}
          >
            <ThunderboltOutlined
              style={{ marginRight: 14, color: "var(--c-warning)" }}
            />{" "}
            Task Board
          </Title>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 12,
              marginTop: 8,
              flexWrap: "wrap",
            }}
          >
            <Select
              placeholder="Select a community"
              value={slug || "personal"}
              onChange={(value) => {
                if (value === "personal") navigate(`/dashboard/tasks`);
                else navigate(`/dashboard/communities/${value}/tasks`);
              }}
              style={{ minWidth: 200 }}
              options={[
                { value: "personal", label: "My Personal Tasks" },
                ...communityList.map((c: any) => ({
                  value: c.slug,
                  label: c.name,
                })),
              ]}
            />
            <Text
              style={{ color: "var(--c-text-muted, #A1A1AA)", fontSize: 15 }}
            >
              {slug
                ? `${communityName} · ${totalTasks} tasks`
                : `Your Personal Tasks · ${totalTasks} tasks across communities`}
            </Text>
          </div>
        </div>

        <Space size={12}>
          <Select
            allowClear
            placeholder={
              <>
                <FilterOutlined /> Priority
              </>
            }
            value={priorityFilter}
            onChange={setPriorityFilter}
            style={{ minWidth: 140 }}
            options={[
              { value: "low", label: "🟢 Low" },
              { value: "medium", label: "🔵 Medium" },
              { value: "high", label: "🟡 High" },
              { value: "urgent", label: "🔴 Urgent" },
            ]}
          />
          <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }}>
            <Button
              type="primary"
              icon={<PlusOutlined />}
              onClick={() => setIsModalOpen(true)}
              style={{
                background: "var(--c-accent)",
                border: "none",
                fontWeight: 700,
                borderRadius: 14,
                height: 48,
                padding: "0 24px",
                fontSize: 15,
                boxShadow: "0 8px 24px rgba(124,106,239,0.3)",
              }}
            >
              New Task
            </Button>
          </motion.div>
        </Space>
      </motion.div>

      {/* Board */}
      {isLoading ? (
        <KanbanSkeleton />
      ) : (
        <DndContext
          sensors={sensors}
          collisionDetection={closestCorners}
          onDragStart={handleDragStart}
          onDragOver={handleDragOver}
          onDragEnd={handleDragEnd}
        >
          <div
            style={{
              display: "flex",
              gap: 16,
              overflowX: "auto",
              paddingBottom: 16,
              minHeight: "calc(100vh - 240px)",
            }}
          >
            {COLUMNS.map((col, colIdx) => (
              <DroppableColumn
                key={col.key}
                col={col}
                tasks={tasks[col.key] || []}
                isOver={overColumn === col.key}
                colIdx={colIdx}
                onAddClick={() => setIsModalOpen(true)}
                onDelete={handleDeleteTask}
              />
            ))}
          </div>

          <DragOverlay>
            {activeTask ? (
              <div style={{ width: 300 }}>
                <SortableTaskCard task={activeTask} isDraggingOverlay />
              </div>
            ) : null}
          </DragOverlay>
        </DndContext>
      )}

      {/* Create Task Modal */}
      <Modal
        title={
          <span
            style={{
              fontFamily: "'Outfit', sans-serif",
              fontWeight: 700,
              fontSize: 20,
            }}
          >
            New Task
          </span>
        }
        open={isModalOpen}
        onCancel={() => setIsModalOpen(false)}
        footer={null}
      >
        <Form
          form={form}
          layout="vertical"
          requiredMark={false}
          onFinish={handleCreateTask}
        >
          <Form.Item name="title" label="Title" rules={[{ required: true }]}>
            <Input
              placeholder="What needs to be done?"
              size="large"
              style={{ borderRadius: 14, height: 48 }}
            />
          </Form.Item>
          <Form.Item name="description" label="Description">
            <Input.TextArea
              rows={3}
              placeholder="Add details..."
              style={{ borderRadius: 14 }}
            />
          </Form.Item>
          <Form.Item name="tags" label="Tags">
            <Input
              placeholder="ai, ml, docs (comma separated)"
              size="large"
              style={{ borderRadius: 14, height: 48 }}
            />
          </Form.Item>
          <Space style={{ width: "100%" }} size={12}>
            <Form.Item
              name="priority"
              label="Priority"
              initialValue="medium"
              style={{ flex: 1 }}
            >
              <Select
                options={[
                  { value: "low", label: "🟢 Low" },
                  { value: "medium", label: "🔵 Medium" },
                  { value: "high", label: "🟡 High" },
                  { value: "urgent", label: "🔴 Urgent" },
                ]}
              />
            </Form.Item>
            <Form.Item
              name="status"
              label="Column"
              initialValue="todo"
              style={{ flex: 1 }}
            >
              <Select
                options={COLUMNS.map((c) => ({
                  value: c.key,
                  label: `${c.emoji} ${c.title}`,
                }))}
              />
            </Form.Item>
          </Space>
          <Form.Item>
            <motion.div whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.98 }}>
              <Button
                type="primary"
                htmlType="submit"
                block
                style={{
                  background: "var(--c-accent)",
                  border: "none",
                  fontWeight: 700,
                  borderRadius: 14,
                  height: 52,
                  boxShadow: "0 8px 24px rgba(124,106,239,0.3)",
                }}
              >
                Create Task
              </Button>
            </motion.div>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default KanbanPage;

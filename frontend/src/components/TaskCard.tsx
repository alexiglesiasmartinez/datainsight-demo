import React, { useState, useRef, useEffect } from 'react';
import styled from 'styled-components';
import { motion } from 'framer-motion';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import toast from 'react-hot-toast';
import { Pencil, Trash2 } from 'lucide-react';

interface Props {
  task: { id: number; title: string; stage: number };
  onDelete: () => void;
  onTaskUpdate: (updatedTask: any) => void;
}

const Card = styled(motion.div)`
  background: rgba(255, 255, 255, 0.08);
  backdrop-filter: blur(12px);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 16px;
  padding: 14px 16px;
  position: relative;
  cursor: grab;
  user-select: none;

  &:hover {
    border-color: #3b82f6;
    box-shadow: 0 8px 25px rgba(59, 130, 246, 0.15);
  }

  &:active { cursor: grabbing; }
`;

const Content = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  min-height: 36px;
`;

const Title = styled.span`
  color: white;
  font-size: 1rem;
  font-weight: 500;
  word-break: break-word;
  flex: 1;
  padding-right: 50px;
`;

const EditInput = styled.input`
  flex: 1;
  background: rgba(255, 255, 255, 0.15);
  border: 2px solid #3b82f6;
  border-radius: 12px;
  padding: 10px 14px;
  color: white;
  font-size: 1rem;
  font-weight: 500;
  outline: none;
  font-family: inherit;
`;

const Actions = styled.div`
  position: absolute;
  right: 8px;
  top: 50%;
  transform: translateY(-50%);
  display: flex;
  gap: 6px;
  opacity: 0;
  transition: opacity 0.2s ease;
  ${Card}:hover & { opacity: 1; }
`;

const Icon = styled.button`
  width: 34px;
  height: 34px;
  background: rgba(255, 255, 255, 0.1);
  border: none;
  border-radius: 10px;
  color: white;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s ease;

  &:hover { background: rgba(255, 255, 255, 0.25); }
  &.delete:hover { background: #ef4444; }
`;

export const TaskCard: React.FC<Props> = ({ task, onDelete, onTaskUpdate }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [title, setTitle] = useState(task.title);
  const inputRef = useRef<HTMLInputElement>(null);

  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: task.id,
    disabled: isEditing,
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [isEditing]);

  const saveTitle = async () => {
    const trimmed = title.trim();
    if (!trimmed || trimmed === task.title) {
      setIsEditing(false);
      return;
    }

    const optimisticTask = { ...task, title: trimmed };
    onTaskUpdate(optimisticTask);

    try {
      const res = await fetch(`http://localhost:8000/api/tasks/${task.id}/`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: trimmed }),
      });

      if (!res.ok) throw new Error();

      const updatedTask = await res.json();
      onTaskUpdate(updatedTask);
      toast.success('Task updated');
    } catch {
      onTaskUpdate(task);
      setTitle(task.title);
      toast.error('Error updating task');
    } finally {
      setIsEditing(false);
    }
  };

  const deleteTask = async () => {
    try {
      await fetch(`http://localhost:8000/api/tasks/${task.id}/`, { method: 'DELETE' });
      onDelete();
      toast.success('Task deleted');
    } catch {
      toast.error('Error deleting task');
    }
  };

  return (
    <Card ref={setNodeRef} style={style} {...attributes} {...(isEditing ? {} : listeners)} layout>
      <Content>
        {isEditing ? (
          <EditInput
            ref={inputRef}
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            onBlur={saveTitle}
            onKeyDown={(e) => {
              if (e.key === 'Enter') saveTitle();
              if (e.key === 'Escape') {
                setTitle(task.title);
                setIsEditing(false);
              }
            }}
          />
        ) : (
          <Title onDoubleClick={() => setIsEditing(true)}>{task.title}</Title>
        )}

        {!isEditing && (
          <Actions>
            <Icon onClick={() => setIsEditing(true)}><Pencil size={16} /></Icon>
            <Icon className="delete" onClick={deleteTask}><Trash2 size={16} /></Icon>
          </Actions>
        )}
      </Content>
    </Card>
  );
};
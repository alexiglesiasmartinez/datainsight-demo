import React, { useState } from 'react';
import styled from 'styled-components';
import { motion, AnimatePresence } from 'framer-motion';
import { TaskCard } from './TaskCard';
import toast from 'react-hot-toast';
import { Pencil, Trash2 } from 'lucide-react';

interface Task { id: number; title: string; stage: number; }
interface Stage { id: number; name: string; order: number; }

const Column = styled(motion.div)`
  background: rgba(255, 255, 255, 0.06);
  backdrop-filter: blur(16px);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 20px;
  padding: 20px;
  width: 340px;
  min-width: 340px;
  max-width: 100vw;
  flex-shrink: 0;
  display: flex;
  flex-direction: column;
  gap: 16px;

  @media (max-width: 768px) {
    width: 100%;
    min-width: auto;
    border-radius: 16px;
    padding: 16px;
  }

  &:hover {
    border-color: #3b82f6;
    box-shadow: 0 10px 30px rgba(59, 130, 246, 0.15);
  }
`;

const Header = styled.div`display: flex; justify-content: space-between; align-items: center;`;
const TitleWrapper = styled.div`flex: 1; margin-right: 12px;`;
const StageTitle = styled(motion.h3)`
  font-size: 1.35rem;
  padding-left: 2px;
  margin: 0;
  font-weight: 700;
  color: white;
  cursor: pointer;
  background: linear-gradient(90deg, #3b82f6, #60a5fa);
  -webkit-background-clip: text;
  color: transparent;
`;

const Actions = styled(motion.div)`
  display: flex;
  gap: 8px;
  opacity: 0;
  transition: opacity 0.2s ease;
  ${Column}:hover & { opacity: 1; }
`;

const IconBtn = styled(motion.button)`
  width: 38px;
  height: 38px;
  border-radius: 12px;
  background: rgba(255,255,255,0.1);
  border: none;
  color: white;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  backdrop-filter: blur(10px);
  &:hover { background: rgba(255,255,255,0.2); }
  &.delete:hover { background: rgba(239,68,68,0.4); color: white; }
`;

const AddTaskInput = styled(motion.input)`
  background: rgba(255,255,255,0.08);
  border: 1px dashed rgba(255,255,255,0.2);
  border-radius: 12px;
  padding: 14px;
  color: white;
  font-size: 1rem;
  outline: none;
  &::placeholder { color: rgba(255,255,255,0.4); }
`;

const TaskList = styled.div`flex: 1; display: flex; flex-direction: column; gap: 12px;`;

interface Props {
  stage: Stage;
  tasks: Task[];
  onStageUpdate: (updatedStage: Stage) => void;
  onStageDelete: (stageId: number) => void;
  onRefreshTasks: () => void;
  onTaskUpdate: (updatedTask: Task) => void;
}

export const StageColumn: React.FC<Props> = ({
  stage,
  tasks,
  onStageUpdate,
  onStageDelete,
  onRefreshTasks,
  onTaskUpdate,
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [name, setName] = useState(stage.name);
  const [newTask, setNewTask] = useState('');

  const saveName = async () => {
    const trimmed = name.trim();
    if (!trimmed || trimmed === stage.name) {
      setIsEditing(false);
      return;
    }

    try {
      const res = await fetch(`http://localhost:8000/api/stages/${stage.id}/`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: trimmed }),
      });
      if (!res.ok) throw new Error();
      onStageUpdate({ ...stage, name: trimmed });
      toast.success('Stage renamed');
    } catch {
      toast.error('Error renaming stage');
      setName(stage.name);
    }
    setIsEditing(false);
  };

  const deleteStage = async () => {
    if (tasks.length > 0) {
      toast.error('Empty the stage first');
      return;
    }

    toast.loading(`Deleting "${stage.name}"...`, { id: 'deleting' });
    try {
      const res = await fetch(`http://localhost:8000/api/stages/${stage.id}/delete/`, { method: 'DELETE' });
      if (!res.ok) throw new Error();
      onStageDelete(stage.id);
      toast.success('Stage deleted', { id: 'deleting' });
    } catch {
      toast.error('Error deleting stage', { id: 'deleting' });
    }
  };

  const addTask = async () => {
    if (!newTask.trim()) return;
    try {
      await fetch('http://localhost:8000/api/tasks/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: newTask.trim(), stage: stage.id }),
      });
      setNewTask('');
      onRefreshTasks();
    } catch {
      toast.error('Error adding task');
    }
  };

  return (
    <Column layout initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, scale: 0.9, x: -100 }}>
      <Header>
        <TitleWrapper>
          {isEditing ? (
            <motion.input
              initial={{ scale: 0.95 }}
              animate={{ scale: 1 }}
              value={name}
              onChange={e => setName(e.target.value)}
              onBlur={saveName}
              onKeyDown={e => e.key === 'Enter' && saveTitle()}
              autoFocus
              style={{
                background: 'rgba(255,255,255,0.12)',
                border: '1px solid #3b82f6',
                borderRadius: 10,
                padding: '8px 12px',
                color: 'white',
                fontSize: '1.35rem',
                fontWeight: 700,
                outline: 'none',
                width: '90%',
              }}
            />
          ) : (
            <StageTitle onClick={() => setIsEditing(true)}>{stage.name}</StageTitle>
          )}
        </TitleWrapper>

        <Actions>
          <IconBtn whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.95 }} onClick={() => setIsEditing(true)}>
            <Pencil size={18} />
          </IconBtn>
          <IconBtn whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.95 }} onClick={deleteStage} className="delete">
            <Trash2 size={18} />
          </IconBtn>
        </Actions>
      </Header>

      <AddTaskInput
        value={newTask}
        onChange={e => setNewTask(e.target.value)}
        onKeyDown={e => e.key === 'Enter' && addTask()}
        placeholder="Add task... (Enter)"
        whileFocus={{ scale: 1.02 }}
      />

      <TaskList>
        <AnimatePresence>
          {tasks.map(task => (
            <TaskCard
              key={task.id}
              task={task}
              onDelete={onRefreshTasks}
              onTaskUpdate={onTaskUpdate}
            />
          ))}
        </AnimatePresence>
      </TaskList>
    </Column>
  );
};
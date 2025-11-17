import React, { useState, useEffect } from 'react';
import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors } from '@dnd-kit/core';
import type { DragEndEvent } from '@dnd-kit/core';
import { StageColumn } from './StageColumn';
import styled from 'styled-components';
import toast from 'react-hot-toast';
import type { Task, Stage } from '../types';

const BoardWrapper = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  margin-bottom: 2rem;
  min-height: 0;
`;

const Board = styled.div`
  flex: 1;
  display: flex;
  gap: 20px;
  overflow-x: auto;
  overflow-y: hidden;
  padding: 16px 18px 40px 18px;
  scroll-snap-type: x mandatory;
  -webkit-overflow-scrolling: touch;

  &::-webkit-scrollbar {
    height: 10px;
  }
  &::-webkit-scrollbar-track {
    background: rgba(255,255,255,0.05);
    border-radius: 6px;
  }
  &::-webkit-scrollbar-thumb {
    background: #3b82f6;
    border-radius: 6px;
  }

  @media (max-width: 768px) {
    gap: 15px;
    padding: 16px 0;
    > * { width: 90%; scroll-snap-align: center; padding: 8px 16px; }
  }
`;

const AddStageBar = styled.div`
  display: flex;
  gap: 12px;
  padding: 12px 16px;
  background: rgba(15, 23, 42, 0.8);
  backdrop-filter: blur(12px);
  position: sticky;
  top: 0;
  z-index: 10;
  border-bottom: 1px solid rgba(255,255,255,0.1);

  @media (max-width: 768px) {
    padding: 12px;
    flex-direction: column;
    button { width: 100%; }
  }
`;

const StageInput = styled.input`
  flex: 1;
  padding: 14px 18px;
  border: 1px solid rgba(59,130,246,0.4);
  border-radius: 14px;
  background: rgba(59,130,246,0.1);
  color: white;
  font-size: 1rem;
  outline: none;
  backdrop-filter: blur(10px);
  &::placeholder { color: rgba(255,255,255,0.6); }
  &:focus { border-color: #3b82f6; box-shadow: 0 0 0 4px rgba(59,130,246,0.2); }
`;

const AddButton = styled.button`
  background: #3b82f6;
  color: white;
  border: none;
  border-radius: 14px;
  padding: 14px 24px;
  font-weight: 600;
  cursor: pointer;
  white-space: nowrap;
  transition: all 0.2s ease;
  &:hover { background: #2563eb; }
`;

export const TaskList: React.FC = () => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [stages, setStages] = useState<Stage[]>([]);
  const [newStageName, setNewStageName] = useState('');

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
    useSensor(KeyboardSensor)
  );

  useEffect(() => {
    fetchTasks();
    fetchStages();
  }, []);

  const fetchTasks = async () => {
    const res = await fetch('http://localhost:8000/api/tasks/');
    const data = await res.json();
    setTasks(data);
  };

  const fetchStages = async () => {
    const res = await fetch('http://localhost:8000/api/stages/');
    const data = await res.json();
    setStages(data);
  };

  const updateTaskInState = (updatedTask: Task) => {
    setTasks(prev => prev.map(t => t.id === updatedTask.id ? updatedTask : t));
  };

  const addStage = async (e: React.FormEvent) => {
    e.preventDefault();
    const name = newStageName.trim();

    if (!name) { toast.error('Stage name cannot be empty'); return; }
    if (name.length < 2) { toast.error('Stage name too short'); return; }
    if (name.length > 50) { toast.error('Stage name too long'); return; }
    if (stages.some(s => s.name.toLowerCase() === name.toLowerCase())) {
      toast.error('A stage with this name already exists');
      return;
    }

    try {
      const res = await fetch('http://localhost:8000/api/stages/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, order: stages.length }),
      });

      if (!res.ok) throw new Error();
      const newStage = await res.json();
      setStages([...stages, newStage]);
      setNewStageName('');
      toast.success('Stage created!');
    } catch {
      toast.error('Error creating stage');
    }
  };

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over) return;

    const taskId = Number(active.id);
    const task = tasks.find(t => t.id === taskId);
    if (!task) return;

    const newStageId = stages.some(s => s.id === Number(over.id))
      ? Number(over.id)
      : tasks.find(t => t.id === Number(over.id))?.stage || task.stage;

    if (newStageId !== task.stage) {
      const updatedTask = { ...task, stage: newStageId };
      updateTaskInState(updatedTask);

      try {
        await fetch(`http://localhost:8000/api/tasks/${taskId}/`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(updatedTask),
        });
        toast.success('Task moved');
      } catch {
        fetchTasks();
        toast.error('Error moving task');
      }
    }
  };

  return (
    <BoardWrapper>
      <AddStageBar as="form" onSubmit={addStage}>
        <StageInput value={newStageName} onChange={e => setNewStageName(e.target.value)} placeholder="New stage name..." />
        <AddButton type="submit">+ Add Stage</AddButton>
      </AddStageBar>

      <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
        <Board>
          {stages
            .sort((a, b) => a.order - b.order)
            .map(stage => (
              <StageColumn
                key={stage.id}
                stage={stage}
                tasks={tasks.filter(t => t.stage === stage.id)}
                onStageUpdate={updated => setStages(stages.map(s => s.id === updated.id ? updated : s))}
                onStageDelete={id => setStages(stages.filter(s => s.id !== id))}
                onRefreshTasks={fetchTasks}
                onTaskUpdate={updateTaskInState}
              />
            ))}
        </Board>
      </DndContext>
    </BoardWrapper>
  );
};
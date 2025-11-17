import React, { useState } from 'react';
import styled from 'styled-components';

interface Stage {
  id: number;
  name: string;
}

interface Task {
  id: number;
  title: string;
  completed: boolean;
  stage: number;
}

interface Props {
  task: Task;
  onEdit: (task: Task) => void;
  onDelete: (id: number) => void;
  onStageChange: (taskId: number, stageId: number) => void;
  stages: Stage[];
}

export const TaskItem: React.FC<Props> = ({
  task,
  onEdit,
  onDelete,
  onStageChange,
  stages,
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editTitle, setEditTitle] = useState(task.title);

  const toggleComplete = () => {
    onEdit({ ...task, completed: !task.completed });
  };

  const saveEdit = () => {
    const trimmed = editTitle.trim();
    if (!trimmed || trimmed.length < 2 || trimmed.length > 100) {
      alert('Invalid title');
      return;
    }
    onEdit({ ...task, title: trimmed });
    setIsEditing(false);
  };

  const handleMenuClick = () => {
    const action = prompt("Choose action: 'edit' or 'delete'");
    if (action === 'edit') {
      setIsEditing(true);
    } else if (action === 'delete') {
      if (confirm('Are you sure you want to delete this task?')) {
        onDelete(task.id);
      }
    }
  };

  return (
    <TaskCard>
      <CheckboxContainer>
        <Checkbox
          type="checkbox"
          checked={task.completed}
          onChange={toggleComplete}
          aria-label={`Mark task "${task.title}" as ${task.completed ? 'incomplete' : 'complete'}`}
        />
      </CheckboxContainer>

      {isEditing ? (
        <EditInput
          value={editTitle}
          onChange={(e) => setEditTitle(e.target.value)}
          onBlur={saveEdit}
          onKeyDown={(e) => e.key === 'Enter' && saveEdit()}
          autoFocus
        />
      ) : (
        <TaskText $completed={task.completed}>{task.title}</TaskText>
      )}

      <MenuButton onClick={handleMenuClick}>⋮</MenuButton>
    </TaskCard>
  );
};

const TaskCard = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 16px;
  background: ${({ theme }) => theme.bg};
  border: 1px solid ${({ theme }) => theme.border};
  border-radius: 8px;
  transition: background 0.2s ease;

  &:hover {
    background: ${({ theme }) => theme.surface};
  }
`;

const CheckboxContainer = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 24px;
  height: 24px;
`;

const Checkbox = styled.input.attrs({ type: 'checkbox' })`
  width: 16px;
  height: 16px;
  accent-color: ${({ theme }) => theme.primary};
  cursor: pointer;
`;

const TaskText = styled.span<{ $completed?: boolean }>`
  flex: 1;
  text-decoration: ${({ $completed }) => ($completed ? 'line-through' : 'none')};
  color: ${({ theme, $completed }) =>
    $completed ? theme.textSecondary : theme.text};
  font-size: 0.95rem;
  word-break: break-word;
`;

const EditInput = styled.input`
  flex: 1;
  padding: 8px 12px;
  border: 1px solid ${({ theme }) => theme.border};
  border-radius: 8px;
  background: ${({ theme }) => theme.surface};
  color: ${({ theme }) => theme.text};
  font-size: 0.95rem;
  outline: none;

  &:focus {
    border-color: ${({ theme }) => theme.primary};
    box-shadow: 0 0 0 3px ${({ theme }) => `${theme.primary}20`};
  }
`;

const MenuButton = styled.button`
  background: none;
  border: none;
  color: ${({ theme }) => theme.textSecondary};
  font-size: 1.2rem;
  cursor: pointer;
  padding: 4px;
  border-radius: 4px;
  transition: color 0.2s ease;

  &:hover {
    color: ${({ theme }) => theme.text};
    background: ${({ theme }) => theme.surface};
  }
`;
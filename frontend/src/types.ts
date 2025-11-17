export interface Task {
  id: number;
  title: string;
  completed: boolean;
  stage: number;
  created_at: string;
}

export interface Stage {
  id: number;
  name: string;
  order: number;
}
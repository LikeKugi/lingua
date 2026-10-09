export type TaskType = 'words' | 'sentence';

export type HistoryItem = {
  id: string;
  createdAt: number;
  taskType: TaskType;
  task: string | string[];
  userAnswer: string;
  correctAnswer: string;
  response: string;
  model: string;
  language: string;
};

export type PromptTemplate = {
  id: string;
  title: string;
  body: string;
  enabled: boolean;
  builtin: boolean;
};

export type ExplanationInput = {
  taskType: TaskType;
  task: string | string[];
  userAnswer: string;
  correctAnswer: string;
  model: string;
  language: string;
};

export type ChatMessage = {
  role: 'system' | 'user';
  content: string;
};

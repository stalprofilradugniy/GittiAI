
export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: Date;
}

export interface PredefinedTopic {
  id: string;
  title: string;
  prompt: string;
}

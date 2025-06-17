export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: Date;
}

export interface PredefinedTopic {
  id:string;
  title: string;
  prompt: string;
}

export interface ModelOption {
  id: string; // ID модели, например, 'gemini-2.5-flash-preview-04-17'
  name: string; // Отображаемое имя, например, 'Gemini Flash (Быстрый)'
}
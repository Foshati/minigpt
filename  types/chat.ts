// types/chat.ts
export interface Message {
    id: string;
    role: 'user' | 'assistant' | 'system';
    content: string;
    timestamp?: number;
    attachments?: Array<{
      type: 'image';
      url: string;
    }>;
  }
  
  export interface ChatConfig {
    apiKey: string;
    model: string;
    temperature: number;
    maxTokens: number;
    topP: number;
    frequencyPenalty: number;
    presencePenalty: number;
    enableVision: boolean;
  }
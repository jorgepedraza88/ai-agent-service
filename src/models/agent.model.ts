export interface Tool {
  name: string;
  description: string;
  parameters: Record<string, any>;
  handler: Function;
}

export interface AgentConfig {
  name: string;
  description: string;
  model: string;
  tools: Tool[];
  temperature: number;
  useKnowledgeBase: boolean;
}

export interface Message {
  role: 'system' | 'user' | 'assistant' | 'function';
  content: string;
  name?: string;
}

import { create } from 'zustand';
import { RiskInfo } from '@/lib/risk';

export interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  risk?: RiskInfo;
}

interface ChatStore {
  messages: Message[];
  currentRisk: RiskInfo | null;
  isLoading: boolean;
  language: 'en' | 'tw';
  sessionId: string | null;
  selectedModel: string;
  addMessage: (message: Message) => void;
  setLoading: (loading: boolean) => void;
  setLanguage: (lang: 'en' | 'tw') => void;
  setCurrentRisk: (risk: RiskInfo) => void;
  setSessionId: (id: string) => void;
  setSelectedModel: (model: string) => void;
  clearChat: () => void;
}

export const useChatStore = create<ChatStore>((set) => ({
  messages: [],
  currentRisk: null,
  isLoading: false,
  language: 'en',
  sessionId: null,
  selectedModel: 'mistral:7b',
  addMessage: (message) =>
    set((state) => ({ messages: [...state.messages, message] })),
  setLoading: (loading) => set({ isLoading: loading }),
  setLanguage: (lang) => set({ language: lang }),
  setCurrentRisk: (risk) => set({ currentRisk: risk }),
  setSessionId: (id) => set({ sessionId: id }),
  setSelectedModel: (model) => set({ selectedModel: model }),
  clearChat: () => set({ messages: [], currentRisk: null, sessionId: null }),
}));

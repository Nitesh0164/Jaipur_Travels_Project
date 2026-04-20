import { create } from 'zustand'
import { INITIAL_MESSAGES } from '../data/mockChat'
export const useChatStore = create((set, get) => ({
  messages: INITIAL_MESSAGES,
  streaming: false,
  addMessage: (m) => set(s => ({ messages:[...s.messages,{...m,id:`msg_${Date.now()}`}] })),
  setStreaming: (v) => set({ streaming:v }),
  clear: () => set({ messages:INITIAL_MESSAGES, streaming:false }),
}))

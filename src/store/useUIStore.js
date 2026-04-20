import { create } from 'zustand'
export const useUIStore = create((set, get) => ({
  toasts: [],
  modal: null,
  sidebarOpen: false,
  showToast: ({ message, type='success', duration=3000 }) => {
    const id = `t_${Date.now()}`
    set(s => ({ toasts:[...s.toasts,{id,message,type}] }))
    setTimeout(() => set(s => ({ toasts:s.toasts.filter(t=>t.id!==id) })), duration)
  },
  openModal: (name) => set({ modal:name }),
  closeModal: ()   => set({ modal:null }),
  setSidebar: (v)  => set({ sidebarOpen:v }),
}))

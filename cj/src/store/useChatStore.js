import { create } from 'zustand'
import { post, get, del } from '../lib/api'

/**
 * Chat store — uses authenticated /api/chat endpoints.
 *
 * POST /api/chat/message  → ChatReplyResponse { sessionId, reply, suggestions, ... }
 * GET  /api/chat/sessions → ChatSessionResponse[]
 * GET  /api/chat/sessions/{id} → ChatSessionResponse { messages }
 * DELETE /api/chat/sessions/{id}
 */
export const useChatStore = create((set, get_) => ({
  messages: [
    {
      id: 'welcome',
      role: 'ai',
      type: 'text',
      text: "🏰 **Namaste!** I'm your Jaipur AI travel planner.\n\nAsk me anything about Jaipur — best places, bus routes, weather tips, food spots, or let me build your entire trip itinerary!\n\nTry: *\"Plan a 2-day heritage trip for ₹3000\"*",
      ts: new Date().toISOString(),
    },
  ],
  streaming: false,
  sessionId: null,
  sessions: [],
  error: null,

  /**
   * Send a message via POST /api/chat/message
   * Adds user message + AI reply to local messages array.
   */
  sendMessage: async (text) => {
    const userMsg = {
      id: `user_${Date.now()}`,
      role: 'user',
      type: 'text',
      text,
      ts: new Date().toISOString(),
    }

    // Add user message + typing indicator
    set((s) => ({
      messages: [
        ...s.messages,
        userMsg,
        { id: 'typing', role: 'ai', type: 'typing', text: '', ts: new Date().toISOString() },
      ],
      streaming: true,
    }))

    try {
      const reply = await post('/api/chat/message', {
        sessionId: get_().sessionId || null,
        message: text,
        city: 'Jaipur',
      })

      // Update sessionId if returned
      const newSessionId = reply.sessionId || get_().sessionId

      // Build AI message
      const aiMsg = {
        id: `ai_${Date.now()}`,
        role: 'ai',
        type: 'text',
        text: reply.reply || 'Sorry, I couldn\'t generate a response.',
        ts: new Date().toISOString(),
        suggestions: reply.suggestions || [],
        sourceType: reply.sourceType,
        relatedData: reply.relatedData,
      }

      set((s) => ({
        messages: s.messages.filter((m) => m.type !== 'typing').concat(aiMsg),
        streaming: false,
        sessionId: newSessionId,
      }))

      return reply
    } catch (err) {
      // Remove typing indicator and add error message
      const errMsg = {
        id: `err_${Date.now()}`,
        role: 'ai',
        type: 'text',
        text: `❌ ${err.message || 'Failed to get a response. Please try again.'}`,
        ts: new Date().toISOString(),
      }

      set((s) => ({
        messages: s.messages.filter((m) => m.type !== 'typing').concat(errMsg),
        streaming: false,
        error: err.message,
      }))

      return null
    }
  },

  /**
   * Legacy addMessage for components that still use it directly
   */
  addMessage: (m) =>
    set((s) => ({
      messages: [...s.messages, { ...m, id: m.id || `msg_${Date.now()}` }],
    })),

  setStreaming: (v) => set({ streaming: v }),

  /**
   * GET /api/chat/sessions → list all sessions
   */
  fetchSessions: async () => {
    try {
      const data = await get('/api/chat/sessions')
      set({ sessions: data || [] })
    } catch (err) {
      console.error('[Chat] fetchSessions failed:', err.message)
    }
  },

  /**
   * GET /api/chat/sessions/{id} → load a session with messages
   */
  loadSession: async (id) => {
    try {
      const data = await get(`/api/chat/sessions/${id}`)
      if (data?.messages) {
        const mapped = data.messages.map((m) => ({
          id: String(m.id),
          role: m.role?.toLowerCase() === 'user' ? 'user' : 'ai',
          type: 'text',
          text: m.content || '',
          ts: m.createdAt || new Date().toISOString(),
        }))
        set({ messages: mapped, sessionId: data.id })
      }
    } catch (err) {
      console.error('[Chat] loadSession failed:', err.message)
    }
  },

  /**
   * DELETE /api/chat/sessions/{id}
   */
  deleteSession: async (id) => {
    try {
      await del(`/api/chat/sessions/${id}`)
      set((s) => ({
        sessions: s.sessions.filter((sess) => sess.id !== id),
        ...(s.sessionId === id ? { sessionId: null } : {}),
      }))
    } catch (err) {
      console.error('[Chat] deleteSession failed:', err.message)
    }
  },

  clear: () =>
    set({
      messages: [
        {
          id: 'welcome',
          role: 'ai',
          type: 'text',
          text: "🏰 **Namaste!** I'm your Jaipur AI travel planner. Ask me anything!",
          ts: new Date().toISOString(),
        },
      ],
      streaming: false,
      sessionId: null,
      error: null,
    }),
}))

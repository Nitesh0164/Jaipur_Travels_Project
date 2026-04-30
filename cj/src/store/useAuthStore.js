import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { post, get } from '../lib/api'

export const useAuthStore = create(
  persist(
    (set, get_) => ({
      user: null,
      accessToken: null,
      refreshToken: null,
      isAuthenticated: false,
      loading: false,
      error: null,

      /**
       * POST /api/auth/signup
       * Body: { name, email, password }
       * Returns: { accessToken, refreshToken, tokenType, user }
       */
      signup: async ({ name, email, password }) => {
        set({ loading: true, error: null })
        try {
          const data = await post(
            '/api/auth/signup',
            { name, email, password },
            { auth: false }
          )


          set({
            user: data.user,
            accessToken: data.accessToken,
            refreshToken: data.refreshToken,
            isAuthenticated: true,
            loading: false,
          })
          return { success: true, user: data.user }
        } catch (err) {
          set({ loading: false, error: err.message })
          return { success: false, message: err.message }
        }
      },

      /**
       * POST /api/auth/login
       * Body: { email, password }
       * Returns: { accessToken, refreshToken, tokenType, user }
       */
      login: async ({ email, password }) => {
        set({ loading: true, error: null })
        try {
          const data = await post(
            '/api/auth/login',
            { email, password },
            { auth: false }
          )



          set({
            user: data.user,
            accessToken: data.accessToken,
            refreshToken: data.refreshToken,
            isAuthenticated: true,
            loading: false,
          })
          return { success: true, user: data.user }
        } catch (err) {
          set({ loading: false, error: err.message })
          return { success: false, message: err.message }
        }
      },

      /**
       * POST /api/auth/logout
       * Clears tokens and user state.
       */
      logout: async () => {
        const { refreshToken } = get_()
        try {
          if (refreshToken) {
            await post('/api/auth/logout', { refreshToken }).catch(() => { })
          }
        } finally {
          set({
            user: null,
            accessToken: null,
            refreshToken: null,
            isAuthenticated: false,
            error: null,
          })
        }
      },

      /**
       * GET /api/auth/me
       * Refreshes user info on app load (if token exists).
       */
      fetchMe: async () => {
        const { accessToken } = get_()
        if (!accessToken) return
        try {
          const data = await get('/api/auth/me')
          set({ user: data, isAuthenticated: true })
        } catch {
          // Token invalid — clear auth
          set({
            user: null,
            accessToken: null,
            refreshToken: null,
            isAuthenticated: false,
          })
        }
      },

      clearError: () => set({ error: null }),
    }),
    {
      name: 'complete-jaipur-auth',
      partialize: (state) => ({
        user: state.user,
        accessToken: state.accessToken,
        refreshToken: state.refreshToken,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
)
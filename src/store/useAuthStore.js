import { create } from 'zustand'
import { persist } from 'zustand/middleware'

const ADMIN_EMAIL = 'admin@jaipur.com'
const ADMIN_PASSWORD = 'admin123'

export const useAuthStore = create(
  persist(
    (set, get) => ({
      users: [
        {
          id: 'admin_001',
          name: 'Admin',
          email: ADMIN_EMAIL,
          password: ADMIN_PASSWORD,
          role: 'ADMIN',
        },
      ],
      user: null,
      token: null,
      isAuthenticated: false,

      signup: ({ name, email, password }) => {
        const normalizedEmail = email.trim().toLowerCase()

        const existingUser = get().users.find(
          (u) => u.email.toLowerCase() === normalizedEmail
        )

        if (existingUser) {
          return { success: false, message: 'User already exists' }
        }

        const role = normalizedEmail === ADMIN_EMAIL ? 'ADMIN' : 'USER'

        const newUser = {
          id: `user_${Date.now()}`,
          name,
          email: normalizedEmail,
          password,
          role,
        }

        const updatedUsers = [...get().users, newUser]
        const token = `mock_token_${Date.now()}`

        set({
          users: updatedUsers,
          user: {
            id: newUser.id,
            name: newUser.name,
            email: newUser.email,
            role: newUser.role,
          },
          token,
          isAuthenticated: true,
        })

        return {
          success: true,
          user: {
            id: newUser.id,
            name: newUser.name,
            email: newUser.email,
            role: newUser.role,
          },
        }
      },

      login: ({ email, password }) => {
        const normalizedEmail = email.trim().toLowerCase()

        const existingUser = get().users.find(
          (u) => u.email.toLowerCase() === normalizedEmail
        )

        if (!existingUser) {
          return { success: false, message: 'User not found' }
        }

        if (existingUser.password !== password) {
          return { success: false, message: 'Invalid password' }
        }

        const token = `mock_token_${Date.now()}`

        set({
          user: {
            id: existingUser.id,
            name: existingUser.name,
            email: existingUser.email,
            role: existingUser.role,
          },
          token,
          isAuthenticated: true,
        })

        return {
          success: true,
          user: {
            id: existingUser.id,
            name: existingUser.name,
            email: existingUser.email,
            role: existingUser.role,
          },
        }
      },

      logout: () => {
        set({
          user: null,
          token: null,
          isAuthenticated: false,
        })
      },
    }),
    {
      name: 'complete-jaipur-auth',
    }
  )
)
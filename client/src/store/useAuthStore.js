import { create } from 'zustand'
import api from '../api/axios'

const useAuthStore = create((set) => ({
  user: null,
  isLoading: true,
  sidebarOpen: true,

  setUser: (user) => set({ user }),

  login: async (email, password) => {
    const { data } = await api.post('/auth/login', { email, password })
    window.__accessToken = data.accessToken
    localStorage.setItem('refreshToken', data.refreshToken)
    set({ user: data.user })
    return data.user
  },

  register: async (payload) => {
    const { data } = await api.post('/auth/register', payload)
    window.__accessToken = data.accessToken
    localStorage.setItem('refreshToken', data.refreshToken)
    set({ user: data.user })
    return data.user
  },

  registerStudent: async (payload) => {
    const { data } = await api.post('/auth/register/student', payload)
    window.__accessToken = data.accessToken
    localStorage.setItem('refreshToken', data.refreshToken)
    set({ user: data.user })
    return data.user
  },

  registerMess: async (payload) => {
    const { data } = await api.post('/auth/register/mess', payload)
    window.__accessToken = data.accessToken
    localStorage.setItem('refreshToken', data.refreshToken)
    set({ user: data.user })
    return data
  },

  logout: async () => {
    try { await api.post('/auth/logout') } catch {}
    window.__accessToken = null
    localStorage.removeItem('refreshToken')
    set({ user: null })
  },

  init: async () => {
    const refreshToken = localStorage.getItem('refreshToken')
    if (!refreshToken) {
      set({ isLoading: false })
      return
    }
    try {
      const { data } = await api.post('/auth/refresh', { refreshToken })
      window.__accessToken = data.accessToken
      localStorage.setItem('refreshToken', data.refreshToken)
      const me = await api.get('/auth/me')
      set({ user: me.data, isLoading: false })
    } catch {
      localStorage.removeItem('refreshToken')
      set({ isLoading: false })
    }
  },

  toggleSidebar: () => set(s => ({ sidebarOpen: !s.sidebarOpen })),
}))

export default useAuthStore

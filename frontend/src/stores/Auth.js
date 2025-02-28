import { defineStore } from 'pinia'
import api from '@/services/api'

export const useAuthStore = defineStore('auth', {
  state: () => ({
    user: JSON.parse(localStorage.getItem('user')) || null,
    token: localStorage.getItem('token') || null,
    isAuthenticated: !!localStorage.getItem('token')
  }),

  actions: {
    async login(credentials) {
      try {
        const response = await api.login(credentials)
        
        // Store user and token in local storage
        localStorage.setItem('user', JSON.stringify(response.user))
        localStorage.setItem('token', response.token)

        // Update store state
        this.user = response.user
        this.token = response.token
        this.isAuthenticated = true

        return response
      } catch (error) {
        // Clear any existing auth data on login failure
        this.logout()
        throw error
      }
    },

    async register(userData) {
      try {
        const response = await api.register(userData)
        
        // Store user and token in local storage
        localStorage.setItem('user', JSON.stringify(response.user))
        localStorage.setItem('token', response.token)

        // Update store state
        this.user = response.user
        this.token = response.token
        this.isAuthenticated = true

        return response
      } catch (error) {
        this.logout()
        throw error
      }
    },

    logout() {
      // Clear local storage
      localStorage.removeItem('user')
      localStorage.removeItem('token')

      // Reset store state
      this.user = null
      this.token = null
      this.isAuthenticated = false
    },

    async fetchUserProfile() {
      try {
        if (!this.isAuthenticated) {
          throw new Error('Not authenticated')
        }
        
        const response = await api.getUserProfile()
        
        // Update user in local storage and store
        localStorage.setItem('user', JSON.stringify(response))
        this.user = response

        return response
      } catch (error) {
        this.logout()
        throw error
      }
    },

    async updateProfile(profileData) {
      try {
        if (!this.isAuthenticated) {
          throw new Error('Not authenticated')
        }

        const response = await api.updateProfile(profileData)
        
        // Update user in local storage and store
        localStorage.setItem('user', JSON.stringify(response))
        this.user = response

        return response
      } catch (error) {
        throw error
      }
    }
  },

  getters: {
    currentUser() {
      return this.user
    },
    
    currentToken() {
      return this.token
    }
  }
})
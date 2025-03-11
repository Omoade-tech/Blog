import { defineStore } from 'pinia'
import api from '@/services/api'

export const useAuthStore = defineStore('auth', {
  state: () => ({
    user: null,
    token: null,
    isAuthenticated: false
  }),

  getters: {
    currentUser() {
      return this.user
    },
    
    currentToken() {
      return this.token
    }
  },

  actions: {
    initialize() {
      // Initialize state from localStorage
      try {
        const storedUser = localStorage.getItem('user');
        const storedToken = localStorage.getItem('token');
        
        if (storedToken) {
          this.token = storedToken;
          this.isAuthenticated = true;
          
          if (storedUser) {
            this.user = JSON.parse(storedUser);
          }
        }
      } catch (error) {
        console.error('Error initializing auth state:', error);
        // Clear potentially corrupt data
        localStorage.removeItem('user');
        localStorage.removeItem('token');
      }
    },

    async login(credentials) {
      try {
        const response = await api.login(credentials);
        
        if (!response.data) {
          throw new Error('Invalid response from server');
        }
        
        // Extract user and token data
        const userData = response.data.user || response.data.data;
        const token = response.data.token || response.data.access_token;
        
        if (!token) {
          throw new Error('No token received from server');
        }
        
        // Store in localStorage
        localStorage.setItem('token', token);
        if (userData) {
          localStorage.setItem('user', JSON.stringify(userData));
        }
        
        // Update store state
        this.user = userData;
        this.token = token;
        this.isAuthenticated = true;
        
        return response.data;
      } catch (error) {
        this.logout();
        throw error;
      }
    },

    async register(formData) {
      try {
        console.log('Form Data being sent:', formData);
        const response = await api.register(formData);
        console.log('Registration response:', response);
        
        // Registration typically doesn't return auth data
        // Just return the response without setting auth state
        return response.data;
      } catch (error) {
        console.error('Registration error:', error.response?.data || error.message);
        throw error;
      }
    },

    logout() {
      // Clear local storage
      localStorage.removeItem('user');
      localStorage.removeItem('token');
      
      // Reset store state
      this.user = null;
      this.token = null;
      this.isAuthenticated = false;
      
      // Call the API logout if needed (but don't wait for it)
      try {
        api.logout().catch(err => console.error('Logout API error:', err));
      } catch (err) {
        console.error('Error during logout:', err);
      }
    }
  }
})
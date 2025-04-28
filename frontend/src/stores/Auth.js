import { defineStore } from 'pinia'
import api from '@/services/api'

export const useAuthStore = defineStore('auth', {
  state: () => ({
    user: null,
    token: null,
    isAuthenticated: false,
    myBlogs: []
  }),

  getters: {
    currentUser() {
      return this.user
    },

    currentToken() {
      return this.token
    },

    userBlogs() {
      return this.myBlogs
    }
  },

  actions: {
    initialize() {
      try {
        const storedUser = localStorage.getItem('user')
        const storedToken = localStorage.getItem('token')

        if (storedToken) {
          this.token = storedToken
          this.isAuthenticated = true

          if (storedUser) {
            this.user = JSON.parse(storedUser)
          }
        }
      } catch (error) {
        console.error('Error initializing auth state:', error)
        localStorage.removeItem('user')
        localStorage.removeItem('token')
      }
    },

    async login(credentials) {
      try {
        const response = await api.login(credentials);
        const responseData = response.data;
        
        console.log('Login response data:', responseData);
        
        // More flexible token extraction
        let token = null;
        if (responseData.token) {
          token = responseData.token;
        } else if (responseData.access_token) {
          token = responseData.access_token;
        } else if (responseData.data && responseData.data.token) {
          token = responseData.data.token;
        }
        
        // More flexible user extraction
        let userData = null;
        if (responseData.user) {
          userData = responseData.user;
        } else if (responseData.data && typeof responseData.data === 'object') {
          // Check if data is likely the user object (has id or email)
          if (responseData.data.id || responseData.data.email) {
            userData = responseData.data;
          }
        }
        
        console.log('Auth store extracted token:', token ? 'Found' : 'Not found');
        console.log('Auth store extracted user:', userData ? 'Found' : 'Not found');
    
        if (!token) {
          console.error('No token found in response:', responseData);
          throw new Error('No token received from server');
        }
    
        localStorage.setItem('token', token);
        if (userData) {
          localStorage.setItem('user', JSON.stringify(userData));
        }
    
        this.user = userData;
        this.token = token;
        this.isAuthenticated = true;
        
        console.log('Auth status after login:', { 
          isAuthenticated: this.isAuthenticated,
          hasToken: !!this.token,
          hasUser: !!this.user
        });
    
        return responseData;
      } catch (error) {
        console.error('Login error in auth store:', error);
        this.logout();
        throw error;
      }
    },

    async register(formData) {
      try {
        console.log('Form Data being sent:', formData)
        const response = await api.register(formData)
        console.log('Registration response:', response)
        return response.data // No auth setup needed
      } catch (error) {
        console.error('Registration error:', error.response?.data || error.message)
        throw error
      }
    },

    logout() {
      localStorage.removeItem('user')
      localStorage.removeItem('token')
      this.user = null
      this.token = null
      this.isAuthenticated = false
      this.myBlogs = []

      try {
        api.logout().catch(err => console.error('Logout API error:', err))
      } catch (err) {
        console.error('Error during logout:', err)
      }
    },

    async fetchUserProfile() {
      try {
        if (!this.isAuthenticated) {
          console.warn('fetchUserProfile called while not authenticated')

          const storedToken = localStorage.getItem('token')
          if (storedToken) {
            this.token = storedToken
            this.isAuthenticated = true
          } else {
            throw new Error('Not authenticated')
          }
        }

        const response = await api.getUserProfile()
        let userData

        if (response.data.status === 'success' && response.data.data) {
          userData = response.data.data
        } else {
          userData = response.data.user || response.data
        }

        localStorage.setItem('user', JSON.stringify(userData))
        this.user = userData

        return userData
      } catch (error) {
        console.error('Error fetching user profile:', error)
        if (error.response && error.response.status === 401) {
          this.logout()
        }
        throw error
      }
    },

    async updateProfile(formData) {
      try {
        if (!this.isAuthenticated) {
          throw new Error('Not authenticated')
        }

        // Ensure formData is actually FormData
        if (!(formData instanceof FormData)) {
          throw new Error('Invalid form data format')
        }

        const response = await api.updateUserProfile(formData)
        let userData

        if (response.data.status === 'success' && response.data.data) {
          userData = response.data.data
        } else {
          userData = response.data.user || response.data
        }

        // Ensure we have a profile image URL
        if (!userData.profile_image) {
          userData.profile_image = '/images/default-profile.png'
        }

        localStorage.setItem('user', JSON.stringify(userData))
        this.user = userData

        return userData
      } catch (error) {
        console.error('Profile update error:', error)
        throw error
      }
    },

    async fetchMyBlogs() {
      try {
        if (!this.isAuthenticated) {
          throw new Error('Not authenticated')
        }

        const response = await api.getMyBlogs()
        let blogs = response.data.data || response.data

        this.myBlogs = blogs
        return blogs
      } catch (error) {
        console.error('Error fetching user blogs:', error.response?.data || error.message)
        if (error.response && error.response.status === 401) {
          this.logout()
        }
        throw error
      }
    },

    async createBlog(blogData) {
      try {
        if (!this.isAuthenticated) {
          throw new Error('Not authenticated')
        }

        const response = await api.createBlog(blogData)
        let blogResponse = response.data.data || response.data

        return blogResponse
      } catch (error) {
        console.error('Error creating blog:', error.response?.data || error.message)
        throw error
      }
    }
  }
})

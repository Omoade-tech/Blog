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
        
        console.log('Login response:', response.data);
        
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
        
        // Check if using fallback authentication
        if (response.data.note === 'Using fallback authentication') {
          console.warn('Using fallback authentication mode');
        }
        
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
      this.myBlogs = []; // Clear blogs on logout
      
      // Call the API logout if needed (but don't wait for it)
      try {
        api.logout().catch(err => console.error('Logout API error:', err));
      } catch (err) {
        console.error('Error during logout:', err);
      }
    },

    async fetchUserProfile() {
      try {
        // Check if authenticated but don't throw an error yet
        if (!this.isAuthenticated) {
          console.warn('fetchUserProfile called while not authenticated');
          
          // Try to re-initialize from localStorage
          const storedToken = localStorage.getItem('token');
          if (storedToken) {
            this.token = storedToken;
            this.isAuthenticated = true;
          } else {
            throw new Error('Not authenticated');
          }
        }
        
        // Make sure we have a token in the store
        console.log('Fetching user profile with token:', this.token);
        
        // Call the correct API method
        const response = await api.getUserProfile();
        console.log('User profile response:', response);
        
        // Check if we got a valid response
        if (!response.data) {
          throw new Error('Invalid response from server');
        }
        
        // Update user in local storage and store
        // Handle nested response structure with 'status' and 'data' fields
        let userData;
        if (response.data.status === 'success' && response.data.data) {
          // API returns {status: 'success', data: {...}}
          userData = response.data.data;
        } else {
          // Fallback to other possible structures
          userData = response.data.user || response.data;
        }
        
        console.log('Extracted user data:', userData);
        localStorage.setItem('user', JSON.stringify(userData));
        this.user = userData;

        return userData;
      } catch (error) {
        console.error('Error fetching user profile:', error);
        // Only logout if it's an authentication error
        if (error.response && error.response.status === 401) {
          this.logout();
        }
        throw error;
      }
    },

    async updateProfile(profileData) {
      try {
        if (!this.isAuthenticated) {
          throw new Error('Not authenticated');
        }
    
        const response = await api.updateUserProfile(profileData);
        
        // Parse the response data structure correctly
        let userData;
        if (response.data.status === 'success' && response.data.data) {
          // API returns {status: 'success', data: {...}}
          userData = response.data.data;
        } else {
          // Fallback to other possible structures
          userData = response.data.user || response.data;
        }
        
        console.log('Updated user data:', userData);
        localStorage.setItem('user', JSON.stringify(userData));
        this.user = userData;
    
        return userData;
      } catch (error) {
        throw error;
      }
    },

    // Add new method for fetching user's blogs
    async fetchMyBlogs() {
      try {
        if (!this.isAuthenticated) {
          throw new Error('Not authenticated');
        }
        
        console.log('Fetching user blogs');
        const response = await api.getMyBlogs();
        
        // Parse the response
        let blogs;
        if (response.data.status === 'success' && response.data.data) {
          blogs = response.data.data;
        } else {
          blogs = response.data;
        }
        
        console.log('User blogs response:', blogs);
        this.myBlogs = blogs;
        return blogs;
      } catch (error) {
        console.error('Error fetching user blogs:', error.response?.data || error.message);
        // Only logout if it's an authentication error
        if (error.response && error.response.status === 401) {
          this.logout();
        }
        throw error;
      }
    },

    // Add new method for creating a blog post
    async createBlog(blogData) {
      try {
        if (!this.isAuthenticated) {
          throw new Error('Not authenticated');
        }
        
        console.log('Creating blog with data:', blogData);
        const response = await api.createBlog(blogData);
        
        // Parse the response
        let blogResponse;
        if (response.data.status === 'success' && response.data.data) {
          blogResponse = response.data.data;
        } else {
          blogResponse = response.data;
        }
        
        console.log('Blog creation response:', blogResponse);
        return blogResponse;
      } catch (error) {
        console.error('Error creating blog:', error.response?.data || error.message);
        throw error;
      }
    }
  }
})
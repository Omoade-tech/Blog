import axios from 'axios';

export const apiClient = axios.create({
    baseURL: 'http://localhost:8000/api',
    headers: {
        'Content-Type': 'application/json',
        'Accept': 'application',
        'X-Requested-with': 'XMLHttpRequest'
    },
    withCredential: true
});

// Get CSRF token before making requests
async function getCsrfToken() {
    try{
        const response = await axios.get('http://localhost:8000/sanctum/csrf-cookie',{
            withCredentials: true,
            headers: {
                'Accept': 'application/json'
            }

        });
        console.log('CSRF Token Response:', response.status);
        return response;
      } catch (error) {
        console.error('Failed to get CSRF token:', error.response || error);
        throw error;
      }  
    }


    // Request interceptor
apiClient.interceptors.request.use(
    async (config) => {
      try {
        // Ensure CSRF token is fetched for all requests
        await getCsrfToken();
        
        // Get token from localStorage
        const token = localStorage.getItem('token');
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
  
        // Additional debugging
        console.log('Request Config:', {
          url: config.url,
          method: config.method,
          headers: config.headers
        });
  
        return config;
      } catch (error) {
        console.error('Request Interceptor Error:', error);
        return Promise.reject(error);
      }
    },
    (error) => {
      console.error('Request Error:', error);
      return Promise.reject(error);
    }
  );
  

  // Response interceptor
apiClient.interceptors.response.use(
    (response) => {
      console.log('Response success:', {
        url: response.config.url,
        status: response.status,
        hasData: !!response.data
      });
      return response;
    },
    (error) => {
      if (error.response) {
        console.error('API Error:', {
          url: error.config?.url,
          status: error.response.status,
          message: error.response.data?.message,
          data: error.response.data
        });
      }
      return Promise.reject(error);
    }
  );

  function handleErrorResponse(response) {
    const status = response.status;
    const message = response.data?.message || 'An error occurred.';
  
    switch (status) {
      case 401:
        // Clear auth state on unauthorized
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        sessionStorage.removeItem('token');
        sessionStorage.removeItem('user');
        break;
      case 403:
        console.error('Forbidden access:', message);
        break;
      case 404:
        console.error('Resource not found:', message);
        break;
      case 422:
        console.error('Validation error:', message);
        break;
      default:
        console.error(`Error ${status}:`, message);
    }
  }


  function ensureToken() {
    const token = localStorage.getItem('token') || sessionStorage.getItem('token')
    if (!token) {
      console.error('No authentication token found')
      throw new Error('Authentication token is missing')
    }
    apiClient.defaults.headers.common['Authorization'] = `Bearer ${token}`
  }


  export default {
    // Auth endpoints
    async login(credentials) {
      try {
        const response = await apiClient.post('/login', credentials);
        console.log('Raw login response:', response.data);
        
        // Check for token in various possible locations
        const token = response.data.token || response.data.access_token || response.data.data?.token;
        const userData = response.data.user || response.data.data;
        
        if (!token) {
          throw new Error('No token received from server');
        }
  
        // Store the raw token without 'Bearer' prefix
        const cleanToken = token.replace('Bearer ', '');
        localStorage.setItem('token', cleanToken);
        
        // Store user data
        if (userData) {
          localStorage.setItem('user', JSON.stringify(userData));
        }
        
        // Set in axios defaults
        apiClient.defaults.headers.common['Authorization'] = `Bearer ${cleanToken}`;
        
        return {
          data: {
            token: cleanToken,
            user: userData
          }
        };
      } catch (error) {
        console.error('Login failed:', error.response?.data || error.message);
        throw error;
      }
    },
  
    register(formData) {
      return apiClient.post('/register', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
    },
  
    logout() {
      return apiClient.post('/logout');
    },
    
    // Blog endpoints
    getAllBlogs() {
      return apiClient.get('/blogs');
    },

    getUserBlogs(userId) {
      return apiClient.get(`/blogs/user/${userId}`);
    },

    getMyBlogs() {
      return apiClient.get('/blogs/my-blogs');
    },

    // getBlog(id) {
    //   return apiClient.get(`/blogs/${id}`);
    // },

    createBlog(blogData) {
      return apiClient.post('/blogs', blogData);
    },

    updateBlog(id, blogData) {
      return apiClient.put(`/blogs/${id}`, blogData);
    },

    deleteBlog(id) {
      return apiClient.delete(`/blogs/${id}`);
    },

    searchBlogs(query, filter = 'all') {
      return apiClient.get('/blogs/search', {
        params: {
          query,
          filter
        }
      });
    },

    // Profile endpoints
    getProfile() {
      return apiClient.get('/profile');
    },

    updateProfile(profileData) {
      // Use FormData to handle file uploads
      const formData = new FormData();
      
      // Append all profile fields to FormData
      Object.keys(profileData).forEach(key => {
        // Special handling for image file
        if (key === 'image' && profileData[key] instanceof File) {
          formData.append('image', profileData[key]);
        } else if (profileData[key] !== null && profileData[key] !== undefined) {
          formData.append(key, profileData[key]);
        }
      });

      return apiClient.post('/profile', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
    }
  }  
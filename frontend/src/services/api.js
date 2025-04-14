import axios from 'axios';

// Get API URL from environment variables or use default
const API_URL = import.meta.env.VITE_API_URL || 'https://blogpost-api.onrender.com';

console.log('API Service initializing with URL:', API_URL);

export const apiClient = axios.create({
    baseURL: API_URL,
    headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'X-Requested-With': 'XMLHttpRequest'
    },
    withCredentials: true,
    timeout: 10000 // 10 seconds timeout
});

// Helper function to get cookie value
function getCookieValue(name) {
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    if (parts.length === 2) return parts.pop().split(';').shift();
    return null;
}

// Get CSRF token before making requests
async function getCsrfToken() {
    try {
        console.log('Fetching CSRF token...');
        
        // Try to get token directly from Laravel endpoint first
        try {
            const csrfResponse = await axios.get(`${apiClient.defaults.baseURL}/api/csrf-token`, {
                withCredentials: true,
                timeout: 5000
            });
            
            if (csrfResponse.data && csrfResponse.data.csrf_token) {
                console.log('Got CSRF token from API endpoint');
                apiClient.defaults.headers['X-CSRF-TOKEN'] = csrfResponse.data.csrf_token;
                return true;
            }
        } catch (err) {
            console.warn('Could not get token from API endpoint, trying sanctum cookie');
        }
        
        // Fall back to sanctum cookie method
        const response = await axios.get(`${apiClient.defaults.baseURL}/sanctum/csrf-cookie`, {
            withCredentials: true,
            timeout: 5000
        });
        
        // Update the X-XSRF-TOKEN header with the new token
        const token = getCookieValue('XSRF-TOKEN');
        if (token) {
            apiClient.defaults.headers['X-XSRF-TOKEN'] = token;
            return true;
        }
        
        console.warn('No CSRF token found in cookies after request');
        return false;
    } catch (error) {
        console.error('Failed to get CSRF token:', error.response?.data || error.message);
        return false;
    }
}

// Request interceptor
apiClient.interceptors.request.use(
    async (config) => {
        try {
            // Skip CSRF token for specific endpoints
            if (!config.url.includes('/login') && !config.url.includes('/register')) {
                await getCsrfToken();
            }
            
            // Get token from localStorage
            const token = localStorage.getItem('token');
            if (token) {
                config.headers.Authorization = `Bearer ${token}`;
            }
            
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
        return response;
    },
    (error) => {
        if (error.response) {
            // Handle specific error status codes
            switch (error.response.status) {
                case 401:
                    // Clear auth state on unauthorized
                    localStorage.removeItem('token');
                    localStorage.removeItem('user');
                    break;
                case 403:
                    console.error('Forbidden access:', error.response.data?.message);
                    break;
                case 404:
                    console.error('Resource not found:', error.response.data?.message);
                    break;
                case 422:
                    console.error('Validation error:', error.response.data?.errors);
                    break;
                case 500:
                    console.error('Server error:', error.response.data?.message);
                    break;
                default:
                    console.error('API Error:', error.response.data);
            }
        } else {
            console.error('Network Error:', error.message);
        }
        return Promise.reject(error);
    }
);

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
            // Skip CSRF token for login
            const response = await apiClient.post('/api/login', credentials);
            console.log('Raw login response:', response.data);
            
            // Check for token in various possible locations
            const token = response.data.token || response.data.access_token || response.data.data?.token;
            const userData = response.data.user || response.data.data;
            
            if (!token) {
                throw new Error('No token received from server');
            }
    
            // Store the raw token
            localStorage.setItem('token', token);
            
            // Store user data
            if (userData) {
                localStorage.setItem('user', JSON.stringify(userData));
            }
            
            // Set in axios defaults
            apiClient.defaults.headers.common['Authorization'] = `Bearer ${token}`;
            
            return {
                data: response.data
            };
        } catch (error) {
            console.error('Login failed:', error.response?.data || error.message);
            
            // If server error (500), try again without CSRF
            if (error.response?.status === 500 && error.config && !error.config._retry) {
                error.config._retry = true;
                console.warn('Retrying login without CSRF protection...');
                try {
                    const retryResponse = await axios.post(`${apiClient.defaults.baseURL}/api/login`, credentials, {
                        headers: {
                            'Content-Type': 'application/json',
                            'Accept': 'application/json'
                        }
                    });
                    
                    if (retryResponse.data) {
                        console.log('Retry login succeeded:', retryResponse.data);
                        return { data: retryResponse.data };
                    }
                } catch (retryError) {
                    console.error('Retry login also failed:', retryError.message);
                }
            }
            
            throw error;
        }
    },
    
    register(formData) {
        try {
            // Convert to a proper FormData object if it's not already one
            const data = formData instanceof FormData ? formData : new FormData();
            
            // If regular object was passed, convert to FormData
            if (!(formData instanceof FormData)) {
                Object.keys(formData).forEach(key => {
                    if (formData[key] !== null && formData[key] !== undefined) {
                        data.append(key, formData[key]);
                    }
                });
            }
            
            // Log what we're sending
            console.log('Sending registration data:', Object.fromEntries(data.entries()));
            
            return apiClient.post('/api/register', data, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                    'Accept': 'application/json'
                }
            });
        } catch (error) {
            console.error('Registration preparation error:', error);
            throw error;
        }
    },
    
    logout() {
        return apiClient.post('/api/logout');
    },
    
    // Blog endpoints
    getAllBlogs() {
        return apiClient.get('/api/blogs');
    },

    // getUserBlogs(userId) {
    //     return apiClient.get(`/blogs/user/${userId}`);
    // },

    getMyBlogs() {
        return apiClient.get('/api/my-blogs');
    },

    createBlog(blogData) {
        return apiClient.post('/api/blogs', blogData);
    },

    updateBlog(id, blogData) {
        return apiClient.put(`/api/blogs/${id}`, blogData);
    },

    deleteBlog(id) {
        return apiClient.delete(`/api/blogs/${id}`);
    },

    searchBlogs(query, filter = 'all') {
        return apiClient.get('/api/blogs/search', {
            params: {
                query,
                filter
            }
        });
    },

    // Profile endpoints
    getUserProfile() {
        
        ensureToken();
        return apiClient.get('/api/profile').then(response => {
            console.log('Profile response:', response);
            return response;
        });
    },

    

updateUserProfile(profileData) {
    ensureToken();
    
    // Use FormData to handle file uploads
    const formData = new FormData();
    
    // Append all profile fields to FormData
    Object.keys(profileData).forEach(key => {
        if (key === 'image') {
            if (profileData[key] instanceof File) {
                formData.append('image', profileData[key]);
            }
        } else if (profileData[key] !== null && profileData[key] !== undefined) {
            formData.append(key, profileData[key]);
        }
    });
    
    return apiClient.post('/api/profile/update', formData, {
        headers: {
            'Content-Type': 'multipart/form-data',
            'Accept': 'application/json'
        }
    }).catch(error => {
        console.error('Profile update error:', error.response?.data || error.message);
        throw error;
    });
}
}
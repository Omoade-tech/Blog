import axios from 'axios';

export const apiClient = axios.create({
    baseURL: 'https://blogpost-db.onrender.com',
    headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'X-Requested-With': 'XMLHttpRequest'
    },
    withCredentials: true
});

// Get CSRF token before making requests
async function getCsrfToken() {
    try {
        const response = await axios.get(`${apiClient.defaults.baseURL}/sanctum/csrf-cookie`, {
            withCredentials: true,
            headers: {
                'Accept': 'application/json'
            }
        });
        console.log('CSRF Token Response:', response.status);
        return response;
    } catch (error) {
        console.error('Failed to get CSRF token:', error.response?.data || error.message);
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
                console.log('Added Authorization header:', `Bearer ${token}`);
            } else {
                console.warn('No token found in localStorage');
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
            
            // Handle specific error status codes
            handleErrorResponse(error.response);
        } else {
            console.error('API Error (no response):', error.message);
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
            const response = await apiClient.post('/api/login', credentials);
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
        return apiClient.post('/api/register', formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        });
    },
    
    logout() {
        return apiClient.post('/api/logout');
    },
    
    // Blog endpoints
    getAllBlogs() {
        return apiClient.get('/api/blogs');
    },

    // getUserBlogs(userId) {
    //     return apiClient.get(`/api/blogs/user/${userId}`);
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
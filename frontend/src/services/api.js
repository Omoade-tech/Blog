import axios from 'axios';

// Get API URL from environment variables or use default
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';
const cleanApiUrl = API_URL.replace(/\/$/, '');

console.log('API URL:', cleanApiUrl);

// Axios instance
export const apiClient = axios.create({
    baseURL: cleanApiUrl,
    headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'X-Requested-With': 'XMLHttpRequest'
    },
    withCredentials: true,
    timeout: 30000, // 30 seconds timeout
    retry: 3,
    retryDelay: 1000
});

// Get cookie value (used for XSRF token)
function getCookieValue(name) {
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    if (parts.length === 2) return parts.pop().split(';').shift();
    return null;
}

// Add retry interceptor
apiClient.interceptors.response.use(null, async (error) => {
    const { config } = error;
    if (!config || !config.retry) {
        return Promise.reject(error);
    }
    
    config.retryCount = config.retryCount || 0;
    
    if (config.retryCount >= config.retry) {
        return Promise.reject(error);
    }
    
    config.retryCount += 1;
    
    const backoff = new Promise(resolve => {
        setTimeout(() => {
            resolve();
        }, config.retryDelay || 1000);
    });
    
    await backoff;
    return apiClient(config);
});

// Fetch CSRF token
let csrfTokenPromise = null;

async function getCsrfToken() {
    // If we already have a token in the headers, return true
    if (apiClient.defaults.headers['X-XSRF-TOKEN']) {
        return true;
    }

    // If we're already fetching a token, return the existing promise
    if (csrfTokenPromise) {
        return csrfTokenPromise;
    }

    // Create a new promise for fetching the token
    csrfTokenPromise = (async () => {
        try {
            console.log('Fetching CSRF token from:', cleanApiUrl);
            
            // Try the Sanctum endpoint first (most common for Laravel)
            const response = await apiClient.get('/sanctum/csrf-cookie', {
                withCredentials: true,
                timeout: 15000,
                retry: 2
            });
            
            console.log('Sanctum CSRF response:', response);
            
            // Check for XSRF-TOKEN in cookies
            const token = getCookieValue('XSRF-TOKEN');
            if (token) {
                console.log('XSRF-TOKEN found in cookies:', token);
                apiClient.defaults.headers['X-XSRF-TOKEN'] = decodeURIComponent(token);
                return true;
            }
            
            // If Sanctum fails, try the /csrf endpoint
            const csrfResponse = await apiClient.get('/csrf', {
                timeout: 15000,
                retry: 2
            });
            if (csrfResponse.data && csrfResponse.data.token) {
                console.log('CSRF token received from /csrf endpoint');
                apiClient.defaults.headers['X-XSRF-TOKEN'] = csrfResponse.data.token;
                return true;
            }

            console.warn('CSRF token not found in cookies or headers.');
            return false;
        } catch (error) {
            console.error('Failed to fetch CSRF token:', error.message);
            if (error.code === 'ECONNABORTED') {
                console.error('CSRF token request timed out. Please check if your backend server is running at:', cleanApiUrl);
            }
            return false;
        } finally {
            // Clear the promise so we can try again if needed
            csrfTokenPromise = null;
        }
    })();

    return csrfTokenPromise;
}

// Request Interceptor
apiClient.interceptors.request.use(
    async (config) => {
        const skipCsrfFor = ['/sanctum/csrf-cookie', '/csrf', '/api/login', '/api/register'];
        const shouldSkip = skipCsrfFor.some(url => config.url.includes(url));
        
        if (!shouldSkip && !apiClient.defaults.headers['X-XSRF-TOKEN']) {
            await getCsrfToken();
        }

        const token = localStorage.getItem('token') || sessionStorage.getItem('token');
        if (token) config.headers.Authorization = `Bearer ${token}`;

        return config;
    },
    (error) => Promise.reject(error)
);

// Response Interceptor
apiClient.interceptors.response.use(
    response => response,
    error => {
        if (error.response) {
            const { status, data } = error.response;
            switch (status) {
                case 401:
                    localStorage.removeItem('token');
                    localStorage.removeItem('user');
                    break;
                case 403:
                    console.error('Forbidden:', data.message);
                    break;
                case 404:
                    console.error('Not found:', data.message);
                    break;
                case 422:
                    console.error('Validation error:', data.errors);
                    break;
                case 500:
                    console.error('Server error:', data.message);
                    break;
                default:
                    console.error('Unhandled API error:', data);
            }
        } else {
            console.error('Network error:', error.message);
        }
        return Promise.reject(error);
    }
);

// Ensure auth token exists before secure requests
function ensureToken() {
    const token = localStorage.getItem('token') || sessionStorage.getItem('token');
    if (!token) throw new Error('Authentication token is missing');
    apiClient.defaults.headers.common['Authorization'] = `Bearer ${token}`;
}

export default {
    // Auth: Login
    async login(credentials) {
        try {
            // Ensure we have a CSRF token before login
            const csrfResult = await getCsrfToken();
            if (!csrfResult) {
                throw new Error('Failed to obtain CSRF token. Please check your backend server connection.');
            }
            
            console.log('Attempting login with credentials:', { email: credentials.email });
            
            const response = await apiClient.post('/api/login', credentials, {
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json',
                    'X-XSRF-TOKEN': apiClient.defaults.headers['X-XSRF-TOKEN']
                },
                timeout: 30000,
                retry: 2
            });
            
            console.log('Login response:', response.data);
            
            // More flexible token and user extraction
            let token = null;
            if (response.data.token) {
                token = response.data.token;
            } else if (response.data.access_token) {
                token = response.data.access_token;
            } else if (response.data.data && response.data.data.token) {
                token = response.data.data.token;
            }
            
            // More flexible user extraction
            let user = null;
            if (response.data.user) {
                user = response.data.user;
            } else if (response.data.data && typeof response.data.data === 'object') {
                // If the user object is directly in the data field
                if (response.data.data.email || response.data.data.id) {
                    user = response.data.data;
                }
            }

            if (!token) {
                console.error('No token in login response:', response.data);
                throw new Error('No token provided by server');
            }

            console.log('Token extracted:', token ? 'Found' : 'Not found');
            console.log('User extracted:', user ? 'Found' : 'Not found');

            // Set the token in localStorage and axios headers
            localStorage.setItem('token', token);
            if (user) {
                localStorage.setItem('user', JSON.stringify(user));
            }
            apiClient.defaults.headers.common['Authorization'] = `Bearer ${token}`;

            return { data: { ...response.data, token, user } };
        } catch (error) {
            console.error('Login failed:', error.response?.data || error.message);
            console.error('Full error:', error);
            throw error;
        }
    },

    // Auth: Register (no token required)
    async register(data) {
        try {
            // Ensure we have a CSRF token before registration
            await getCsrfToken();
            
            console.log('Sending registration data:', data);
            
            return await apiClient.post('/api/register', data, {
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json'
                }
            });
        } catch (error) {
            console.error('Registration failed:', error.response?.data || error.message);
            throw error;
        }
    },

    logout() {
        return apiClient.post('/api/logout');
    },

    // Blogs
    getAllBlogs() {
        return apiClient.get('/api/blogs');
    },

    getMyBlogs() {
        ensureToken();
        return apiClient.get('/api/my-blogs');
    },

    createBlog(data) {
        ensureToken();
        return apiClient.post('/api/blogs', data);
    },

    updateBlog(id, data) {
        ensureToken();
        return apiClient.put(`/api/blogs/${id}`, data);
    },

    deleteBlog(id) {
        ensureToken();
        return apiClient.delete(`/api/blogs/${id}`);
    },

    searchBlogs(query, filter = 'all') {
        return apiClient.get('/api/blogs/search', {
            params: { query, filter }
        });
    },

    // Profile
    getUserProfile() {
        ensureToken();
        return apiClient.get('/api/profile');
    },

    updateUserProfile(profileData) {
        ensureToken();
        const formData = new FormData();

        Object.entries(profileData).forEach(([key, value]) => {
            if (value !== null && value !== undefined) {
                formData.append(key, value);
            }
        });

        return apiClient.post('/api/profile/update', formData, {
            headers: {
                'Content-Type': 'multipart/form-data'
            }
        });
    }
};

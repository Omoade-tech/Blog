import axios from 'axios';

// Get API URL from environment variables or use default
const API_URL = import.meta.env.VITE_API_URL || 'https://blog-46qn.onrender.com';
const cleanApiUrl = API_URL.replace(/\/$/, '');
console.log('API Service initializing with URL:', cleanApiUrl);

// Axios instance
export const apiClient = axios.create({
    baseURL: cleanApiUrl,
    headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'X-Requested-With': 'XMLHttpRequest'
    },
    withCredentials: true,
    timeout: 10000
});

// Get cookie value (used for XSRF token)
function getCookieValue(name) {
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    if (parts.length === 2) return parts.pop().split(';').shift();
    return null;
}

// Fetch CSRF token
async function getCsrfToken() {
    try {
        console.log('Fetching CSRF token...');
        await axios.get(`${cleanApiUrl}/sanctum/csrf-cookie`, {
            withCredentials: true,
            timeout: 5000
        });

        const token = getCookieValue('XSRF-TOKEN');
        if (token) {
            apiClient.defaults.headers['X-XSRF-TOKEN'] = token;
            return true;
        }

        console.warn('CSRF token not found in cookies.');
        return false;
    } catch (error) {
        console.error('Failed to fetch CSRF token:', error.message);
        return false;
    }
}

// Request Interceptor
apiClient.interceptors.request.use(
    async (config) => {
        const skipCsrfFor = ['/api/login', '/api/register'];
        const shouldSkip = skipCsrfFor.some(url => config.url.includes(url));
        if (!shouldSkip) await getCsrfToken();

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
            const response = await apiClient.post('/api/login', credentials);
            const token = response.data.token || response.data.access_token;
            const user = response.data.user || response.data.data;

            if (!token) throw new Error('No token provided by server');

            localStorage.setItem('token', token);
            localStorage.setItem('user', JSON.stringify(user));
            apiClient.defaults.headers.common['Authorization'] = `Bearer ${token}`;

            return { data: response.data };
        } catch (error) {
            console.error('Login failed:', error.response?.data || error.message);
            throw error;
        }
    },

    // Auth: Register (no token required)
    async register(data) {
        try {
            const formData = data instanceof FormData ? data : new FormData();

            if (!(data instanceof FormData)) {
                Object.entries(data).forEach(([key, value]) => {
                    if (value !== null && value !== undefined) {
                        formData.append(key, value);
                    }
                });
            }

            console.log('Sending registration data:', Object.fromEntries(formData.entries()));

            return await apiClient.post('/api/register', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data'
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
                formData.append(key, value instanceof File ? key : key, value);
            }
        });

        return apiClient.post('/api/profile/update', formData, {
            headers: {
                'Content-Type': 'multipart/form-data'
            }
        });
    }
};

// Test script to check API connection and CSRF token fetching
import axios from 'axios';

const API_URL = 'http://localhost:8000';

// Create axios instance
const apiClient = axios.create({
    baseURL: API_URL,
    headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'X-Requested-With': 'XMLHttpRequest'
    },
    withCredentials: true,
    timeout: 10000
});

// Get cookie value
function getCookieValue(name) {
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    if (parts.length === 2) return parts.pop().split(';').shift();
    return null;
}

// Test CSRF token fetching
async function testCsrfToken() {
    try {
        console.log('Testing CSRF token fetching...');
        
        // Try the /csrf endpoint
        const csrfResponse = await apiClient.get('/csrf');
        console.log('CSRF endpoint response:', csrfResponse.data);
        
        // Try the Sanctum endpoint
        const sanctumResponse = await apiClient.get('/sanctum/csrf-cookie');
        console.log('Sanctum CSRF response:', sanctumResponse);
        
        // Check cookies
        const xsrfToken = getCookieValue('XSRF-TOKEN');
        console.log('XSRF-TOKEN in cookies:', xsrfToken);
        
        // Test login
        const loginResponse = await apiClient.post('/api/login', {
            email: 'test@example.com',
            password: 'password'
        });
        console.log('Login response:', loginResponse.data);
        
        return 'CSRF token test completed successfully';
    } catch (error) {
        console.error('CSRF token test failed:', error.message);
        if (error.response) {
            console.error('Response data:', error.response.data);
            console.error('Response status:', error.response.status);
            console.error('Response headers:', error.response.headers);
        }
        return `CSRF token test failed: ${error.message}`;
    }
}

// Run the test
testCsrfToken()
    .then(result => console.log(result))
    .catch(error => console.error('Test error:', error)); 
import axios from 'axios'

// Base API URL from environment variables
const API_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3768/api/v1/auth';

// Create Axios instance with base configuration
const api = axios.create({
    baseURL:API_URL,
    headers:{'Content-Type' : 'application/json'},
    timeout: 15000,
});

/**
 * Request interceptor
 * Attaches the JWT token from localStorage to every outgoing request
 */

api.interceptors.request.use((config) =>{
    const token = localStorage.getItem('AuthToken');
    if(token){
        config.headers.Authorization = `Bearer ${token}`
    }
    return config
}, (error) => Promise.reject(error));

/**
 * Response interceptor
 * Handles 401 Unauthorized globally - redirects to login page
 * Handles other API errors and extracts readable error messages
 */
api.interceptors.response.use(
    (response) => response,
    (error) =>{
        if(error.response && error.response.status == 401){
            localStorage.removeItem('AuthToken');

            if(window.location.pathname !== '/login'){
                window.location.href = '/login';
            }
        }
        return Promise.reject(error);
    }
)

export default api
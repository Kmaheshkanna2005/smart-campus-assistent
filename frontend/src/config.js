// API Configuration
// Use REACT_APP_API_URL environment variable, fallback to localhost for development
const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://127.0.0.1:8000';

// Debug: Log the API URL being used (remove in production if needed)
console.log('API Base URL:', API_BASE_URL);
console.log('REACT_APP_API_URL env var:', process.env.REACT_APP_API_URL);

export default API_BASE_URL;


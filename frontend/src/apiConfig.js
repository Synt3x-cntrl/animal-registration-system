const API_URL = process.env.NODE_ENV === 'production' 
    ? '/api/v1' 
    : 'http://localhost:4000/api/v1';

export default API_URL;

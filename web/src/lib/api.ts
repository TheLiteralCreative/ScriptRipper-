import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

export const api = axios.create({
  baseURL: `${API_URL}/api/v1`,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add auth token to requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('access_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Auth API
export const authApi = {
  login: async (email: string, password: string) => {
    const response = await api.post('/auth/login', { email, password });
    return response.data;
  },

  googleOAuth: () => {
    window.location.href = `${API_URL}/api/v1/auth/oauth/google`;
  },
};

// Analysis API
export const analysisApi = {
  analyze: async (data: {
    transcript: string;
    profile_key: string;
  }) => {
    const response = await api.post('/analyze', data);
    return response.data;
  },

  analyzeCustom: async (data: {
    transcript: string;
    task_name: string;
    prompt: string;
    provider?: string;
    model?: string;
  }) => {
    const response = await api.post('/analyze/custom', {
      transcript: data.transcript,
      task_name: data.task_name,
      prompt: data.prompt,
      provider: data.provider || 'gemini',
      model: data.model || 'models/gemini-2.5-flash',
    });
    return response.data;
  },
};

// Profiles API
export const profilesApi = {
  list: async () => {
    const response = await api.get('/profiles');
    return response.data;
  },
};

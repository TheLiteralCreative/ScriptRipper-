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

  register: async (email: string, password: string, name?: string) => {
    const response = await api.post('/auth/register', { email, password, name });
    return response.data;
  },

  requestPasswordReset: async (email: string) => {
    const response = await api.post('/auth/password-reset/request', { email });
    return response.data;
  },

  confirmPasswordReset: async (token: string, new_password: string) => {
    const response = await api.post('/auth/password-reset/confirm', {
      token,
      new_password,
    });
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

  analyzeBatch: async (data: {
    transcript: string;
    transcript_type: string;
    tasks: Array<{ task_name: string; prompt: string }>;
    provider?: string;
    model?: string;
  }) => {
    const response = await api.post('/analyze/batch', {
      transcript: data.transcript,
      transcript_type: data.transcript_type,
      tasks: data.tasks,
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

// Admin API
export const adminApi = {
  listUsers: async () => {
    const response = await api.get('/admin/users');
    return response.data;
  },

  getUserDetail: async (userId: string) => {
    const response = await api.get(`/admin/users/${userId}`);
    return response.data;
  },

  // Prompt management
  listPrompts: async (category?: string) => {
    const params = category ? { category } : {};
    const response = await api.get('/admin/prompts', { params });
    return response.data;
  },

  createPrompt: async (data: {
    task_name: string;
    prompt: string;
    category: string;
  }) => {
    const response = await api.post('/admin/prompts', data);
    return response.data;
  },

  updatePrompt: async (
    promptId: string,
    data: {
      task_name?: string;
      prompt?: string;
      category?: string;
      is_active?: boolean;
    }
  ) => {
    const response = await api.patch(`/admin/prompts/${promptId}`, data);
    return response.data;
  },

  deletePrompt: async (promptId: string) => {
    const response = await api.delete(`/admin/prompts/${promptId}`);
    return response.data;
  },
};

// Billing API
export const billingApi = {
  createCheckoutSession: async () => {
    const response = await api.post('/billing/create-checkout-session');
    return response.data;
  },

  getSubscriptionStatus: async () => {
    const response = await api.get('/billing/subscription-status');
    return response.data;
  },

  cancelSubscription: async () => {
    const response = await api.post('/billing/cancel-subscription');
    return response.data;
  },
};

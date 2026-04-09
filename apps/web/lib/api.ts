import axios from 'axios';
import Cookies from 'js-cookie';

// En producción (Vercel) sin backend externo usa rutas relativas /api/*
const API_URL = process.env.NEXT_PUBLIC_API_URL ?? '/api';

export const api = axios.create({
  baseURL: API_URL,
  withCredentials: true,
  headers: { 'Content-Type': 'application/json' },
});

// Adjunta access token en cada request
api.interceptors.request.use((config) => {
  const token = Cookies.get('access_token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Refresh token automático en 401
api.interceptors.response.use(
  (res) => res,
  async (error) => {
    const original = error.config;
    if (error.response?.status === 401 && !original._retry) {
      original._retry = true;
      try {
        const { data } = await axios.post(
          `${API_URL}/auth/refresh`,
          {},
          { withCredentials: true },
        );
        Cookies.set('access_token', data.accessToken, { sameSite: 'strict' });
        original.headers.Authorization = `Bearer ${data.accessToken}`;
        return api(original);
      } catch {
        Cookies.remove('access_token');
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  },
);

// ── Auth ──────────────────────────────────────────────────
export const authApi = {
  login: (email: string, password: string) =>
    api.post('/auth/login', { email, password }),
  register: (data: RegisterPayload) => api.post('/auth/register', data),
  logout: () => api.post('/auth/logout'),
  me: () => api.get('/auth/me'),
};

// ── Properties ───────────────────────────────────────────
export const propertiesApi = {
  list: (params?: Record<string, unknown>) =>
    api.get('/properties', { params }),
  get: (id: string) => api.get(`/properties/${id}`),
  create: (data: unknown) => api.post('/properties', data),
  update: (id: string, data: unknown) => api.patch(`/properties/${id}`, data),
  delete: (id: string) => api.delete(`/properties/${id}`),
};

// ── Renters ──────────────────────────────────────────────
export const rentersApi = {
  list: (params?: Record<string, unknown>) => api.get('/renters', { params }),
  get: (id: string) => api.get(`/renters/${id}`),
  create: (data: unknown) => api.post('/renters', data),
  update: (id: string, data: unknown) => api.patch(`/renters/${id}`, data),
};

// ── Contracts ────────────────────────────────────────────
export const contractsApi = {
  list: (params?: Record<string, unknown>) =>
    api.get('/contracts', { params }),
  get: (id: string) => api.get(`/contracts/${id}`),
  create: (data: unknown) => api.post('/contracts', data),
  update: (id: string, data: unknown) => api.patch(`/contracts/${id}`, data),
  terminate: (id: string) => api.post(`/contracts/${id}/terminate`),
};

// ── Payments ─────────────────────────────────────────────
export const paymentsApi = {
  list: (params?: Record<string, unknown>) => api.get('/payments', { params }),
  get: (id: string) => api.get(`/payments/${id}`),
  markManual: (periodId: string, data: unknown) =>
    api.post(`/payments/manual/${periodId}`, data),
  generateLink: (periodId: string) =>
    api.post(`/payments/link/${periodId}`),
};

// ── Dashboard ─────────────────────────────────────────────
export const dashboardApi = {
  stats: () => api.get('/dashboard/stats'),
  cashFlow: (year: number) =>
    api.get('/dashboard/cash-flow', { params: { year } }),
};

// ── Types ─────────────────────────────────────────────────
export interface RegisterPayload {
  fullName: string;
  email: string;
  password: string;
  phone: string;
  companyName?: string;
}

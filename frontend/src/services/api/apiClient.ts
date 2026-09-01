import { supabase } from '../../lib/supabase';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

export const apiFetch = async (endpoint: string, options: RequestInit = {}) => {
  const { data } = await supabase.auth.getSession();
  const token = data?.session?.access_token;

  console.log('Frontend Token Check:', token ? 'Token Exists' : 'TOKEN MISSING');

  const PUBLIC_ENDPOINTS = [
    { method: 'GET', endpoint: '/questions' },
    { method: 'POST', endpoint: '/responses' }
  ];

  const isPublic = PUBLIC_ENDPOINTS.some(
    p => endpoint.includes(p.endpoint) && (options.method || 'GET') === p.method
  );

  if (!token && !isPublic) {
    throw new Error('User not authenticated');
  }

  const headers: Record<string, string> = {
    'Content-Type': 'application/json'
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  // Merge any custom headers provided in options
  if (options.headers) {
    if (options.headers instanceof Headers) {
      options.headers.forEach((value, key) => {
        headers[key] = value;
      });
    } else if (Array.isArray(options.headers)) {
      options.headers.forEach(([key, value]) => {
        headers[key] = value;
      });
    } else {
      Object.assign(headers, options.headers);
    }
  }

  const url = `${API_BASE_URL.replace(/\/$/, '')}/${endpoint.replace(/^\//, '')}`;
  const response = await fetch(url, {
    ...options,
    headers,
  });

  if (!response.ok) {
    const errorBody = await response.json().catch(() => null);
    throw new Error(errorBody?.error || `API request failed with status ${response.status}`);
  }

  return response.json();
};

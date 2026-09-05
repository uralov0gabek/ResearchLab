import { supabase } from '../../lib/supabase';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

export const apiFetch = async (endpoint: string, options: RequestInit = {}) => {
  const { data } = await supabase.auth.getSession();
  const token = data?.session?.access_token;

  const PUBLIC_ENDPOINTS = [
    { method: 'GET', endpoint: '/questions' },
    { method: 'POST', endpoint: '/responses' },
    { method: 'GET', endpoint: '/cpt-tasks' }
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
  
  const MAX_RETRIES = 3;
  let attempt = 0;
  
  while (attempt < MAX_RETRIES) {
    try {
      const response = await fetch(url, {
        ...options,
        headers,
      });

      if (!response.ok) {
        // If it's a 502 or 503 (Render cold start or gateway error), we might want to retry
        if ((response.status === 502 || response.status === 503) && attempt < MAX_RETRIES - 1) {
          throw new Error(`Server waking up or unavailable (${response.status})`);
        }
        
        const errorBody = await response.json().catch(() => null);
        throw new Error(errorBody?.error || `API request failed with status ${response.status}`);
      }

      return await response.json();
    } catch (err: any) {
      attempt++;
      
      // If it's not a network error or a 502/503 (caught above), and not a fetch failure, we should probably not retry
      // but 'Failed to fetch' is a TypeError thrown by fetch() when the network is completely down/closed.
      const isNetworkError = err instanceof TypeError && err.message.includes('Failed to fetch');
      const isServerWaking = err.message && err.message.includes('Server waking up');
      
      if ((isNetworkError || isServerWaking) && attempt < MAX_RETRIES) {
        console.warn(`[apiClient] Request failed (${err.message}), retrying attempt ${attempt}...`);
        // Exponential backoff: 1s, 2s, 4s
        await new Promise(resolve => setTimeout(resolve, Math.pow(2, attempt - 1) * 1000));
        continue;
      }
      
      // If we've exhausted retries or it's a different error (e.g. 400 Bad Request), throw it
      throw err;
    }
  }
};

/**
 * useAuthFetch - Hook để gọi API với authentication
 * Tự động thêm Authorization header từ localStorage token
 */

export function getAuthHeaders(): HeadersInit {
  if (typeof window === 'undefined') return {};
  
  const token = localStorage.getItem('erp_token') || localStorage.getItem('auth_token');
  
  return {
    'Content-Type': 'application/json',
    ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
  };
}

/**
 * Wrapper cho fetch với auto authentication
 */
export async function authFetch(url: string, options: RequestInit = {}): Promise<Response> {
  const headers = {
    ...getAuthHeaders(),
    ...(options.headers || {}),
  };
  
  return fetch(url, {
    ...options,
    headers,
  });
}

/**
 * GET request với auth
 */
export async function authGet(url: string): Promise<Response> {
  return authFetch(url, { method: 'GET' });
}

/**
 * POST request với auth
 */
export async function authPost(url: string, data: any): Promise<Response> {
  return authFetch(url, {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

/**
 * PUT request với auth
 */
export async function authPut(url: string, data: any): Promise<Response> {
  return authFetch(url, {
    method: 'PUT',
    body: JSON.stringify(data),
  });
}

/**
 * DELETE request với auth
 */
export async function authDelete(url: string): Promise<Response> {
  return authFetch(url, { method: 'DELETE' });
}

/**
 * PATCH request với auth
 */
export async function authPatch(url: string, data: any): Promise<Response> {
  return authFetch(url, {
    method: 'PATCH',
    body: JSON.stringify(data),
  });
}

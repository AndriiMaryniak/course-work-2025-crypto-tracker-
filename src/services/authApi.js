// src/services/authApi.js

const HOST =
  typeof window !== 'undefined' ? window.location.hostname : 'localhost';

const PROTOCOL =
  typeof window !== 'undefined' ? window.location.protocol : 'http:';

const API_BASE =
  import.meta.env.VITE_API_BASE || `${PROTOCOL}//${HOST}:4000`;

async function apiRequest(path, options = {}) {
  const url = `${API_BASE}${path}`;

  const resp = await fetch(url, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(options.headers || {}),
    },
  });

  if (!resp.ok) {
    let message = `HTTP ${resp.status}`;
    try {
      const data = await resp.json();
      if (data?.message) message = data.message;
    } catch {}
    throw new Error(message);
  }

  if (resp.status === 204) return null;
  return resp.json();
}

export async function registerUser(email, password) {
  return apiRequest('/api/auth/register', {
    method: 'POST',
    body: JSON.stringify({ email, password }),
  });
}

export async function loginUser(email, password) {
  return apiRequest('/api/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email, password }),
  });
}

export async function fetchCurrentUser(token) {
  return apiRequest('/api/user/me', {
    method: 'GET',
    headers: { Authorization: `Bearer ${token}` },
  });
}

export async function updateUserSettings(token, settings) {
  return apiRequest('/api/user/settings', {
    method: 'PUT',
    headers: { Authorization: `Bearer ${token}` },
    body: JSON.stringify(settings),
  });
}

export async function syncFavorites(token, favorites) {
  return apiRequest('/api/user/favorites', {
    method: 'PUT',
    headers: { Authorization: `Bearer ${token}` },
    body: JSON.stringify({ favorites }),
  });
}

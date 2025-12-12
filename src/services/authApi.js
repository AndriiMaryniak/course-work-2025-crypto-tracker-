// src/services/authApi.js

// Базова адреса бекенда
const API_BASE =
  import.meta.env.VITE_API_BASE || 'http://localhost:4000';

// Універсальна функція запиту
async function apiRequest(path, options = {}) {
  const url = `${API_BASE}${path}`;

  const resp = await fetch(url, {
    // Спочатку підставляємо всі options (method, body, headers тощо)
    ...options,
    // Потім формуємо headers так, щоб НЕ перетирати Content-Type
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
    } catch {
      // тіло не JSON – ігноруємо
    }
    throw new Error(message);
  }

  if (resp.status === 204) return null;

  return resp.json();
}

// ---------- AUTH ----------

// Реєстрація користувача
export async function registerUser(email, password) {
  return apiRequest('/api/auth/register', {
    method: 'POST',
    body: JSON.stringify({ email, password }),
  });
}

// Логін користувача
export async function loginUser(email, password) {
  return apiRequest('/api/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email, password }),
  });
}

// Отримання поточного користувача за токеном
export async function fetchCurrentUser(token) {
  return apiRequest('/api/user/me', {
    method: 'GET',
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
}

// ---------- SETTINGS & FAVORITES ----------

// Оновити налаштування користувача (мова/тема/валюта)
export async function updateUserSettings(token, settings) {
  return apiRequest('/api/user/settings', {
    method: 'PUT',
    headers: {
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(settings),
  });
}

// Синхронізувати обрані монети (передаємо ВЕСЬ масив favorites)
export async function syncFavorites(token, favorites) {
  return apiRequest('/api/user/favorites', {
    method: 'PUT',
    headers: {
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ favorites }),
  });
}

// src/lib/api.ts
const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:5000';

export const api = {
  get: (url: string, token?: string) => 
    fetch(`${API_BASE}${url}`, {
      headers: token ? { Authorization: `Bearer ${token}` } : {}
    }).then(res => res.json()),
  
  post: (url: string, data: any, token?: string) =>
    fetch(`${API_BASE}${url}`, {
      method: 'POST',
      headers: {
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(data)
    }).then(res => res.json()),
  
  patch: (url: string, data: any, token?: string) =>
    fetch(`${API_BASE}${url}`, {
      method: 'PATCH',
      headers: {
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(data)
    }).then(res => res.json()),
  
  delete: (url: string, token?: string) =>
    fetch(`${API_BASE}${url}`, {
      method: 'DELETE',
      headers: token ? { Authorization: `Bearer ${token}` } : {}
    }).then(res => res.json())
};
const API_ROOT = import.meta.env.VITE_API_URL || 'http://localhost:5000/api'

function authHeaders() {
  const token = localStorage.getItem('token')
  return token ? { Authorization: `Bearer ${token}` } : {}
}

export async function post(path, body) {
  return fetch(API_ROOT + path, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...authHeaders() },
    body: JSON.stringify(body)
  }).then(r => r.json())
}

export async function get(path) {
  return fetch(API_ROOT + path, { headers: authHeaders() }).then(r => r.json())
}

export async function put(path, body) {
  return fetch(API_ROOT + path, {
    method: 'PUT', headers: { 'Content-Type': 'application/json', ...authHeaders() }, body: JSON.stringify(body)
  }).then(r => r.json())
}

export async function del(path) {
  return fetch(API_ROOT + path, { method: 'DELETE', headers: authHeaders() }).then(r => r.json())
}

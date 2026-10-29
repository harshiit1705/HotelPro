const API_BASE = '/api';

async function request(endpoint, options = {}) {
  const token = localStorage.getItem('hotelpro_token');
  
  const headers = {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...options.headers
  };

  const response = await fetch(`${API_BASE}${endpoint}`, {
    ...options,
    headers
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    const error = new Error(data.message || `HTTP error ${response.status}`);
    error.status = response.status;
    error.data = data;
    throw error;
  }

  return data;
}

export const api = {
  // Auth
  auth: {
    login: (credentials) => request('/auth/login', { method: 'POST', body: JSON.stringify(credentials) }),
    register: (userData) => request('/auth/register', { method: 'POST', body: JSON.stringify(userData) }),
    getMe: () => request('/auth/me')
  },

  // Rooms
  rooms: {
    getAll: (params = {}) => {
      const searchParams = new URLSearchParams();
      Object.entries(params).forEach(([key, val]) => {
        if (val !== undefined && val !== null && val !== '') {
          searchParams.append(key, val);
        }
      });
      const queryStr = searchParams.toString();
      return request(`/rooms${queryStr ? `?${queryStr}` : ''}`);
    },
    getById: (id) => request(`/rooms/${id}`),
    create: (roomData) => request('/rooms', { method: 'POST', body: JSON.stringify(roomData) }),
    update: (id, roomData) => request(`/rooms/${id}`, { method: 'PUT', body: JSON.stringify(roomData) }),
    toggleActive: (id) => request(`/rooms/${id}/toggle-active`, { method: 'PATCH' }),
    delete: (id) => request(`/rooms/${id}`, { method: 'DELETE' })
  },

  // Reservations
  reservations: {
    create: (reservationData) => request('/reservations', { method: 'POST', body: JSON.stringify(reservationData) }),
    getMy: () => request('/reservations/my'),
    getById: (id) => request(`/reservations/${id}`),
    cancel: (id, reason) => request(`/reservations/${id}/cancel`, { method: 'PUT', body: JSON.stringify({ reason }) }),
    pay: (id, paymentData = {}) => request(`/reservations/${id}/pay`, { method: 'POST', body: JSON.stringify(paymentData) })
  },

  // Admin
  admin: {
    getMetrics: () => request('/admin/metrics'),
    getReservations: (params = {}) => {
      const searchParams = new URLSearchParams();
      Object.entries(params).forEach(([key, val]) => {
        if (val !== undefined && val !== null && val !== '') {
          searchParams.append(key, val);
        }
      });
      const queryStr = searchParams.toString();
      return request(`/admin/reservations${queryStr ? `?${queryStr}` : ''}`);
    },
    updateReservationStatus: (id, status, notes = '') =>
      request(`/admin/reservations/${id}/status`, { method: 'PATCH', body: JSON.stringify({ status, notes }) }),
    getGuests: () => request('/admin/guests')
  }
};


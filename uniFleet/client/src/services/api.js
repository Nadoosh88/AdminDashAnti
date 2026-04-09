import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001/api',
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('unifleet_token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Dashboard
export const getDashboardStats  = () => api.get('/dashboard/stats');

// Buses
export const getBuses           = () => api.get('/buses');
export const createBus          = (data) => api.post('/buses', data);
export const updateBus          = (id, data) => api.put(`/buses/${id}`, data);
export const deleteBus          = (id) => api.delete(`/buses/${id}`);
export const getBusLocations    = () => api.get('/buses/locations');

// Routes
export const getRoutes          = () => api.get('/routes');
export const createRoute        = (data) => api.post('/routes', data);
export const updateRoute        = (id, data) => api.put(`/routes/${id}`, data);
export const deleteRoute        = (id) => api.delete(`/routes/${id}`);

// Drivers
export const getDrivers         = () => api.get('/drivers');
export const createDriver       = (data) => api.post('/drivers', data);
export const updateDriver       = (id, data) => api.put(`/drivers/${id}`, data);
export const deleteDriver       = (id) => api.delete(`/drivers/${id}`);

// Students / Blacklist
export const getStudents        = () => api.get('/students');
export const getLeaderboard     = () => api.get('/students/leaderboard');
export const blacklistStudent   = (id, data) => api.post(`/students/${id}/blacklist`, data);
export const liftBlacklist      = (id) => api.delete(`/students/${id}/blacklist`);

// Trips
export const getTrips           = () => api.get('/trips');
export const createTrip         = (data) => api.post('/trips', data);
export const updateTrip         = (id, data) => api.put(`/trips/${id}`, data);
export const deleteTrip         = (id) => api.delete(`/trips/${id}`);

// Parcels
export const getParcels         = () => api.get('/parcels');
export const createParcel      = (data) => api.post('/parcels', data);
export const updateParcelStatus = (id, status) => api.patch(`/parcels/${id}/status`, { status });
export const deleteParcel      = (id) => api.delete(`/parcels/${id}`);

// Ratings
export const getRatingsAnalytics = () => api.get('/ratings/analytics');
export const getRatingComments   = () => api.get('/ratings/comments');

// Alerts
export const getAlerts          = () => api.get('/alerts');
export const resolveAlert       = (id) => api.patch(`/alerts/${id}/resolve`);

// Rewards
export const getRewardRules     = () => api.get('/rewards/rules');
export const updateRewardRules  = (rules) => api.put('/rewards/rules', { rules });

// Auth
export const login              = (email, password) => api.post('/auth/login', { email, password });

export default api;

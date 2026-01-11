import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

const api = axios.create({
    baseURL: API_URL,
    withCredentials: true,
});

// Auth
export const getStravaAuthUrl = () => `${API_URL}/auth/strava`;

// User
export const getUser = (userId) => api.get(`/api/user/${userId}`);

// Activities
export const getActivities = (userId, params = {}) =>
    api.get(`/api/activities/${userId}`, { params });

export const getActivityStats = (userId) =>
    api.get(`/api/activities/${userId}/stats`);

export const syncActivities = (userId) =>
    api.post(`/api/activities/sync/${userId}`);

// Personal Best
export const getPersonalBest = (userId) =>
    api.get(`/api/personal-best/${userId}`);

export default api;

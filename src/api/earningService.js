import api from './axiosClient';

export const fetchEarnings = () => api.get('/earnings').then(r => r.data);
export const fetchMyEarnings = () => api.get('/earnings/me').then(r => r.data);
export const updateEarningStatus = (id, status) => api.put(`/earnings/${id}`, { status }).then(r => r.data);

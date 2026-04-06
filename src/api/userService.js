import api from './axiosClient';

export const fetchUsers = (role) => api.get('/users', { params: { role } }).then(r => r.data);

export const fetchUser = (id) => api.get(`/users/${id}`).then(r => r.data);

export const createUser = (payload) => api.post('/auth/register', payload).then(r => r.data);

export const updateUser = (id, payload) => api.put(`/users/${id}`, payload).then(r => r.data);

export const deleteUser = (id) => api.delete(`/users/${id}`).then(r => r.data);



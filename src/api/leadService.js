import api from "./axiosClient";

// Fetch all leads
export const fetchLeads = (params) =>
  api.get("/leads", { params }).then((r) => r.data);

// Fetch single lead by ID
export const fetchLead = (id) => api.get(`/leads/${id}`).then((r) => r.data);

// Create new lead
export const createLead = (payload) =>
  api.post("/leads", payload).then((r) => r.data);

// Update lead details
export const updateLead = (id, payload) =>
  api.put(`/leads/edit/${id}`, payload).then((r) => r.data);

// Assign Manager to lead
export const assignManager = (id, managerId) =>
  api.put(`/leads/${id}/assign-manager`, { managerId }).then((r) => r.data);

// Assign Executive to lead
export const assignExecutive = (id, executiveId) =>
  api.put(`/leads/${id}/assign-executive`, { executiveId }).then((r) => r.data);

// ✅ Add new Follow-up to a lead
export const addFollowUp = (id, followUp) =>
  api.post(`/leads/${id}/follow-ups`, followUp).then((r) => r.data);

// ✅ CORRECT frontend API
export const addRemark = async (id, remarkData) => {
  // remarkData should have structure: { remarkAt: Date, text: string }
  const res = await api.post(`/leads/${id}/remarks`, remarkData);
  return res.data;
};

// ✅ Mark lead as closed
export const closeLead = (id) =>
  api.put(`/leads/${id}/close`).then((r) => r.data);

export const deleteLead = (id) =>
  api.delete(`/leads/${id}`).then((r) => r.data);

export const updateLeadStatus = (id, payload) =>
  api.put(`/leads/${id}/status`, payload).then((r) => r.data);

export const fetchLeadTimeline = (id) =>
  api.get(`/leads/${id}/timeline`).then((r) => r.data);

export const fetchLeadStats = () =>
  api.get("/leads/stats/dashboard").then((r) => r.data);

export const bulkImportLeads = (leads) => {
  return api.post("/leads/bulk-import", { leads });
};

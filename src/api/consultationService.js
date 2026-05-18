import api from "./axiosClient";

export const fetchConsultations = (params) =>
  api.get("/consultations", { params }).then((r) => r.data);

export const updateConsultationStatus = (id, payload) =>
  api.patch(`/consultations/${id}`, payload).then((r) => r.data);

import api from "./api";

// ============================================
// LOGIN
// ============================================

export const loginUser = async (payload) => {
  const response = await api.post("/Auth/login", payload);

  return response.data;
};

// ============================================
// REGISTER
// ============================================

export const registerUser = async (payload) => {
  const response = await api.post("/Auth/register", payload);

  return response.data;
};

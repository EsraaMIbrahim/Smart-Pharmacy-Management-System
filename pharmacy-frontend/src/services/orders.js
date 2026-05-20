import api from "./api";

// ============================================
// FETCH USER ORDER HISTORY
// ============================================

export const fetchOnlineOrders = async (userId) => {
  const response = await api.get(`/OnlineOrders/MyHistory/${userId}`);

  return response.data;
};

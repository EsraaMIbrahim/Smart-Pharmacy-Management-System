/*
import axios from 'axios';

// ضع هنا رابط الباك إند (.NET Core) الخاص بك
const API_BASE_URL = 'https://localhost:7000/api/payment'; 

export const initiatePaymentApi = async (orderData) => {
  try {
    // إرسال طلب للباك إند لتهيئة عملية الدفع
    const response = await axios.post(`${API_BASE_URL}/initiate`, orderData);
    return response.data; // من المفترض أن يحتوي على رابط الدفع (paymentUrl)
  } catch (error) {
    console.error("Error in initiatePaymentApi:", error);
    throw error;
  }
};

*/
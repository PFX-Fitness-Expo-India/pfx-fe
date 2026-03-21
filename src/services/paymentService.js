const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

export const paymentService = {
  createOrder: async (orderData, token) => {
    const response = await fetch(`${API_BASE_URL}/api/payments/create-order`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(orderData),
    });
    const data = await response.json();
    if (!response.ok || (data.statusCode && data.statusCode >= 400)) {
      const error = new Error(data.message || 'Payment order creation failed');
      error.statusCode = data.statusCode || response.status;
      throw error;
    }
    return data;
  },

  verifyPayment: async (verificationData, token) => {
    const response = await fetch(`${API_BASE_URL}/api/payments/verify-payment`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(verificationData),
    });
    const data = await response.json();
    if (!response.ok || (data.statusCode && data.statusCode >= 400)) {
      const error = new Error(data.message || 'Payment verification failed');
      error.statusCode = data.statusCode || response.status;
      throw error;
    }
    return data;
  },

  createPaymentRecord: async (paymentData, token) => {
    const response = await fetch(`${API_BASE_URL}/api/payments`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(paymentData),
    });
    const data = await response.json();
    if (!response.ok || (data.statusCode && data.statusCode >= 400)) {
      const error = new Error(data.message || 'Payment record creation failed');
      error.statusCode = data.statusCode || response.status;
      throw error;
    }
    return data;
  },
};

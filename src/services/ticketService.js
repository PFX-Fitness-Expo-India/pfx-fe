const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

export const ticketService = {
  getMyTickets: async (token) => {
    const response = await fetch(`${API_BASE_URL}/api/tickets/my-tickets`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
    });
    const data = await response.json();
    if (!response.ok || (data.statusCode && data.statusCode >= 400)) {
      const error = new Error(data.message || 'Failed to fetch tickets');
      error.statusCode = data.statusCode || response.status;
      throw error;
    }
    return data;
  },
};

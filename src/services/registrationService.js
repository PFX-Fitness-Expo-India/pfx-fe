const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

export const registrationService = {
  registerAthlete: async (athleteData, token) => {
    const response = await fetch(`${API_BASE_URL}/api/athletes`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(athleteData),
    });
    const data = await response.json();
    if (!response.ok || (data.statusCode && data.statusCode >= 400)) {
      const error = new Error(data.message || 'Athlete registration failed');
      error.statusCode = data.statusCode || response.status;
      throw error;
    }
    return data;
  },

  registerVisitor: async (visitorData, token) => {
    const response = await fetch(`${API_BASE_URL}/api/visitors`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(visitorData),
    });
    const data = await response.json();
    if (!response.ok || (data.statusCode && data.statusCode >= 400)) {
      const error = new Error(data.message || 'Visitor registration failed');
      error.statusCode = data.statusCode || response.status;
      throw error;
    }
    return data;
  },
};


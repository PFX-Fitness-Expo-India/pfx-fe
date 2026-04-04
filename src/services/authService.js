const API_BASE_URL = `${import.meta.env.VITE_API_BASE_URL}/api/auth`;

export const authService = {
  login: async (credentials, password) => {
    const response = await fetch(`${API_BASE_URL}/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ credentials, password }),
    });
    const data = await response.json();
    if (!response.ok || (data.statusCode && data.statusCode >= 400)) {
      const error = new Error(data.message || 'Login failed');
      error.statusCode = data.statusCode || response.status;
      throw error;
    }
    return data;
  },

  signup: async (userData) => {
    const response = await fetch(`${API_BASE_URL}/signup`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(userData),
    });
    const data = await response.json();
    if (!response.ok || (data.statusCode && data.statusCode >= 400)) {
      const error = new Error(data.message || 'Signup failed');
      error.statusCode = data.statusCode || response.status;
      throw error;
    }
    return data;
  },

  fetchProfile: async (token) => {
    const response = await fetch(`${API_BASE_URL}/profile`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
    });
    const data = await response.json();
    if (!response.ok || (data.statusCode && data.statusCode >= 400)) {
      const error = new Error(data.message || 'Failed to fetch profile');
      error.statusCode = data.statusCode || response.status;
      throw error;
    }
    return data;
  },

  refreshToken: async (refreshToken) => {
    const response = await fetch(`${API_BASE_URL}/refresh-token`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ refreshToken }),
    });
    const data = await response.json();
    if (!response.ok || (data.statusCode && data.statusCode >= 400)) {
      const error = new Error(data.message || 'Token refresh failed');
      error.statusCode = data.statusCode || response.status;
      throw error;
    }
    return data;
  },

  logout: async (token) => {
    const response = await fetch(`${API_BASE_URL}/logout`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
    });
    const data = await response.json();
    if (!response.ok || (data.statusCode && data.statusCode >= 400)) {
      const error = new Error(data.message || 'Logout failed');
      error.statusCode = data.statusCode || response.status;
      throw error;
    }
    return data;
  },

  changePassword: async (passwordData, token) => {
    const response = await fetch(`${API_BASE_URL}/change-password`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(passwordData),
    });
    const data = await response.json();
    if (!response.ok || (data.statusCode && data.statusCode >= 400)) {
      const error = new Error(data.message || 'Change password failed');
      error.statusCode = data.statusCode || response.status;
      throw error;
    }
    return data;
  },

  getUser: async (userId, token) => {
    const response = await fetch(`${API_BASE_URL}/getUser/${userId}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
    });
    const data = await response.json();
    if (!response.ok || (data.statusCode && data.statusCode >= 400)) {
      const error = new Error(data.message || 'Failed to fetch user information');
      error.statusCode = data.statusCode || response.status;
      throw error;
    }
    return data;
  },

  verifyEmail: async (token) => {
    const response = await fetch(`${API_BASE_URL}/verify-email/${token}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });
    const data = await response.json();
    if (!response.ok || (data.statusCode && data.statusCode >= 400)) {
      const error = new Error(data.message || "Email verification failed");
      error.statusCode = data.statusCode || response.status;
      throw error;
    }
    return data;
  },

  forgotPassword: async (email) => {
    const response = await fetch(`${API_BASE_URL}/forgot-password`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ email }),
    });
    const data = await response.json();
    if (!response.ok || (data.statusCode && data.statusCode >= 400)) {
      const error = new Error(data.message || "Forgot password request failed");
      error.statusCode = data.statusCode || response.status;
      throw error;
    }
    return data;
  },

  resetPassword: async (token, password) => {
    const response = await fetch(`${API_BASE_URL}/reset-password/${token}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ password }),
    });
    const data = await response.json();
    if (!response.ok || (data.statusCode && data.statusCode >= 400)) {
      const error = new Error(data.message || "Reset password failed");
      error.statusCode = data.statusCode || response.status;
      throw error;
    }
    return data;
  },
};

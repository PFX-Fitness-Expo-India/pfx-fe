import api from './api';

/**
 * Fetches the event schedule from the API.
 * @returns {Promise<Object>} The schedule data.
 */
export const getSchedule = async () => {
  try {
    const response = await api.get('/api/events/schedule');
    return response.data;
  } catch (error) {
    console.error('Error fetching schedule:', error);
    throw error;
  }
};

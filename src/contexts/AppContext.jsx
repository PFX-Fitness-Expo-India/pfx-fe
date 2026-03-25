import { useState, useCallback, createContext, useContext, useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { STORAGE_KEYS } from '../constants/config';
import { loadFromStorage, saveToStorage, downloadCsv } from '../services/storageService';
import { authService } from '../services/authService';
import { useModal } from './ModalContext';

// ─── Context ──────────────────────────────────────────────────────────────────

const AppContext = createContext(null);

// ─── Provider ─────────────────────────────────────────────────────────────────

export function AppProvider({ children }) {
  const { showToast } = useModal();
  const queryClient = useQueryClient();
  
  // ── Authentication & View logic ──
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(() => localStorage.getItem('token') || null);
  const [refreshToken, setRefreshToken] = useState(() => localStorage.getItem('refreshToken') || null);

  // Fetch profile on initial mount if token exists
  useEffect(() => {
    async function initializeUser() {
      if (token) {
        try {
          // Try fetching profile, if it fails with 401, handleApiError will be called by components 
          // but here we just try once.
          const res = await authService.fetchProfile(token);
          if (res.user) {
            setUser(res.user);
          }
        } catch (error) {
          console.error('Failed to restore session:', error);
          if (error.statusCode === 401 && refreshToken) {
            try {
              const refreshRes = await authService.refreshToken(refreshToken);
              const newToken = refreshRes.data.token;
              const newRefreshToken = refreshRes.data.refreshToken;
              
              setToken(newToken);
              setRefreshToken(newRefreshToken);
              localStorage.setItem('token', newToken);
              localStorage.setItem('refreshToken', newRefreshToken);
              
              const retryRes = await authService.fetchProfile(newToken);
              if (retryRes.user) setUser(retryRes.user);
            } catch (err) {
              logout();
            }
          } else {
            logout();
          }
        }
      }
    }
    initializeUser();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const loginUser = useCallback(async (credentials, password) => {
    try {
      const res = await authService.login(credentials, password);
      // Expected backend response: data: { token, refreshToken, userId, role, userName }
      const newAuthData = res.data;
      
      setUser({
        userId: newAuthData.userId,
        userName: newAuthData.userName,
        role: newAuthData.role
      });
      setToken(newAuthData.token);
      setRefreshToken(newAuthData.refreshToken);
      
      localStorage.setItem('token', newAuthData.token);
      localStorage.setItem('refreshToken', newAuthData.refreshToken);
      localStorage.setItem('userId', newAuthData.userId);

      showToast({
        icon: 'success',
        title: 'Success!',
        text: 'Welcome back!',
        timer: 3000
      });
    } catch (err) {
      throw err;
    }
  }, []);

  const signupUser = useCallback(async (userData) => {
    try {
      await authService.signup(userData);
      showToast({
        icon: 'success',
        title: 'Success!',
        text: 'Registered successfully!',
        timer: 3000
      });
    } catch (err) {
      throw err;
    }
  }, []);

  const logout = useCallback(async () => {
    try {
      if (token) {
        await authService.logout(token);
      }
    } catch (err) {
      console.error('Logout API failed:', err);
    } finally {
      setUser(null);
      setToken(null);
      setRefreshToken(null);
      localStorage.removeItem('token');
      localStorage.removeItem('refreshToken');
      localStorage.removeItem('userId');
      setGuestViewMode(null);
      setAthletes([]);
      setTickets([]);
      localStorage.removeItem('pfx_athletes');
      localStorage.removeItem('pfx_tickets');
      
      // Clear all queries to ensure fresh data for the guest/new user
      queryClient.clear();
      // Or specifically: queryClient.invalidateQueries({ queryKey: ['events'] });

      showToast({
        icon: 'success',
        title: 'Logged Out',
        text: 'You have been successfully logged out.',
        timer: 3000
      });
    }
  }, [token, showToast]);

  const handleApiError = useCallback(async (error, retryCallback) => {
    if (error.statusCode === 401 && refreshToken) {
      try {
        const refreshRes = await authService.refreshToken(refreshToken);
        const newToken = refreshRes.data.token;
        const newRefreshToken = refreshRes.data.refreshToken;
        
        setToken(newToken);
        setRefreshToken(newRefreshToken);
        localStorage.setItem('token', newToken);
        localStorage.setItem('refreshToken', newRefreshToken);
        
        return await retryCallback(newToken);
      } catch (err) {
        logout();
        throw err;
      }
    }
    throw error;
  }, [refreshToken, logout]);

  // ── Persistent data ──
  const [athletes, setAthletes] = useState(() => loadFromStorage(STORAGE_KEYS.athletes));
  const [tickets, setTickets] = useState(() => loadFromStorage(STORAGE_KEYS.tickets));

  // ── Modal state ──
  const [activeSport, setActiveSport] = useState(null);
  const [activeRegistrationEvent, setActiveRegistrationEvent] = useState(null);
  const [activeTicketType, setActiveTicketType] = useState(null);
  const [confirmationMessage, setConfirmationMessage] = useState(null);
  const [registrationSuccessData, setRegistrationSuccessData] = useState(null);
  const [guestViewMode, setGuestViewMode] = useState(null); // 'athlete', 'visitor', or null (both)

  // ── Athletes ──
  const addAthlete = useCallback((data) => {
    const updated = [...loadFromStorage(STORAGE_KEYS.athletes), data];
    saveToStorage(STORAGE_KEYS.athletes, updated);
    setAthletes(updated);
  }, []);

  const exportAthletesCsv = useCallback(() => {
    const data = loadFromStorage(STORAGE_KEYS.athletes);
    const header = ['Name', 'Phone', 'Email', 'Age', 'City', 'Sport', 'Weight Category', 'Requires Payment', 'Created At'];
    const rows = data.map((a) => [a.name, a.phone, a.email, a.age, a.city, a.sportName, a.weight, a.requiresPayment ? 'Yes' : 'No', a.createdAt]);
    downloadCsv('pfx-athletes.csv', [header, ...rows]);
  }, []);

  // ── Tickets ──
  const addTicket = useCallback((data) => {
    const updated = [...loadFromStorage(STORAGE_KEYS.tickets), data];
    saveToStorage(STORAGE_KEYS.tickets, updated);
    setTickets(updated);
  }, []);

  const exportTicketsCsv = useCallback(() => {
    const data = loadFromStorage(STORAGE_KEYS.tickets);
    const header = ['Name', 'Phone', 'Email', 'Type', 'Quantity', 'Created At'];
    const rows = data.map((t) => [t.name, t.phone, t.email, t.type, t.quantity, t.createdAt]);
    downloadCsv('pfx-tickets.csv', [header, ...rows]);
  }, []);

  // ── Modal helpers ──
  const openSportModal = useCallback((sport) => setActiveSport(sport), []);
  const closeSportModal = useCallback(() => setActiveSport(null), []);

  const openAthleteRegistrationModal = useCallback((event) => setActiveRegistrationEvent(event), []);
  const closeAthleteRegistrationModal = useCallback(() => setActiveRegistrationEvent(null), []);

  const openTicketModal = useCallback((type) => setActiveTicketType(type), []);
  const closeTicketModal = useCallback(() => setActiveTicketType(null), []);

  const showConfirmation = useCallback((message) => setConfirmationMessage(message), []);
  const closeConfirmation = useCallback(() => setConfirmationMessage(null), []);

  const showRegistrationSuccess = useCallback((data) => setRegistrationSuccessData(data), []);
  const clearRegistrationSuccess = useCallback(() => setRegistrationSuccessData(null), []);

  const closeAllModals = useCallback(() => {
    setActiveSport(null);
    setActiveRegistrationEvent(null);
    setActiveTicketType(null);
    setConfirmationMessage(null);
  }, []);

  const value = {
    // auth data
    user,
    token,
    refreshToken,
    loginUser,
    signupUser,
    logout,
    handleApiError,
    // data
    athletes,
    tickets,
    addAthlete,
    addTicket,
    exportAthletesCsv,
    exportTicketsCsv,
    // modal state
    activeSport,
    activeRegistrationEvent,
    activeTicketType,
    confirmationMessage,
    // modal actions
    openSportModal,
    closeSportModal,
    openAthleteRegistrationModal,
    closeAthleteRegistrationModal,
    openTicketModal,
    closeTicketModal,
    showConfirmation,
    closeConfirmation,
    showRegistrationSuccess,
    clearRegistrationSuccess,
    closeAllModals,
    guestViewMode,
    setGuestViewMode,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

// ─── Hook ─────────────────────────────────────────────────────────────────────

export function useAppContext() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useAppContext must be used inside <AppProvider>');
  return ctx;
}

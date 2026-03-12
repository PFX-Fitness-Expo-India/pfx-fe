import { useState, useCallback, createContext, useContext } from 'react';
import { STORAGE_KEYS } from '../constants/config';
import { loadFromStorage, saveToStorage, downloadCsv } from '../services/storageService';

// ─── Context ──────────────────────────────────────────────────────────────────

const AppContext = createContext(null);

// ─── Provider ─────────────────────────────────────────────────────────────────

export function AppProvider({ children }) {
  // ── Persistent data ──
  const [athletes, setAthletes] = useState(() => loadFromStorage(STORAGE_KEYS.athletes));
  const [tickets, setTickets] = useState(() => loadFromStorage(STORAGE_KEYS.tickets));

  // ── Modal state ──
  const [activeSport, setActiveSport] = useState(null);
  const [activeTicketType, setActiveTicketType] = useState(null);
  const [confirmationMessage, setConfirmationMessage] = useState(null);

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

  const openTicketModal = useCallback((type) => setActiveTicketType(type), []);
  const closeTicketModal = useCallback(() => setActiveTicketType(null), []);

  const showConfirmation = useCallback((message) => setConfirmationMessage(message), []);
  const closeConfirmation = useCallback(() => setConfirmationMessage(null), []);

  const closeAllModals = useCallback(() => {
    setActiveSport(null);
    setActiveTicketType(null);
    setConfirmationMessage(null);
  }, []);

  const value = {
    // data
    athletes,
    tickets,
    addAthlete,
    addTicket,
    exportAthletesCsv,
    exportTicketsCsv,
    // modal state
    activeSport,
    activeTicketType,
    confirmationMessage,
    // modal actions
    openSportModal,
    closeSportModal,
    openTicketModal,
    closeTicketModal,
    showConfirmation,
    closeConfirmation,
    closeAllModals,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

// ─── Hook ─────────────────────────────────────────────────────────────────────

export function useAppContext() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useAppContext must be used inside <AppProvider>');
  return ctx;
}

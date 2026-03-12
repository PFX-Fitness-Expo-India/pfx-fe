import { useCallback } from 'react';
import { STORAGE_KEYS } from '../constants/config';
import { loadFromStorage, saveToStorage, downloadCsv } from '../services/storageService';
import { useState } from 'react';

/**
 * useStorage — React hook layer over the pure storageService utilities.
 * Kept for backward-compatibility; new code should prefer useAppContext().
 */
export function useStorage() {
  const [athletes, setAthletes] = useState(() => loadFromStorage(STORAGE_KEYS.athletes));
  const [tickets, setTickets] = useState(() => loadFromStorage(STORAGE_KEYS.tickets));

  const addAthlete = useCallback((data) => {
    const updated = [...loadFromStorage(STORAGE_KEYS.athletes), data];
    saveToStorage(STORAGE_KEYS.athletes, updated);
    setAthletes(updated);
  }, []);

  const addTicket = useCallback((data) => {
    const updated = [...loadFromStorage(STORAGE_KEYS.tickets), data];
    saveToStorage(STORAGE_KEYS.tickets, updated);
    setTickets(updated);
  }, []);

  const exportAthletesCsv = useCallback(() => {
    const data = loadFromStorage(STORAGE_KEYS.athletes);
    const header = ['Name', 'Phone', 'Email', 'Age', 'City', 'Sport', 'Weight Category', 'Requires Payment', 'Created At'];
    const rows = data.map((a) => [a.name, a.phone, a.email, a.age, a.city, a.sportName, a.weight, a.requiresPayment ? 'Yes' : 'No', a.createdAt]);
    downloadCsv('pfx-athletes.csv', [header, ...rows]);
  }, []);

  const exportTicketsCsv = useCallback(() => {
    const data = loadFromStorage(STORAGE_KEYS.tickets);
    const header = ['Name', 'Phone', 'Email', 'Type', 'Quantity', 'Created At'];
    const rows = data.map((t) => [t.name, t.phone, t.email, t.type, t.quantity, t.createdAt]);
    downloadCsv('pfx-tickets.csv', [header, ...rows]);
  }, []);

  return { athletes, tickets, addAthlete, addTicket, exportAthletesCsv, exportTicketsCsv };
}

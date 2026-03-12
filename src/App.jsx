import { useEffect } from 'react';
import { AppProvider, useAppContext } from './contexts/AppContext';
import { useScrollAnimation } from './hooks/useScrollAnimation';
import PageLayout from './layouts/PageLayout';

import Hero from './features/hero';
import Highlights from './features/highlights';
import SportsGrid from './features/sports';
import Schedule from './features/schedule';
import Sponsors from './features/sponsors';
import Tickets from './features/tickets';
import Registration from './features/registration';
import Dashboard from './features/dashboard';
import { SportModal, TicketModal, ConfirmationModal } from './features/modals';

// ─── Inner app — has access to AppContext ─────────────────────────────────────

function AppInner() {
  const { closeAllModals } = useAppContext();
  useScrollAnimation();

  // Close any open modal when Escape is pressed
  useEffect(() => {
    const onKey = (e) => { if (e.key === 'Escape') closeAllModals(); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [closeAllModals]);

  return (
    <PageLayout>
      <Hero />
      <Highlights />
      <SportsGrid />
      <Schedule />
      <Sponsors />
      <Tickets />
      <Registration />
      <Dashboard />

      {/* Modals — self-contained, read their state from context */}
      <SportModal />
      <TicketModal />
      <ConfirmationModal />
    </PageLayout>
  );
}

// ─── Root — provides context to the entire tree ───────────────────────────────

export default function App() {
  return (
    <AppProvider>
      <AppInner />
    </AppProvider>
  );
}

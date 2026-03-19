import { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
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
import Login from './features/auth/Login';
import Signup from './features/auth/Signup';
import { SportModal, TicketModal, ConfirmationModal } from './features/modals';

// ─── ScrollToTop Helper ────────────────────────────────────────────────────────

function ScrollToTop() {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  return null;
}

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
      <ScrollToTop />
      <Routes>
          <Route path="/" element={
            <>
              <Hero />
              <Highlights />
              <SportsGrid />
              <Schedule />
              <Sponsors />
              <Tickets />
              <Registration />
              <Dashboard />
            </>
          } />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
        </Routes>

      <SportModal />
      <TicketModal />
      <ConfirmationModal />
    </PageLayout>
  );
}

// ─── Root — provides context to the entire tree ───────────────────────────────

export default function App() {
  return (
    <Router>
      <AppProvider>
        <AppInner />
      </AppProvider>
    </Router>
  );
}

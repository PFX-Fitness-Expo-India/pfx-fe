import { useEffect } from "react";
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AppProvider, useAppContext } from './contexts/AppContext';
import { ModalProvider } from './contexts/ModalContext';
import AccountSkeleton from './features/account/AccountSkeleton';
import { useScrollAnimation } from "./hooks/useScrollAnimation";
import PageLayout from "./layouts/PageLayout";

import Hero from "./features/hero";
import Highlights from "./features/highlights";
import SportsGrid from "./features/sports";
import Schedule from "./features/schedule";
import Sponsors from "./features/sponsors";
import Tickets from "./features/tickets";
import Registration from "./features/registration";
import Dashboard from "./features/dashboard";
import Login from "./features/auth/Login";
import Signup from "./features/auth/Signup";
import Account from "./features/account/Account";
import TicketDetail from "./features/tickets/TicketDetail";
import EventDetail from "./features/sports/EventDetail";
import VerifyEmail from "./features/auth/VerifyEmail";
import PrivacyPolicy from "./features/legal/PrivacyPolicy";
import TermsAndConditions from "./features/legal/TermsAndConditions";
import RefundPolicy from "./features/legal/RefundPolicy";
import {
  SportModal,
  TicketModal,
  ConfirmationModal,
  AthleteRegistrationModal,
  RegistrationSuccessModal,
} from "./features/modals";
import ResetPassword from "./features/auth/ResetPassword";

// ─── Route Guards ─────────────────────────────────────────────────────────────

function PublicRoute({ children }) {
  const { user, isInitializing } = useAppContext();
  if (isInitializing) return null; // Wait for auth check
  return user ? <Navigate to="/" replace /> : children;
}

function PrivateRoute({ children }) {
  const { user, isInitializing } = useAppContext();
  const location = useLocation();

  if (isInitializing) {
    if (location.pathname === '/account') {
      return <AccountSkeleton />;
    }
    return null; // Wait for auth check on other private routes
  }
  return user ? children : <Navigate to="/" replace />;
}

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
    const onKey = (e) => {
      if (e.key === "Escape") closeAllModals();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [closeAllModals]);

  // Intent Preservation: Resume pending actions after login
  const { user, openAthleteRegistrationModal, openTicketModal } =
    useAppContext();

  useEffect(() => {
    const handleOpenAthlete = (e) => {
      openAthleteRegistrationModal(e.detail);
    };
    const handleOpenTicket = (e) => {
      openTicketModal(e.detail);
    };

    window.addEventListener("pfx:openAthleteRegistration", handleOpenAthlete);
    window.addEventListener("pfx:openTicketModal", handleOpenTicket);

    return () => {
      window.removeEventListener(
        "pfx:openAthleteRegistration",
        handleOpenAthlete,
      );
      window.removeEventListener("pfx:openTicketModal", handleOpenTicket);
    };
  }, [openAthleteRegistrationModal, openTicketModal]);

  useEffect(() => {
    if (user) {
      const pendingActionStr = localStorage.getItem("pendingAction");
      if (pendingActionStr) {
        try {
          const action = JSON.parse(pendingActionStr);
          // Small delay to ensure route transition is complete
          setTimeout(() => {
            if (action.type === "athlete_registration") {
              window.dispatchEvent(
                new CustomEvent("pfx:openAthleteRegistration", {
                  detail: action.event,
                }),
              );
            } else if (action.type === "ticket_purchase") {
              window.dispatchEvent(
                new CustomEvent("pfx:openTicketModal", {
                  detail: action.ticketType,
                }),
              );
            } else if (action.type === "call_to_register") {
              const phoneNumber = import.meta.env.VITE_REGISTRATION_PHONE || "+919361614200";
              window.location.href = `tel:${phoneNumber}`;
            }
            localStorage.removeItem("pendingAction");
          }, 2000);
        } catch (e) {
          console.error("Failed to resume pending action", e);
          localStorage.removeItem("pendingAction");
        }
      }
    }
  }, [user]);

  return (
    <PageLayout>
      <ScrollToTop />
      <Routes>
        <Route
          path="/"
          element={
            <>
              <Hero />
              <Highlights />
              <SportsGrid />
              <Schedule />
              <Tickets />
              {/* <Sponsors /> */}
              <Registration />
              {/* <Dashboard /> */}
            </>
          }
        />
        <Route
          path="/login"
          element={
            <PublicRoute>
              <Login />
            </PublicRoute>
          }
        />
        <Route
          path="/signup"
          element={
            <PublicRoute>
              <Signup />
            </PublicRoute>
          }
        />
        <Route
          path="/account"
          element={
            <PrivateRoute>
              <Account />
            </PrivateRoute>
          }
        />
        <Route
          path="/ticket/:ticketId"
          element={
            <PrivateRoute>
              <TicketDetail />
            </PrivateRoute>
          }
        />
        <Route path="/events/:eventId" element={<EventDetail />} />
        <Route path="/verify-email/:token" element={<VerifyEmail />} />
        <Route path="/privacy-policy" element={<PrivacyPolicy />} />
        <Route path="/terms-and-conditions" element={<TermsAndConditions />} />
        <Route path="/refund-policy" element={<RefundPolicy />} />
        <Route path="/reset-password/:token" element={<ResetPassword />} />
      </Routes>

      <SportModal />
      <TicketModal />
      <ConfirmationModal />
      <AthleteRegistrationModal />
      <RegistrationSuccessModal />
    </PageLayout>
  );
}

// ─── Root — provides context to the entire tree ───────────────────────────────

export default function App() {
  return (
    <Router>
      <ModalProvider>
        <AppProvider>
          <AppInner />
        </AppProvider>
      </ModalProvider>
    </Router>
  );
}

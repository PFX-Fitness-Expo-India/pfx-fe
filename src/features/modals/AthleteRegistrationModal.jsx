import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Modal from "../../shared/Modal";
import CustomSelect from "../../shared/CustomSelect";
import { useAppContext } from "../../contexts/AppContext";
import { registrationService } from "../../services/registrationService";
import { paymentService } from "../../services/paymentService";
import { useModal } from "../../contexts/ModalContext";
import logo from "../../assets/logo.png";
export default function AthleteRegistrationModal() {
  const {
    activeRegistrationEvent: event,
    closeAthleteRegistrationModal,
    user,
    token,
    logout,
    showRegistrationSuccess,
  } = useAppContext();

  const { showModal, showLoading, closeModal } = useModal();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState(() => {
    // Attempt to restore from pendingAction immediately on mount
    const pendingActionStr = localStorage.getItem("pendingAction");
    if (pendingActionStr) {
      try {
        const action = JSON.parse(pendingActionStr);
        if (action.type === "athlete_registration" && action.data) {
          return action.data;
        }
      } catch (e) {
        console.error("Failed to pre-initialize formData:", e);
      }
    }
    return {
      subcategory: "",
      agreedToTerms: false
    };
  });
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (!event) {
      setLoading(false);
      // Only reset to defaults if there's NO pending action
      // This prevents the "reset flash" on reload
      if (!localStorage.getItem("pendingAction")) {
        setFormData({
          subcategory: "",
          agreedToTerms: false
        });
      }
      setErrors({});
    } else {
      // Initialize subcategory to first option if not set
      if (event.haveSubcategory && event.subcategories?.length > 0) {
        setFormData(prev => ({
          ...prev,
          subcategory: prev.subcategory || event.subcategories[0]
        }));
      }
    }
  }, [event]);

  if (!event) return null;

  const handleCloseModal = () => {
    if (loading) {
      showModal({
        title: "Processing",
        text: "Payment is currently processing. Please wait.",
        type: "warning",
        confirmText: "OK",
      });
      return;
    }
    closeAthleteRegistrationModal();
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value
    }));

    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: null }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const newErrors = {};

    if (event.haveSubcategory && !formData.subcategory) {
      newErrors.subcategory = "Please select a category.";
    }

    if (!formData.agreedToTerms) {
      newErrors.agreedToTerms = "You must agree to the terms and conditions.";
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    if (!user || !token) {
      // Store pending action for redirect back
      const pendingAction = {
        type: "athlete_registration",
        event: event,
        from: window.location.pathname,
        data: formData,
      };
      localStorage.setItem("pendingAction", JSON.stringify(pendingAction));

      showModal({
        title: "Login Required",
        text: "Please login to register for this event. We will bring you right back here!",
        type: "info",
        confirmText: "Go to Login",
        onConfirm: () => {
          navigate("/login");
          closeAthleteRegistrationModal();
        },
      });
      return;
    }

    localStorage.removeItem("pendingAction");
    setLoading(true);
    try {
      if (event.paymentMethod === "online") {
        // 1. Register Athlete First
        const athleteData = {
          userId: localStorage.getItem("pfx_userId"),
          eventId: event._id,
          subcategory: formData.subcategory,
          paymentMethod: "online",
        };
        const registrationRes = await registrationService.registerAthlete(
          athleteData,
          token,
        );
        const registrationId = registrationRes.data?._id || "";

        // 2. Create Razorpay Order
        const orderRes = await paymentService.createOrder(
          {
            userId: localStorage.getItem("pfx_userId"),
            eventId: event._id,
            amount: event.eventPrice,
            registrationId: registrationId,
            visitorId: "",
            category: formData.subcategory,
          },
          token,
        );

        const order = orderRes.data;

        // 3. Open Razorpay
        const options = {
          key: import.meta.env.VITE_RAZORPAY_KEY_ID,
          amount: order.amount,
          currency: order.currency,
          image: import.meta.env.VITE_APP_LOGO,
          // image: 'https://ui-avatars.com/api/?name=PFX+Fitness+Expo&background=ff4444&color=fff&size=512',
          name: "PFX Fitness Expo",
          description: `Registration for ${event.eventName}`,
          order_id: order.id,
          config: {
            display: {
              hide: [{ method: "paylater" }],
            },
          },
          handler: async (response) => {
            const currentEventName = event.eventName;
            closeAthleteRegistrationModal();

            showLoading(
              "Verifying Payment...",
              "Please wait while we confirm your registration. Do not close this window.",
            );

            try {
              // 4. Verify Payment
              await paymentService.verifyPayment(
                {
                  razorpay_order_id: response.razorpay_order_id,
                  razorpay_payment_id: response.razorpay_payment_id,
                  razorpay_signature: response.razorpay_signature,
                },
                token,
              );

              closeModal();
              showRegistrationSuccess({
                eventName: currentEventName,
                type: "event",
                price: event.eventPrice,
                date: event.eventDate,
                location: event.eventLocation,
                orderId: response.razorpay_order_id,
              });
            } catch (err) {
              closeModal();
              console.error("Payment verification failed:", err);
              showModal(
                "Error",
                err.message || "Payment verification failed",
                "error",
              );
            }
          },
          prefill: {
            name: user.userName || "",
            email: user.email || "",
          },
          theme: {
            color: "#ff4444",
          },
          modal: {
            ondismiss: () => setLoading(false),
          },
        };

        const rzp = new window.Razorpay(options);
        rzp.open();
      } else {
        // Offline flow
        const athleteData = {
          userId: localStorage.getItem("pfx_userId"),
          eventId: event._id,
          subcategory: formData.subcategory,
        };
        await registrationService.registerAthlete(athleteData, token);

        const currentEventName = event.eventName;
        closeAthleteRegistrationModal();
        showRegistrationSuccess({
          eventName: currentEventName,
          type: "event",
          price: event.eventPrice,
          date: event.eventDate,
          location: event.eventLocation,
          paymentMethod: "offline",
        });
      }
    } catch (error) {
      console.error("Registration failed:", error);
      if (error.statusCode === 401) {
        showModal(
          "Session Expired",
          "Please login again to continue.",
          "warning",
        );
        logout();
      } else if (error.statusCode === 409) {
        showModal(
          "Already Registered",
          "You are already registered for this event.",
          "info",
        );
      } else if (error.statusCode === 400) {
        showModal(
          "Invalid Data",
          error.message || "Please check your inputs.",
          "error",
        );
      } else {
        showModal(
          "Registration Failed",
          error.message || "Something went wrong. Please try again.",
          "error",
        );
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal onClose={handleCloseModal} className="athlete-modal-content">
      <div className="sport-modal-hero">
        <div className="sport-modal-badge">Athlete Registration</div>
        <h3>{event.eventName}</h3>
        <p>Complete your details to register for this event.</p>
      </div>
      <div className="sport-modal-body">
        <form
          className="form"
          onSubmit={handleSubmit}
          style={{ width: "100%" }}
          noValidate
        >
          {/* Removed Age, Gender, Weight Fields */}

          {event.haveSubcategory && event.subcategories?.length > 0 && (
            <div className="form-row">
              <div className="form-field full">
                <label htmlFor="regSubcategory">Event Category</label>
                <CustomSelect
                  id="regSubcategory"
                  name="subcategory"
                  value={formData.subcategory}
                  onChange={handleChange}
                  options={event.subcategories.map(cat => ({ value: cat, label: cat }))}
                  placeholder="Select Category"
                  style={errors.subcategory ? { borderColor: "#ff4444" } : {}}
                />
                {errors.subcategory && (
                  <span
                    style={{
                      color: "#ff4444",
                      fontSize: "0.85rem",
                      marginTop: "4px",
                    }}
                  >
                    {errors.subcategory}
                  </span>
                )}
              </div>
            </div>
          )}

          <div className="form-row" style={{ marginTop: "16px" }}>
            <div className="form-field full" style={{ flexDirection: "row", alignItems: "center", gap: "10px" }}>
              <input
                id="agreedToTerms"
                name="agreedToTerms"
                type="checkbox"
                checked={formData.agreedToTerms}
                onChange={handleChange}
                className="styled-checkbox"
              />
              <label htmlFor="agreedToTerms" style={{ cursor: "pointer", textTransform: "none", letterSpacing: "normal", color: "var(--text)", fontSize: "0.85rem" }}>
                I agree to the terms and conditions and confirm my participation.
              </label>
            </div>
            {errors.agreedToTerms && (
              <span
                style={{
                  color: "#ff4444",
                  fontSize: "0.85rem",
                  marginTop: "0",
                  gridColumn: "1 / -1"
                }}
              >
                {errors.agreedToTerms}
              </span>
            )}
          </div>
          <div style={{ marginTop: "24px" }}>
            <p
              style={{
                fontSize: "0.85rem",
                color: "var(--muted)",
                marginBottom: "16px",
              }}
            >
              Registration Fee: <strong>₹{event.eventPrice}</strong>
            </p>
            <button
              type="submit"
              className="btn primary"
              style={{ width: "100%", padding: "14px" }}
              disabled={loading}
            >
              {loading ? "Processing..." : "Pay & Register Now"}
            </button>
          </div>
        </form>
      </div>
    </Modal>
  );
}

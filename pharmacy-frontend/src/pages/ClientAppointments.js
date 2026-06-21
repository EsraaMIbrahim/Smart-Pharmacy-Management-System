import React, { useCallback, useEffect, useMemo, useState } from "react";
import { pharmacyApi } from "../services/apiService";
import "./Consultations.css";

const TYPES = [
  "Medication review",
  "Minor illness advice",
  "Chronic condition support",
  "General pharmacy consultation",
];

const getAppointmentError = (error, fallback) => {
  const serverMessage =
    error.response?.data?.message || error.response?.data?.title;
  if (serverMessage) return serverMessage;
  if (!error.response)
    return "Cannot reach the pharmacy API. Make sure the .NET API is running.";
  if (error.response.status === 404)
    return "The appointment API is not loaded. Stop and restart the .NET API, then try again.";
  if (error.response.status === 500)
    return "The server could not save the appointment. Check that the latest database migration was applied.";
  return fallback;
};

function ClientAppointments({ userId }) {
  const tomorrow = new Date(Date.now() + 86400000);
  const [form, setForm] = useState({
    type: TYPES[0],
    date: tomorrow.toISOString().slice(0, 10),
    time: "10:00",
    reason: "",
  });
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState(null);
  const load = useCallback(async () => {
    try {
      setAppointments((await pharmacyApi.getMyAppointments(userId)).data || []);
    } catch (error) {
      setMessage({
        kind: "error",
        text: getAppointmentError(
          error,
          "We could not load your appointments.",
        ),
      });
    } finally {
      setLoading(false);
    }
  }, [userId]);
  useEffect(() => {
    load();
  }, [load]);
  const upcoming = useMemo(
    () =>
      appointments.filter(
        (a) =>
          a.status !== "Cancelled" && new Date(a.scheduledAt) >= new Date(),
      ),
    [appointments],
  );

  const reserve = async (e) => {
    e.preventDefault();
    setSaving(true);
    setMessage(null);
    try {
      await pharmacyApi.createAppointment({
        clientUserId: userId,
        scheduledAt: `${form.date}T${form.time}:00`,
        consultationType: form.type,
        reason: form.reason,
      });
      setForm((prev) => ({ ...prev, reason: "" }));
      setMessage({
        kind: "success",
        text: "Your request has been sent. A pharmacist will confirm it shortly.",
      });
      await load();
    } catch (error) {
      setMessage({
        kind: "error",
        text: getAppointmentError(
          error,
          "The appointment could not be reserved.",
        ),
      });
    } finally {
      setSaving(false);
    }
  };
  const cancel = async (id) => {
    if (!window.confirm("Cancel this consultation request?")) return;
    try {
      await pharmacyApi.cancelAppointment(id, userId);
      await load();
    } catch (error) {
      setMessage({
        kind: "error",
        text: getAppointmentError(
          error,
          "The appointment could not be cancelled.",
        ),
      });
    }
  };

  return (
    <div className="consult-page">
      <section className="consult-hero">
        <div>
          <span className="eyebrow">Private pharmacist care</span>
          <h1>Book a consultation</h1>
          <p>
            Choose a convenient time and tell us what you would like to discuss.
            Consultations last 30 minutes.
          </p>
        </div>
        <div className="hero-stat">
          <strong>{upcoming.length}</strong>
          <span>upcoming</span>
        </div>
      </section>
      <div className="consult-grid">
        <form className="consult-card booking-form" onSubmit={reserve}>
          <div className="card-heading">
            <div className="step-badge">1</div>
            <div>
              <h2>Choose your appointment</h2>
              <p>Available daily between 9:00 AM and 6:00 PM</p>
            </div>
          </div>
          <label>
            Consultation type
            <select
              value={form.type}
              onChange={(e) => setForm({ ...form, type: e.target.value })}
            >
              {TYPES.map((type) => (
                <option key={type}>{type}</option>
              ))}
            </select>
          </label>
          <div className="form-row">
            <label>
              Date
              <input
                type="date"
                min={new Date().toISOString().slice(0, 10)}
                value={form.date}
                onChange={(e) => setForm({ ...form, date: e.target.value })}
                required
              />
            </label>
            <label>
              Time
              <input
                type="time"
                min="09:00"
                max="17:30"
                step="1800"
                value={form.time}
                onChange={(e) => setForm({ ...form, time: e.target.value })}
                required
              />
            </label>
          </div>
          <label>
            What would you like help with?
            <textarea
              maxLength="1000"
              rows="5"
              value={form.reason}
              onChange={(e) => setForm({ ...form, reason: e.target.value })}
              placeholder="Please include symptoms, medication questions, or anything the pharmacist should know."
              required
            />
          </label>
          {message && (
            <div className={`notice ${message.kind}`}>{message.text}</div>
          )}
          <button className="primary-action" disabled={saving}>
            {saving ? "Sending request…" : "Reserve consultation"}
          </button>
          <p className="privacy-note">
            Your information is only visible to the pharmacy care team.
          </p>
        </form>
        <section className="consult-card appointments-panel">
          <div className="card-heading">
            <div className="step-badge muted">2</div>
            <div>
              <h2>Your appointments</h2>
              <p>Track confirmation and pharmacist assignment</p>
            </div>
          </div>
          {loading ? (
            <div className="empty-state">Loading appointments…</div>
          ) : appointments.length === 0 ? (
            <div className="empty-state">
              <span>📅</span>
              <strong>No appointments yet</strong>
              <p>Your first reservation will appear here.</p>
            </div>
          ) : (
            <div className="appointment-list">
              {appointments.map((a) => (
                <article className="appointment-item" key={a.id}>
                  <div className="date-tile">
                    <strong>{new Date(a.scheduledAt).getDate()}</strong>
                    <span>
                      {new Date(a.scheduledAt).toLocaleString([], {
                        month: "short",
                      })}
                    </span>
                  </div>
                  <div className="appointment-copy">
                    <div>
                      <span className={`status ${a.status.toLowerCase()}`}>
                        {a.status}
                      </span>
                      <h3>{a.consultationType}</h3>
                    </div>
                    <p>
                      {new Date(a.scheduledAt).toLocaleString([], {
                        weekday: "short",
                        hour: "numeric",
                        minute: "2-digit",
                        year: "numeric",
                        month: "short",
                        day: "numeric",
                      })}
                    </p>
                    <small>
                      {a.pharmacistName
                        ? `With ${a.pharmacistName}`
                        : "Pharmacist to be assigned"}
                    </small>
                  </div>
                  {["Pending", "Confirmed"].includes(a.status) &&
                    new Date(a.scheduledAt) > new Date() && (
                      <button
                        className="text-action danger"
                        onClick={() => cancel(a.id)}
                      >
                        Cancel
                      </button>
                    )}
                </article>
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
export default ClientAppointments;

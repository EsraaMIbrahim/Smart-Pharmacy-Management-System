import React, { useCallback, useEffect, useMemo, useState } from "react";
import { pharmacyApi } from "../services/apiService";
import "./Consultations.css";

function AppointmentManagement({ userId, userRole }) {
  const [appointments, setAppointments] = useState([]),
    [pharmacists, setPharmacists] = useState([]);
  const [filter, setFilter] = useState("Upcoming"),
    [loading, setLoading] = useState(true),
    [error, setError] = useState("");
  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [items, staff] = await Promise.all([
        pharmacyApi.getAppointmentsForManagement(userId),
        pharmacyApi.getPharmacists(userId),
      ]);
      setAppointments(items.data || []);
      setPharmacists(staff.data || []);
      setError("");
    } catch {
      setError("Appointments could not be loaded.");
    } finally {
      setLoading(false);
    }
  }, [userId]);
  useEffect(() => {
    load();
  }, [load]);
  const visible = useMemo(
    () =>
      appointments.filter(
        (a) =>
          filter === "All" ||
          (filter === "Upcoming"
            ? !["Completed", "Cancelled"].includes(a.status) &&
              new Date(a.scheduledAt) >= new Date()
            : a.status === filter),
      ),
    [appointments, filter],
  );
  const change = (id, field, value) =>
    setAppointments((list) =>
      list.map((a) => (a.id === id ? { ...a, [field]: value } : a)),
    );
  const save = async (a) => {
    try {
      await pharmacyApi.updateAppointment(a.id, {
        actorUserId: userId,
        status: a.status,
        pharmacistUserId: a.pharmacistUserId || null,
        staffNotes: a.staffNotes || null,
      });
      await load();
    } catch (e) {
      setError(
        e.response?.data?.message || "This appointment could not be updated.",
      );
    }
  };
  const pending = appointments.filter((a) => a.status === "Pending").length;
  const today = appointments.filter(
    (a) =>
      new Date(a.scheduledAt).toDateString() === new Date().toDateString() &&
      a.status !== "Cancelled",
  ).length;
  return (
    <div className="consult-page management-page">
      <section className="consult-hero">
        <div>
          <span className="eyebrow">Care team workspace</span>
          <h1>Consultation schedule</h1>
          <p>Review requests, assign pharmacists, and keep clients informed.</p>
        </div>
        <div className="metric-row">
          <div className="hero-stat">
            <strong>{today}</strong>
            <span>today</span>
          </div>
          <div className="hero-stat amber">
            <strong>{pending}</strong>
            <span>awaiting review</span>
          </div>
        </div>
      </section>
      <section className="consult-card management-card">
        <div className="management-toolbar">
          <div className="filter-pills">
            {[
              "Upcoming",
              "Pending",
              "Confirmed",
              "Completed",
              "Cancelled",
              "All",
            ].map((x) => (
              <button
                key={x}
                className={filter === x ? "active" : ""}
                onClick={() => setFilter(x)}
              >
                {x}
              </button>
            ))}
          </div>
          <button className="secondary-action" onClick={load}>
            Refresh
          </button>
        </div>
        {error && <div className="notice error">{error}</div>}
        {loading ? (
          <div className="empty-state">Loading schedule…</div>
        ) : visible.length === 0 ? (
          <div className="empty-state">
            <span>✓</span>
            <strong>Nothing in this view</strong>
          </div>
        ) : (
          <div className="management-list">
            {visible.map((a) => (
              <article className="management-item" key={a.id}>
                <div className="schedule-time">
                  <strong>
                    {new Date(a.scheduledAt).toLocaleTimeString([], {
                      hour: "numeric",
                      minute: "2-digit",
                    })}
                  </strong>
                  <span>
                    {new Date(a.scheduledAt).toLocaleDateString([], {
                      weekday: "short",
                      month: "short",
                      day: "numeric",
                    })}
                  </span>
                </div>
                <div className="client-block">
                  <span className={`status ${a.status.toLowerCase()}`}>
                    {a.status}
                  </span>
                  <h3>{a.clientName}</h3>
                  <p>
                    {a.consultationType} ·{" "}
                    {a.phoneNumber || "No phone provided"}
                  </p>
                  <small>{a.reason}</small>
                </div>
                <div className="management-controls">
                  <div className="control-row">
                    <label>
                      Status
                      <select
                        value={a.status}
                        onChange={(e) => change(a.id, "status", e.target.value)}
                      >
                        {["Pending", "Confirmed", "Completed", "Cancelled"].map(
                          (s) => (
                            <option key={s}>{s}</option>
                          ),
                        )}
                      </select>
                    </label>
                    <label>
                      Pharmacist
                      <select
                        value={a.pharmacistUserId || ""}
                        disabled={userRole === "Pharmacist"}
                        onChange={(e) =>
                          change(
                            a.id,
                            "pharmacistUserId",
                            e.target.value ? Number(e.target.value) : null,
                          )
                        }
                      >
                        <option value="">Unassigned</option>
                        {pharmacists.map((p) => (
                          <option key={p.id} value={p.id}>
                            {p.name}
                          </option>
                        ))}
                      </select>
                    </label>
                  </div>
                  <label>
                    Care notes
                    <input
                      value={a.staffNotes || ""}
                      maxLength="1000"
                      onChange={(e) =>
                        change(a.id, "staffNotes", e.target.value)
                      }
                      placeholder="Optional internal note"
                    />
                  </label>
                  <button
                    className="primary-action compact"
                    onClick={() => save(a)}
                  >
                    Save changes
                  </button>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
export default AppointmentManagement;

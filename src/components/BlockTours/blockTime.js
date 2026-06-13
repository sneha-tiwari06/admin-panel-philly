import React, { useState, useEffect } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import axiosInstance from "../../utils/axiosInstnace";
import { ArrowLeft, Save, Calendar, Clock, TimerOff } from "lucide-react";
import "../../styles/admin-page.css";

const TIME_SLOTS = [
  { value: "10:00 AM", label: "10:00 AM — Morning" },
  { value: "01:00 PM", label: "01:00 PM — Afternoon" },
  { value: "04:00 PM", label: "04:00 PM — Late Afternoon" },
  { value: "07:00 PM", label: "07:00 PM — Evening" },
];

function formatDisplayDate(dateStr) {
  if (!dateStr) return null;
  return new Date(dateStr).toLocaleDateString(undefined, {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

function BlockTime() {
  const { id } = useParams();
  const isEdit = Boolean(id);
  const navigate = useNavigate();

  const [blockDate, setBlockDate] = useState("");
  const [blockTime, setBlockTime] = useState("");
  const [isActive, setIsActive] = useState(true);
  const [loading, setLoading] = useState(isEdit);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!id) return;

    axiosInstance
      .get(`/block-time/${id}`)
      .then((response) => {
        const data = response.data;
        setBlockDate(data?.blockDate ? data.blockDate.slice(0, 10) : "");
        setBlockTime(data?.blockTime || "");
        setIsActive(data?.isActive ?? true);
      })
      .catch((err) => console.error("Error fetching block time:", err))
      .finally(() => setLoading(false));
  }, [id]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      const payload = { blockDate, blockTime, isActive };

      if (id) {
        await axiosInstance.post(`/block-time/update/${id}`, payload);
      } else {
        await axiosInstance.post("/block-time/add", payload);
      }

      navigate("/manage-block-times");
    } catch (err) {
      console.error("Error submitting time slot:", err);
      alert("Failed to save blocked time. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="admin-page">
        <div className="admin-page__loading">Loading block time…</div>
      </div>
    );
  }

  return (
    <div className="admin-page">
      <div className="admin-page__header">
        <div>
          <h1 className="admin-page__title">
            {isEdit ? "Edit Blocked Time" : "Add Blocked Time"}
          </h1>
          <p className="admin-page__subtitle">
            {isEdit
              ? "Update the date, time slot, or active status for this block."
              : "Block a specific time slot on a date from tour bookings."}
          </p>
        </div>
        <Link to="/manage-block-times" className="admin-btn admin-btn--ghost">
          <ArrowLeft size={18} />
          Back to Blocked Times
        </Link>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="admin-form-stack">
          <div className="admin-form-card" style={{ maxWidth: 640 }}>
            <div className="admin-form-section">
              <h2 className="admin-form-section__title">
                <TimerOff size={16} style={{ verticalAlign: "middle", marginRight: 6 }} />
                Time Slot Details
              </h2>
              <p className="admin-form-section__desc">
                Choose the date and time slot to block from customer bookings.
              </p>

              <div className="admin-form-grid">
                <div className="admin-form-group admin-form-group--full">
                  <label className="admin-form-label" htmlFor="blockDate">
                    Block Date <span>*</span>
                  </label>
                  <input
                    id="blockDate"
                    type="date"
                    className="admin-form-input"
                    value={blockDate}
                    onChange={(e) => setBlockDate(e.target.value)}
                    required
                  />
                  <p className="admin-form-hint">
                    The date when this time slot should be unavailable.
                  </p>
                </div>

                <div className="admin-form-group admin-form-group--full">
                  <label className="admin-form-label" htmlFor="blockTime">
                    Time Slot <span>*</span>
                  </label>
                  <select
                    id="blockTime"
                    className="admin-form-select"
                    value={blockTime}
                    onChange={(e) => setBlockTime(e.target.value)}
                    required
                  >
                    <option value="">Select a time slot</option>
                    {TIME_SLOTS.map((slot) => (
                      <option key={slot.value} value={slot.value}>
                        {slot.label}
                      </option>
                    ))}
                  </select>
                  <p className="admin-form-hint">
                    Available tour departure times for Philly City Tours.
                  </p>
                </div>

                {blockDate && blockTime && (
                  <div className="admin-form-group admin-form-group--full">
                    <div className="admin-slug-preview">
                      <Calendar size={15} />
                      <strong>{formatDisplayDate(blockDate)}</strong>
                      <span style={{ color: "#cbd5e1" }}>·</span>
                      <Clock size={15} />
                      <strong>{blockTime}</strong>
                    </div>
                  </div>
                )}

                <div className="admin-form-group admin-form-group--full">
                  <label className="admin-form-checkbox" htmlFor="isActive">
                    <input
                      type="checkbox"
                      id="isActive"
                      checked={isActive}
                      onChange={(e) => setIsActive(e.target.checked)}
                    />
                    <span>Active — block this time slot on the selected date</span>
                  </label>
                  <p className="admin-form-hint" style={{ marginTop: 8 }}>
                    Turn off to keep the record without blocking bookings.
                  </p>
                </div>
              </div>
            </div>

            <div className="admin-form-footer admin-form-footer--split">
              <span className="admin-form-footer__note">
                Fields marked with <span style={{ color: "#ef4444" }}>*</span> are required.
              </span>
              <div className="admin-page__actions">
                <Link to="/manage-block-times" className="admin-btn admin-btn--secondary">
                  Cancel
                </Link>
                <button
                  type="submit"
                  className="admin-btn admin-btn--primary"
                  disabled={submitting}
                >
                  <Save size={18} />
                  {submitting
                    ? "Saving…"
                    : isEdit
                    ? "Update Blocked Time"
                    : "Create Blocked Time"}
                </button>
              </div>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
}

export default BlockTime;

import React, { useState, useEffect } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import axiosInstance from "../../utils/axiosInstnace";
import { ArrowLeft, Save, Calendar, CalendarOff } from "lucide-react";
import "../../styles/admin-page.css";

function formatDisplayDate(dateStr) {
  if (!dateStr) return null;
  return new Date(dateStr).toLocaleDateString(undefined, {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

function BlockDate() {
  const { id } = useParams();
  const isEdit = Boolean(id);
  const navigate = useNavigate();

  const [blockDate, setBlockDate] = useState("");
  const [isActive, setIsActive] = useState(true);
  const [loading, setLoading] = useState(isEdit);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!id) return;

    axiosInstance
      .get(`/block-date/${id}`)
      .then((response) => {
        const data = response.data;
        setBlockDate(data?.blockDate ? data.blockDate.slice(0, 10) : "");
        setIsActive(data?.isActive ?? true);
      })
      .catch((err) => console.error("Error fetching block date:", err))
      .finally(() => setLoading(false));
  }, [id]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      const payload = { blockDate, isActive };

      if (id) {
        await axiosInstance.post(`/block-date/update/${id}`, payload);
      } else {
        await axiosInstance.post("/block-date/add", payload);
      }

      navigate("/manage-block-dates");
    } catch (err) {
      console.error("Error submitting date:", err);
      alert("Failed to save blocked date. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="admin-page">
        <div className="admin-page__loading">Loading block date…</div>
      </div>
    );
  }

  return (
    <div className="admin-page">
      <div className="admin-page__header">
        <div>
          <h1 className="admin-page__title">
            {isEdit ? "Edit Blocked Day" : "Add Blocked Day"}
          </h1>
          <p className="admin-page__subtitle">
            {isEdit
              ? "Update the date or active status for this full-day block."
              : "Select a date to block all tour bookings for the entire day."}
          </p>
        </div>
        <Link to="/manage-block-dates" className="admin-btn admin-btn--ghost">
          <ArrowLeft size={18} />
          Back to Blocked Days
        </Link>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="admin-form-stack">
          <div className="admin-form-card" style={{ maxWidth: 640 }}>
            <div className="admin-form-section">
              <h2 className="admin-form-section__title">
                <CalendarOff size={16} style={{ verticalAlign: "middle", marginRight: 6 }} />
                Block Date Details
              </h2>
              <p className="admin-form-section__desc">
                Customers will not be able to book tours on this date when active.
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
                    Pick the day you want to fully block from bookings.
                  </p>
                </div>

                {blockDate && (
                  <div className="admin-form-group admin-form-group--full">
                    <div className="admin-slug-preview">
                      <Calendar size={15} />
                      Selected: <strong>{formatDisplayDate(blockDate)}</strong>
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
                    <span>Active — block bookings on this date</span>
                  </label>
                  <p className="admin-form-hint" style={{ marginTop: 8 }}>
                    Turn off to keep the date on record without blocking bookings.
                  </p>
                </div>
              </div>
            </div>

            <div className="admin-form-footer admin-form-footer--split">
              <span className="admin-form-footer__note">
                Fields marked with <span style={{ color: "#ef4444" }}>*</span> are required.
              </span>
              <div className="admin-page__actions">
                <Link to="/manage-block-dates" className="admin-btn admin-btn--secondary">
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
                    ? "Update Blocked Day"
                    : "Create Blocked Day"}
                </button>
              </div>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
}

export default BlockDate;

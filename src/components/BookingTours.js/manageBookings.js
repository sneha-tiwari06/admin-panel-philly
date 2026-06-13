import React, { useEffect, useState, useMemo, useCallback } from "react";
import axiosInstance from "../../utils/axiosInstnace";
import TableContainer from "../../common/TableContainer";
import {
  Eye,
  Trash,
  Search,
  Ticket,
  CheckCircle2,
  Clock,
  DollarSign,
  X,
} from "lucide-react";
import "../../styles/admin-page.css";
import "../../styles/dashboard.css";

function formatGuestName(booking) {
  if (!booking?.guestId) return "—";
  return `${booking.guestId.firstname || "Guest"} ${booking.guestId.lastname || ""}`.trim();
}

function formatBookingDate(booking) {
  if (!booking?.bookingDate) return "—";
  return `${new Date(booking.bookingDate).toLocaleDateString(undefined, {
    weekday: "short",
    year: "numeric",
    month: "short",
    day: "numeric",
  })}${booking.bookingTime ? ` · ${booking.bookingTime}` : ""}`;
}

function getBookingRevenue(booking) {
  return Number(booking?.paymentId?.total_price) || 0;
}

function ManageBookings() {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [showModal, setShowModal] = useState(false);

  const handleDelete = useCallback(async (bookingId) => {
    if (!window.confirm("Are you sure you want to delete this booking?")) return;
    try {
      await axiosInstance.delete(`/complete-booking/bookings/${bookingId}`);
      setBookings((prev) => prev.filter((b) => b._id !== bookingId));
    } catch (err) {
      alert("Failed to delete booking: " + (err.response?.data?.message || err.message));
    }
  }, []);

  useEffect(() => {
    const fetchBookings = async () => {
      try {
        const response = await axiosInstance.get("/complete-booking/bookings-tour");
        const newBookings = response.data.bookings || response.data;
        const sortedBookings = [...newBookings].sort(
          (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
        );
        setBookings(sortedBookings);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchBookings();
  }, []);

  const filteredBookings = useMemo(() => {
    if (!searchTerm.trim()) return bookings;
    const query = searchTerm.toLowerCase();
    return bookings.filter(
      (booking) =>
        booking.tour_name?.toLowerCase().includes(query) ||
        formatGuestName(booking).toLowerCase().includes(query) ||
        booking.guestId?.uemail?.toLowerCase().includes(query) ||
        booking.customOrderId?.toLowerCase().includes(query)
    );
  }, [bookings, searchTerm]);

  const confirmedCount = useMemo(
    () => bookings.filter((b) => b.order_status).length,
    [bookings]
  );

  const pendingCount = bookings.length - confirmedCount;

  const totalRevenue = useMemo(
    () => bookings.reduce((sum, b) => sum + getBookingRevenue(b), 0),
    [bookings]
  );

  const openDetails = (booking) => {
    setSelectedBooking(booking);
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setSelectedBooking(null);
  };

  const columns = useMemo(
    () => [
      {
        name: "#",
        cell: (_row, index) => index + 1,
        sortable: false,
        width: "60px",
      },
      {
        name: "Tour",
        selector: (row) => row.tour_name,
        sortable: true,
        grow: 2,
        cell: (row) => (
          <div>
            <div style={{ fontWeight: 600, color: "#0f172a" }}>{row.tour_name || "—"}</div>
            {row.customOrderId && (
              <div style={{ fontSize: "0.75rem", color: "#94a3b8", marginTop: 2 }}>
                {row.customOrderId}
              </div>
            )}
          </div>
        ),
      },
      {
        name: "Guest",
        selector: (row) => formatGuestName(row),
        sortable: true,
        grow: 1.5,
        cell: (row) => (
          <div>
            <div style={{ fontWeight: 500 }}>{formatGuestName(row)}</div>
            <div style={{ fontSize: "0.75rem", color: "#64748b", marginTop: 2 }}>
              {row.guestId?.uemail || "—"}
            </div>
          </div>
        ),
      },
      {
        name: "Members",
        selector: (row) => (row.adults || 0) + (row.kids || 0),
        sortable: true,
        width: "100px",
        cell: (row) => (
          <span>
            {(row.adults || 0) + (row.kids || 0)}
            <span style={{ color: "#94a3b8", fontSize: "0.75rem" }}>
              {" "}
              ({row.adults || 0}A/{row.kids || 0}K)
            </span>
          </span>
        ),
      },
      {
        name: "Cars",
        selector: (row) => row.number_of_cars,
        sortable: true,
        width: "80px",
      },
      {
        name: "Status",
        selector: (row) => row.order_status,
        sortable: true,
        width: "120px",
        cell: (row) => (
          <span
            className={`admin-badge ${
              row.order_status ? "admin-badge--active" : "admin-badge--inactive"
            }`}
          >
            {row.order_status ? "Confirmed" : "Pending"}
          </span>
        ),
      },
      {
        name: "Payment",
        width: "100px",
        cell: (row) => (
          <span
            className={`admin-badge ${
              row.paymentId?.payment_status ? "admin-badge--active" : "admin-badge--inactive"
            }`}
          >
            {row.paymentId?.payment_status ? "Paid" : "Unpaid"}
          </span>
        ),
      },
      {
        name: "Total",
        selector: (row) => getBookingRevenue(row),
        sortable: true,
        width: "100px",
        cell: (row) => {
          const amount = getBookingRevenue(row);
          return (
            <span style={{ fontWeight: 600, color: "#0f172a" }}>
              {amount ? `$${amount}` : "—"}
            </span>
          );
        },
      },
      {
        name: "Booking Date",
        selector: (row) => row.bookingDate,
        sortable: true,
        grow: 1.5,
        cell: (row) => (
          <span style={{ fontSize: "0.8125rem" }}>{formatBookingDate(row)}</span>
        ),
      },
      {
        name: "Actions",
        width: "100px",
        cell: (row) => (
          <div className="admin-action-group">
            <button
              type="button"
              className="admin-btn admin-btn--icon admin-btn--gallery"
              onClick={() => openDetails(row)}
              title="View details"
            >
              <Eye size={15} />
            </button>
            <button
              type="button"
              className="admin-btn admin-btn--icon admin-btn--delete"
              onClick={() => handleDelete(row._id)}
              title="Delete booking"
            >
              <Trash size={15} />
            </button>
          </div>
        ),
        ignoreRowClick: true,
        allowOverflow: true,
        button: true,
      },
    ],
    [handleDelete]
  );

  const renderBookingDetails = () => {
    if (!selectedBooking) return null;

    const guest = selectedBooking?.guestId || {};
    const payment = selectedBooking?.paymentId || {};

    const details = [
      { label: "Order ID", value: selectedBooking.customOrderId || selectedBooking._id },
      { label: "Tour Name", value: selectedBooking.tour_name, full: true },
      { label: "Adults", value: selectedBooking.adults },
      { label: "Kids", value: selectedBooking.kids },
      { label: "Cars", value: selectedBooking.number_of_cars },
      {
        label: "Order Status",
        value: selectedBooking.order_status ? "Confirmed" : "Pending",
      },
      { label: "Booking Date", value: formatBookingDate(selectedBooking), full: true },
      { label: "Guest Name", value: `${guest.firstname || ""} ${guest.lastname || ""}`.trim() },
      { label: "Guest Email", value: guest.uemail },
      { label: "Guest Mobile", value: guest.mobile },
      { label: "Payment Status", value: payment.payment_status ? "Paid" : "Unpaid" },
      { label: "Total Price", value: payment.total_price ? `$${payment.total_price}` : "—" },
      { label: "Sub Total", value: payment.sub_total ? `$${payment.sub_total}` : "—" },
      { label: "Discount", value: selectedBooking.discount ?? "—" },
      { label: "Payment Method", value: payment.payment_method },
      {
        label: "Card Detail",
        value: payment.card_detail ? `**** **** **** ${payment.card_detail}` : "—",
      },
      { label: "Transaction ID", value: payment.transactionId, full: true },
      {
        label: "Created At",
        value: selectedBooking.createdAt ? selectedBooking.createdAt.slice(0, 10) : "—",
      },
    ];

    return (
      <div className="dashboard-detail-grid">
        {details.map((item) => (
          <div
            key={item.label}
            className={`dashboard-detail-item${item.full ? " dashboard-detail-item--full" : ""}`}
          >
            <div className="dashboard-detail-item__label">{item.label}</div>
            <div className="dashboard-detail-item__value">{item.value || "—"}</div>
          </div>
        ))}
      </div>
    );
  };

  if (loading) {
    return (
      <div className="admin-page">
        <div className="admin-page__loading">Loading bookings…</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="admin-page">
        <div className="admin-page__error">Error loading bookings: {error}</div>
      </div>
    );
  }

  return (
    <div className="admin-page">
      <div className="admin-page__header">
        <div>
          <h1 className="admin-page__title">Manage Bookings</h1>
          <p className="admin-page__subtitle">
            View tour reservations, payment status, and guest details.
          </p>
        </div>
      </div>

      <div className="admin-page__stats">
        <div className="admin-page__stat">
          <div className="admin-page__stat-icon admin-page__stat-icon--amber">
            <Ticket size={20} />
          </div>
          <div>
            <div className="admin-page__stat-label">Total Bookings</div>
            <div className="admin-page__stat-value">{bookings.length}</div>
          </div>
        </div>
        <div className="admin-page__stat">
          <div className="admin-page__stat-icon admin-page__stat-icon--green">
            <CheckCircle2 size={20} />
          </div>
          <div>
            <div className="admin-page__stat-label">Confirmed</div>
            <div className="admin-page__stat-value">{confirmedCount}</div>
          </div>
        </div>
        <div className="admin-page__stat">
          <div className="admin-page__stat-icon admin-page__stat-icon--slate">
            <Clock size={20} />
          </div>
          <div>
            <div className="admin-page__stat-label">Pending</div>
            <div className="admin-page__stat-value">{pendingCount}</div>
          </div>
        </div>
        <div className="admin-page__stat">
          <div className="admin-page__stat-icon admin-page__stat-icon--green">
            <DollarSign size={20} />
          </div>
          <div>
            <div className="admin-page__stat-label">Total Revenue</div>
            <div className="admin-page__stat-value">
              ${totalRevenue.toLocaleString(undefined, { maximumFractionDigits: 0 })}
            </div>
          </div>
        </div>
      </div>

      <div className="admin-page__card">
        <div className="admin-page__card-header">
          <h2 className="admin-page__card-title">All Bookings</h2>
          <span className="admin-page__card-count">
            {filteredBookings.length} of {bookings.length} shown
          </span>
        </div>

        <div className="admin-page__toolbar">
          <div className="admin-page__search">
            <Search size={16} className="admin-page__search-icon" />
            <input
              type="text"
              className="admin-page__search-input"
              placeholder="Search by tour, guest, email, or order ID…"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        {bookings.length === 0 ? (
          <div className="admin-page__empty">
            <div className="admin-page__empty-icon">
              <Ticket size={24} />
            </div>
            <h3 className="admin-page__empty-title">No bookings yet</h3>
            <p className="admin-page__empty-text">
              Tour bookings will appear here once customers make reservations.
            </p>
          </div>
        ) : (
          <TableContainer
            columns={columns}
            data={filteredBookings}
            noDataComponent={
              <div className="admin-page__empty" style={{ minHeight: 160 }}>
                <p className="admin-page__empty-text" style={{ margin: 0 }}>
                  No bookings match your search.
                </p>
              </div>
            }
          />
        )}
      </div>

      {showModal && selectedBooking && (
        <>
          <div className="dashboard-modal-backdrop" onClick={closeModal} />
          <div className="dashboard-modal" role="dialog" aria-modal="true">
            <div className="dashboard-modal__content">
              <div className="dashboard-modal__header">
                <h3 className="dashboard-modal__title">Booking Details</h3>
                <button
                  type="button"
                  className="dashboard-modal__close"
                  onClick={closeModal}
                  aria-label="Close"
                >
                  <X size={18} />
                </button>
              </div>
              <div className="dashboard-modal__body">{renderBookingDetails()}</div>
              <div className="dashboard-modal__footer">
                <button
                  type="button"
                  className="dashboard-btn dashboard-btn--secondary"
                  onClick={closeModal}
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

export default ManageBookings;

import React, { useEffect, useState, useMemo, useCallback } from "react";
import axiosInstance from "../../utils/axiosInstnace";
import TableContainer from "../../common/TableContainer";
import {
  Eye,
  Search,
  MessageSquare,
  Mail,
  Phone,
  X,
  Inbox,
} from "lucide-react";
import "../../styles/admin-page.css";
import "../../styles/dashboard.css";

function ManageContactQuery() {
  const [contacts, setContacts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedContact, setSelectedContact] = useState(null);
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    const fetchContactQueries = async () => {
      try {
        const response = await axiosInstance.get("/contact/messages");
        const data = response.data || [];
        const sorted = [...data].sort(
          (a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0)
        );
        setContacts(sorted);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchContactQueries();
  }, []);

  const filteredContacts = useMemo(() => {
    if (!searchTerm.trim()) return contacts;
    const query = searchTerm.toLowerCase();
    return contacts.filter(
      (contact) =>
        contact.firstname?.toLowerCase().includes(query) ||
        contact.con_email?.toLowerCase().includes(query) ||
        contact.con_mobile?.toLowerCase().includes(query) ||
        contact.con_message?.toLowerCase().includes(query)
    );
  }, [contacts, searchTerm]);

  const withMessageCount = useMemo(
    () => contacts.filter((c) => c.con_message?.trim()).length,
    [contacts]
  );

  const openDetails = useCallback((contact) => {
    setSelectedContact(contact);
    setShowModal(true);
  }, []);

  const closeModal = useCallback(() => {
    setShowModal(false);
    setSelectedContact(null);
  }, []);

  const columns = useMemo(
    () => [
      {
        name: "#",
        cell: (_row, index) => index + 1,
        sortable: false,
        width: "60px",
      },
      {
        name: "Contact",
        selector: (row) => row.firstname,
        sortable: true,
        grow: 2,
        cell: (row) => (
          <div className="admin-category-name">
            <span className="admin-category-avatar">
              {(row.firstname || "?").charAt(0).toUpperCase()}
            </span>
            <div>
              <div style={{ fontWeight: 600, color: "#0f172a" }}>
                {row.firstname || "—"}
              </div>
              <div style={{ fontSize: "0.75rem", color: "#64748b", marginTop: 2 }}>
                {row.con_email || "—"}
              </div>
            </div>
          </div>
        ),
      },
      {
        name: "Mobile",
        selector: (row) => row.con_mobile,
        sortable: true,
        width: "150px",
        cell: (row) => (
          <span style={{ fontSize: "0.8125rem", color: "#475569" }}>
            {row.con_mobile || "—"}
          </span>
        ),
      },
      {
        name: "Message",
        selector: (row) => row.con_message,
        sortable: true,
        grow: 2,
        cell: (row) => (
          <span
            style={{
              fontSize: "0.8125rem",
              color: "#64748b",
              display: "block",
              maxWidth: 320,
              overflow: "hidden",
              textOverflow: "ellipsis",
              whiteSpace: "nowrap",
            }}
            title={row.con_message}
          >
            {row.con_message || "—"}
          </span>
        ),
      },
      {
        name: "Actions",
        width: "90px",
        cell: (row) => (
          <div className="admin-action-group">
            <button
              type="button"
              className="admin-btn admin-btn--icon admin-btn--edit"
              onClick={() => openDetails(row)}
              title="View details"
            >
              <Eye size={15} />
            </button>
          </div>
        ),
        ignoreRowClick: true,
        allowOverflow: true,
        button: true,
      },
    ],
    [openDetails]
  );

  const renderContactDetails = () => {
    if (!selectedContact) return null;

    const details = [
      { label: "Name", value: selectedContact.firstname },
      { label: "Email", value: selectedContact.con_email },
      { label: "Mobile Number", value: selectedContact.con_mobile },
      ...(selectedContact.createdAt
        ? [
            {
              label: "Submitted",
              value: new Date(selectedContact.createdAt).toLocaleString(undefined, {
                weekday: "short",
                year: "numeric",
                month: "short",
                day: "numeric",
                hour: "2-digit",
                minute: "2-digit",
              }),
            },
          ]
        : []),
      ...(selectedContact.con_message
        ? [{ label: "Message", value: selectedContact.con_message, full: true }]
        : []),
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
        <div className="admin-page__loading">Loading contact queries…</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="admin-page">
        <div className="admin-page__error">Error loading contact queries: {error}</div>
      </div>
    );
  }

  return (
    <div className="admin-page">
      <div className="admin-page__header">
        <div>
          <h1 className="admin-page__title">Contact Queries</h1>
          <p className="admin-page__subtitle">
            View messages submitted through the website contact form.
          </p>
        </div>
      </div>

      <div className="admin-page__stats">
        <div className="admin-page__stat">
          <div className="admin-page__stat-icon admin-page__stat-icon--amber">
            <MessageSquare size={20} />
          </div>
          <div>
            <div className="admin-page__stat-label">Total Queries</div>
            <div className="admin-page__stat-value">{contacts.length}</div>
          </div>
        </div>
        <div className="admin-page__stat">
          <div className="admin-page__stat-icon admin-page__stat-icon--green">
            <Mail size={20} />
          </div>
          <div>
            <div className="admin-page__stat-label">With Messages</div>
            <div className="admin-page__stat-value">{withMessageCount}</div>
          </div>
        </div>
        <div className="admin-page__stat">
          <div className="admin-page__stat-icon admin-page__stat-icon--slate">
            <Phone size={20} />
          </div>
          <div>
            <div className="admin-page__stat-label">With Phone</div>
            <div className="admin-page__stat-value">
              {contacts.filter((c) => c.con_mobile?.trim()).length}
            </div>
          </div>
        </div>
      </div>

      <div className="admin-page__card">
        <div className="admin-page__card-header">
          <h2 className="admin-page__card-title">All Queries</h2>
          <span className="admin-page__card-count">
            {filteredContacts.length} of {contacts.length} shown
          </span>
        </div>

        <div className="admin-page__toolbar">
          <div className="admin-page__search">
            <Search size={16} className="admin-page__search-icon" />
            <input
              type="text"
              className="admin-page__search-input"
              placeholder="Search by name, email, phone, or message…"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        {contacts.length === 0 ? (
          <div className="admin-page__empty">
            <div className="admin-page__empty-icon">
              <Inbox size={24} />
            </div>
            <h3 className="admin-page__empty-title">No contact queries yet</h3>
            <p className="admin-page__empty-text">
              Messages from the website contact form will appear here.
            </p>
          </div>
        ) : (
          <TableContainer
            columns={columns}
            data={filteredContacts}
            noDataComponent={
              <div className="admin-page__empty" style={{ minHeight: 160 }}>
                <p className="admin-page__empty-text" style={{ margin: 0 }}>
                  No queries match your search.
                </p>
              </div>
            }
          />
        )}
      </div>

      {showModal && selectedContact && (
        <>
          <div className="dashboard-modal-backdrop" onClick={closeModal} />
          <div className="dashboard-modal" role="dialog" aria-modal="true">
            <div className="dashboard-modal__content">
              <div className="dashboard-modal__header">
                <h3 className="dashboard-modal__title">Contact Details</h3>
                <button
                  type="button"
                  className="dashboard-modal__close"
                  onClick={closeModal}
                  aria-label="Close"
                >
                  <X size={18} />
                </button>
              </div>
              <div className="dashboard-modal__body">{renderContactDetails()}</div>
              <div className="dashboard-modal__footer">
                {selectedContact.con_email && (
                  <a
                    href={`mailto:${selectedContact.con_email}`}
                    className="admin-btn admin-btn--secondary"
                    style={{ marginRight: "auto" }}
                  >
                    <Mail size={16} />
                    Reply via Email
                  </a>
                )}
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

export default ManageContactQuery;

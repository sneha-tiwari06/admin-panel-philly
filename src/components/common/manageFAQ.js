import React, { useEffect, useState, useMemo, useCallback } from "react";
import { Link } from "react-router-dom";
import axiosInstance from "../../utils/axiosInstnace";
import TableContainer from "../../common/TableContainer";
import {
  Plus,
  Search,
  HelpCircle,
  Edit,
  Trash,
  Layers,
} from "lucide-react";
import "../../styles/admin-page.css";

function ManageFAQ() {
  const [faqs, setFaqs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    const fetchFaqs = async () => {
      try {
        const response = await axiosInstance.get("/faqs");
        setFaqs(response.data || []);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchFaqs();
  }, []);

  const handleDelete = useCallback(async (id) => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this FAQ?"
    );
    if (!confirmed) return;

    try {
      await axiosInstance.get(`/faqs/delete/${id}`);
      setFaqs((prev) => prev.filter((faq) => faq._id !== id));
    } catch (err) {
      alert("Error deleting FAQ: " + err.message);
    }
  }, []);

  const filteredFaqs = useMemo(() => {
    if (!searchTerm.trim()) return faqs;
    const query = searchTerm.toLowerCase();
    return faqs.filter(
      (faq) =>
        faq.question?.toLowerCase().includes(query) ||
        faq.answer?.toLowerCase().includes(query) ||
        faq.category?.slugURL?.toLowerCase().includes(query) ||
        faq.category?.category?.toLowerCase().includes(query)
    );
  }, [faqs, searchTerm]);

  const categoryCount = useMemo(() => {
    const ids = new Set(
      faqs.map((faq) => faq.category?._id || faq.category?.slugURL).filter(Boolean)
    );
    return ids.size;
  }, [faqs]);

  const columns = useMemo(
    () => [
      {
        name: "#",
        selector: (_row, index) => index + 1,
        sortable: false,
        width: "60px",
      },
      {
        name: "Category",
        selector: (row) => row.category?.slugURL || row.category?.category,
        sortable: true,
        grow: 2,
        cell: (row) => (
          <span className="admin-badge admin-badge--inactive">
            {row.category?.category || row.category?.slugURL || "—"}
          </span>
        ),
      },
      {
        name: "Question",
        selector: (row) => row.question,
        sortable: true,
        grow: 1.5,
        cell: (row) => (
          <span style={{ fontWeight: 600, color: "#0f172a" }}>
            {row.question || "—"}
          </span>
        ),
      },
      {
        name: "Answer",
        selector: (row) => row.answer,
        sortable: true,
        grow: 2,
        cell: (row) => (
          <span
            style={{
              fontSize: "0.8125rem",
              color: "#64748b",
              display: "block",
              maxWidth: 480,
              overflow: "hidden",
              textOverflow: "ellipsis",
              whiteSpace: "nowrap",
            }}
            title={row.answer}
          >
            {row.answer || "—"}
          </span>
        ),
      },
      {
        name: "Actions",
        width: "120px",
        cell: (row) => (
          <div className="admin-action-group">
            <Link to={`/edit-faqs/${row._id}`} title="Edit FAQ">
              <button type="button" className="admin-btn admin-btn--icon admin-btn--edit">
                <Edit size={15} />
              </button>
            </Link>
            <button
              type="button"
              className="admin-btn admin-btn--icon admin-btn--delete"
              onClick={() => handleDelete(row._id)}
              title="Delete FAQ"
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

  if (loading) {
    return (
      <div className="admin-page">
        <div className="admin-page__loading">Loading FAQs…</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="admin-page">
        <div className="admin-page__error">Error loading FAQs: {error}</div>
      </div>
    );
  }

  return (
    <div className="admin-page">
      <div className="admin-page__header">
        <div>
          <h1 className="admin-page__title">Manage FAQs</h1>
          <p className="admin-page__subtitle">
            Organize frequently asked questions by tour category.
          </p>
        </div>
        <Link to="/add-faqs" className="admin-btn admin-btn--primary">
          <Plus size={18} />
          Add FAQs
        </Link>
      </div>

      <div className="admin-page__stats">
        <div className="admin-page__stat">
          <div className="admin-page__stat-icon admin-page__stat-icon--amber">
            <HelpCircle size={20} />
          </div>
          <div>
            <div className="admin-page__stat-label">Total FAQs</div>
            <div className="admin-page__stat-value">{faqs.length}</div>
          </div>
        </div>
        <div className="admin-page__stat">
          <div className="admin-page__stat-icon admin-page__stat-icon--slate">
            <Layers size={20} />
          </div>
          <div>
            <div className="admin-page__stat-label">Categories</div>
            <div className="admin-page__stat-value">{categoryCount}</div>
          </div>
        </div>
      </div>

      <div className="admin-page__card">
        <div className="admin-page__card-header">
          <h2 className="admin-page__card-title">All FAQs</h2>
          <span className="admin-page__card-count">
            {filteredFaqs.length} of {faqs.length} shown
          </span>
        </div>

        <div className="admin-page__toolbar">
          <div className="admin-page__search">
            <Search size={16} className="admin-page__search-icon" />
            <input
              type="text"
              className="admin-page__search-input"
              placeholder="Search by question, answer, or category…"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        {faqs.length === 0 ? (
          <div className="admin-page__empty">
            <div className="admin-page__empty-icon">
              <HelpCircle size={24} />
            </div>
            <h3 className="admin-page__empty-title">No FAQs yet</h3>
            <p className="admin-page__empty-text">
              Add frequently asked questions for your tour categories.
            </p>
            <Link to="/add-faqs" className="admin-btn admin-btn--primary">
              <Plus size={18} />
              Add FAQs
            </Link>
          </div>
        ) : (
          <TableContainer
            columns={columns}
            data={filteredFaqs}
            noDataComponent={
              <div className="admin-page__empty" style={{ minHeight: 160 }}>
                <p className="admin-page__empty-text" style={{ margin: 0 }}>
                  No FAQs match your search.
                </p>
              </div>
            }
          />
        )}
      </div>
    </div>
  );
}

export default ManageFAQ;

import React, { useEffect, useState, useMemo, useCallback } from "react";
import { Link } from "react-router-dom";
import axiosInstance from "../../utils/axiosInstnace";
import TableContainer from "../../common/TableContainer";
import {
  Plus,
  Search,
  MessageSquareQuote,
  Edit,
  Trash,
  Layers,
  User,
} from "lucide-react";
import "../../styles/admin-page.css";

function ManageTestimonials() {
  const [testimonials, setTestimonials] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    const fetchTestimonials = async () => {
      try {
        const response = await axiosInstance.get("/testimonials");
        setTestimonials(response.data || []);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchTestimonials();
  }, []);

  const handleDelete = useCallback(async (id) => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this testimonial?"
    );
    if (!confirmed) return;

    try {
      await axiosInstance.get(`/testimonials/${id}`);
      setTestimonials((prev) => prev.filter((item) => item._id !== id));
    } catch (err) {
      alert("Error deleting testimonial: " + err.message);
    }
  }, []);

  const filteredTestimonials = useMemo(() => {
    if (!searchTerm.trim()) return testimonials;
    const query = searchTerm.toLowerCase();
    return testimonials.filter(
      (item) =>
        item.title?.toLowerCase().includes(query) ||
        item.author?.toLowerCase().includes(query) ||
        item.description?.toLowerCase().includes(query) ||
        item.category?.slugURL?.toLowerCase().includes(query) ||
        item.category?.category?.toLowerCase().includes(query)
    );
  }, [testimonials, searchTerm]);

  const categoryCount = useMemo(() => {
    const ids = new Set(
      testimonials
        .map((item) => item.category?._id || item.category?.slugURL)
        .filter(Boolean)
    );
    return ids.size;
  }, [testimonials]);

  const columns = useMemo(
    () => [
      {
        name: "#",
        selector: (_row, index) => index + 1,
        sortable: false,
        width: "60px",
      },
      {
        name: "Show In",
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
        name: "Title",
        selector: (row) => row.title,
        sortable: true,
        grow: 2,
        cell: (row) => (
          <span style={{ fontWeight: 600, color: "#0f172a" }}>
            {row.title || "—"}
          </span>
        ),
      },
      {
        name: "Author",
        selector: (row) => row.author,
        sortable: true,
        grow: 1,
        cell: (row) => (
          <span style={{ fontSize: "0.8125rem", color: "#64748b" }}>
            {row.author || "—"}
          </span>
        ),
      },
      {
        name: "Actions",
        width: "120px",
        cell: (row) => (
          <div className="admin-action-group">
            <Link to={`/edit-testimonials/${row._id}`} title="Edit testimonial">
              <button type="button" className="admin-btn admin-btn--icon admin-btn--edit">
                <Edit size={15} />
              </button>
            </Link>
            <button
              type="button"
              className="admin-btn admin-btn--icon admin-btn--delete"
              onClick={() => handleDelete(row._id)}
              title="Delete testimonial"
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
        <div className="admin-page__loading">Loading testimonials…</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="admin-page">
        <div className="admin-page__error">Error loading testimonials: {error}</div>
      </div>
    );
  }

  return (
    <div className="admin-page">
      <div className="admin-page__header">
        <div>
          <h1 className="admin-page__title">Manage Testimonials</h1>
          <p className="admin-page__subtitle">
            Customer reviews and quotes shown on category pages.
          </p>
        </div>
        <Link to="/add-testimonials" className="admin-btn admin-btn--primary">
          <Plus size={18} />
          Add Testimonial
        </Link>
      </div>

      <div className="admin-page__stats">
        <div className="admin-page__stat">
          <div className="admin-page__stat-icon admin-page__stat-icon--amber">
            <MessageSquareQuote size={20} />
          </div>
          <div>
            <div className="admin-page__stat-label">Total Testimonials</div>
            <div className="admin-page__stat-value">{testimonials.length}</div>
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
        <div className="admin-page__stat">
          <div className="admin-page__stat-icon admin-page__stat-icon--green">
            <User size={20} />
          </div>
          <div>
            <div className="admin-page__stat-label">Unique Authors</div>
            <div className="admin-page__stat-value">
              {new Set(testimonials.map((t) => t.author).filter(Boolean)).size}
            </div>
          </div>
        </div>
      </div>

      <div className="admin-page__card">
        <div className="admin-page__card-header">
          <h2 className="admin-page__card-title">All Testimonials</h2>
          <span className="admin-page__card-count">
            {filteredTestimonials.length} of {testimonials.length} shown
          </span>
        </div>

        <div className="admin-page__toolbar">
          <div className="admin-page__search">
            <Search size={16} className="admin-page__search-icon" />
            <input
              type="text"
              className="admin-page__search-input"
              placeholder="Search by title, author, or category…"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        {testimonials.length === 0 ? (
          <div className="admin-page__empty">
            <div className="admin-page__empty-icon">
              <MessageSquareQuote size={24} />
            </div>
            <h3 className="admin-page__empty-title">No testimonials yet</h3>
            <p className="admin-page__empty-text">
              Add customer testimonials to display on tour category pages.
            </p>
            <Link to="/add-testimonials" className="admin-btn admin-btn--primary">
              <Plus size={18} />
              Add Testimonial
            </Link>
          </div>
        ) : (
          <TableContainer
            columns={columns}
            data={filteredTestimonials}
            noDataComponent={
              <div className="admin-page__empty" style={{ minHeight: 160 }}>
                <p className="admin-page__empty-text" style={{ margin: 0 }}>
                  No testimonials match your search.
                </p>
              </div>
            }
          />
        )}
      </div>
    </div>
  );
}

export default ManageTestimonials;

import React, { useEffect, useState, useMemo, useCallback } from "react";
import { Link, useParams } from "react-router-dom";
import axiosInstance from "../../utils/axiosInstnace";
import TableContainer from "../../common/TableContainer";
import { Plus, Search, HelpCircle, Edit, Trash, ArrowLeft } from "lucide-react";
import "../../styles/admin-page.css";

function ManageBlogFaq() {
  const { slug } = useParams();
  const [faqs, setFaqs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    if (!slug) return;
    const fetchFaqs = async () => {
      try {
        const response = await axiosInstance.get(`/blog-faqs/blog/${slug}`);
        setFaqs(response.data || []);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchFaqs();
  }, [slug]);

  const handleDelete = useCallback(async (id) => {
    const confirmed = window.confirm("Are you sure you want to delete this FAQ?");
    if (!confirmed) return;

    try {
      await axiosInstance.get(`/blog-faqs/delete/${id}`);
      setFaqs((prev) => prev.filter((f) => f._id !== id));
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
        faq.answer?.toLowerCase().includes(query)
    );
  }, [faqs, searchTerm]);

  const columns = useMemo(
    () => [
      {
        name: "#",
        selector: (_row, index) => index + 1,
        sortable: false,
        width: "70px",
      },
      {
        name: "Question",
        selector: (row) => row.question,
        sortable: true,
        grow: 1.5,
        cell: (row) => (
          <span style={{ fontWeight: 600, color: "#0f172a" }}>{row.question || "—"}</span>
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
            <Link to={`/edit-blog-faq/${slug}/${row._id}`} title="Edit FAQ">
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
    [handleDelete, slug]
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
          <h1 className="admin-page__title">Manage Blog FAQs</h1>
          <p className="admin-page__subtitle">
            FAQs for blog: <span className="admin-slug">{slug}</span>
          </p>
        </div>
        <div className="admin-page__actions">
          <Link to="/manage-blogs" className="admin-btn admin-btn--ghost">
            <ArrowLeft size={18} />
            Back to Blogs
          </Link>
          <Link to={`/add-blog-faq/${slug}`} className="admin-btn admin-btn--primary">
            <Plus size={18} />
            Add FAQ
          </Link>
        </div>
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
      </div>

      <div className="admin-page__card">
        <div className="admin-page__card-header">
          <h2 className="admin-page__card-title">Blog FAQs</h2>
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
              placeholder="Search questions or answers…"
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
              Add frequently asked questions for this blog post.
            </p>
            <Link to={`/add-blog-faq/${slug}`} className="admin-btn admin-btn--primary">
              <Plus size={18} />
              Add FAQ
            </Link>
          </div>
        ) : (
          <TableContainer columns={columns} data={filteredFaqs} />
        )}
      </div>
    </div>
  );
}

export default ManageBlogFaq;

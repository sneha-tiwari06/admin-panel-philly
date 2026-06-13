import React, { useEffect, useState, useMemo, useCallback } from "react";
import { Link, useParams } from "react-router-dom";
import axiosInstance from "../../utils/axiosInstnace";
import TableContainer from "../../common/TableContainer";
import { Plus, Search, Code, Edit, Trash, ArrowLeft } from "lucide-react";
import "../../styles/admin-page.css";

function ManageMeta() {
  const { slug } = useParams();
  const [meta, setMeta] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    if (!slug) return;
    const fetchMeta = async () => {
      try {
        const response = await axiosInstance.get(`/meta/blog/${slug}`);
        setMeta(response.data || []);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchMeta();
  }, [slug]);

  const handleDelete = useCallback(async (id) => {
    const confirmed = window.confirm("Are you sure you want to delete this meta?");
    if (!confirmed) return;

    try {
      await axiosInstance.get(`/meta/delete/${id}`);
      setMeta((prev) => prev.filter((m) => m._id !== id));
    } catch (err) {
      alert("Error deleting meta: " + err.message);
    }
  }, []);

  const filteredMeta = useMemo(() => {
    if (!searchTerm.trim()) return meta;
    const query = searchTerm.toLowerCase();
    return meta.filter(
      (item) =>
        item.metaName?.toLowerCase().includes(query) ||
        item.metaValue?.toLowerCase().includes(query)
    );
  }, [meta, searchTerm]);

  const columns = useMemo(
    () => [
      {
        name: "#",
        selector: (_row, index) => index + 1,
        sortable: false,
        width: "70px",
      },
      {
        name: "Meta / Schema Name",
        selector: (row) => row.metaName,
        sortable: true,
        grow: 1.5,
        cell: (row) => (
          <span style={{ fontWeight: 600, color: "#0f172a" }}>{row.metaName || "—"}</span>
        ),
      },
      {
        name: "Meta / Schema Value",
        selector: (row) => row.metaValue,
        sortable: true,
        grow: 2,
        cell: (row) => (
          <span
            style={{
              fontSize: "0.8125rem",
              color: "#64748b",
              display: "block",
              maxWidth: 400,
              overflow: "hidden",
              textOverflow: "ellipsis",
              whiteSpace: "nowrap",
            }}
            title={row.metaValue}
          >
            {row.metaValue || "—"}
          </span>
        ),
      },
      {
        name: "Actions",
        width: "120px",
        cell: (row) => (
          <div className="admin-action-group">
            <Link to={`/edit-meta/${slug}/${row._id}`} title="Edit meta">
              <button type="button" className="admin-btn admin-btn--icon admin-btn--edit">
                <Edit size={15} />
              </button>
            </Link>
            <button
              type="button"
              className="admin-btn admin-btn--icon admin-btn--delete"
              onClick={() => handleDelete(row._id)}
              title="Delete meta"
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
        <div className="admin-page__loading">Loading meta…</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="admin-page">
        <div className="admin-page__error">Error loading meta: {error}</div>
      </div>
    );
  }

  return (
    <div className="admin-page">
      <div className="admin-page__header">
        <div>
          <h1 className="admin-page__title">Manage Blog Meta</h1>
          <p className="admin-page__subtitle">
            Schema and meta entries for blog: <span className="admin-slug">{slug}</span>
          </p>
        </div>
        <div className="admin-page__actions">
          <Link to="/manage-blogs" className="admin-btn admin-btn--ghost">
            <ArrowLeft size={18} />
            Back to Blogs
          </Link>
          <Link to={`/add-meta/${slug}`} className="admin-btn admin-btn--primary">
            <Plus size={18} />
            Add Meta
          </Link>
        </div>
      </div>

      <div className="admin-page__stats">
        <div className="admin-page__stat">
          <div className="admin-page__stat-icon admin-page__stat-icon--amber">
            <Code size={20} />
          </div>
          <div>
            <div className="admin-page__stat-label">Total Meta Entries</div>
            <div className="admin-page__stat-value">{meta.length}</div>
          </div>
        </div>
      </div>

      <div className="admin-page__card">
        <div className="admin-page__card-header">
          <h2 className="admin-page__card-title">Meta & Schema</h2>
          <span className="admin-page__card-count">
            {filteredMeta.length} of {meta.length} shown
          </span>
        </div>

        <div className="admin-page__toolbar">
          <div className="admin-page__search">
            <Search size={16} className="admin-page__search-icon" />
            <input
              type="text"
              className="admin-page__search-input"
              placeholder="Search by name or value…"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        {meta.length === 0 ? (
          <div className="admin-page__empty">
            <div className="admin-page__empty-icon">
              <Code size={24} />
            </div>
            <h3 className="admin-page__empty-title">No meta entries yet</h3>
            <p className="admin-page__empty-text">
              Add structured meta or schema markup for this blog post.
            </p>
            <Link to={`/add-meta/${slug}`} className="admin-btn admin-btn--primary">
              <Plus size={18} />
              Add Meta
            </Link>
          </div>
        ) : (
          <TableContainer columns={columns} data={filteredMeta} />
        )}
      </div>
    </div>
  );
}

export default ManageMeta;

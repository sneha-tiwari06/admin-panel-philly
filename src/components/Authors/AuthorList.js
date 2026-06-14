import React, { useEffect, useState, useMemo, useCallback } from "react";
import { Link } from "react-router-dom";
import axiosInstance, { getAuthorPageUrl } from "../../utils/axiosInstnace";
import TableContainer from "../../common/TableContainer";
import { Plus, Search, User, Edit, Trash, ExternalLink } from "lucide-react";
import "../../styles/admin-page.css";

function ManageAuthors() {
  const [authors, setAuthors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    const fetchAuthors = async () => {
      try {
        const response = await axiosInstance.get("/authors");
        const data = response.data || [];
        const sorted = [...data].sort(
          (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
        );
        setAuthors(sorted);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchAuthors();
  }, []);

  const handleDelete = useCallback(async (id, name) => {
    const confirmed = window.confirm(
      `Are you sure you want to delete author "${name}"? Linked blogs will be unassigned.`
    );
    if (!confirmed) return;

    try {
      await axiosInstance.get(`/authors/delete/${id}`);
      setAuthors((prev) => prev.filter((author) => author._id !== id));
    } catch (err) {
      alert("Error deleting author: " + err.message);
    }
  }, []);

  const filteredAuthors = useMemo(() => {
    if (!searchTerm.trim()) return authors;
    const query = searchTerm.toLowerCase();
    return authors.filter(
      (author) =>
        author.name?.toLowerCase().includes(query) ||
        author.authorSlug?.toLowerCase().includes(query)
    );
  }, [authors, searchTerm]);

  const columns = useMemo(
    () => [
      {
        name: "#",
        selector: (_row, index) => index + 1,
        sortable: false,
        width: "60px",
      },
      {
        name: "Author",
        selector: (row) => row.name,
        sortable: true,
        grow: 2,
        cell: (row) => (
          <div className="admin-table__primary">
            <User size={16} />
            <span>{row.name}</span>
          </div>
        ),
      },
      {
        name: "Slug",
        selector: (row) => row.authorSlug,
        sortable: true,
        grow: 2,
      },
      {
        name: "Social Links",
        selector: (row) => row.socialLinks?.length || 0,
        sortable: true,
        width: "120px",
        cell: (row) => row.socialLinks?.length || 0,
      },
      {
        name: "Actions",
        cell: (row) => (
          <div className="admin-action-group">
            {row.authorSlug && (
              <a
                href={getAuthorPageUrl(row.authorSlug)}
                target="_blank"
                rel="noopener noreferrer"
                className="admin-btn admin-btn--ghost admin-btn--icon"
                title="View live page"
              >
                <ExternalLink size={16} />
              </a>
            )}
            <Link
              to={`/edit-author/${row.authorSlug}`}
              className="admin-btn admin-btn--ghost admin-btn--icon"
              title="Edit author"
            >
              <Edit size={16} />
            </Link>
            <button
              type="button"
              className="admin-btn admin-btn--ghost admin-btn--icon admin-btn--danger"
              title="Delete author"
              onClick={() => handleDelete(row._id, row.name)}
            >
              <Trash size={16} />
            </button>
          </div>
        ),
        ignoreRowClick: true,
        allowOverflow: true,
        button: true,
        width: "140px",
      },
    ],
    [handleDelete]
  );

  if (loading) {
    return (
      <div className="admin-page">
        <div className="admin-page__loading">Loading authors…</div>
      </div>
    );
  }

  return (
    <div className="admin-page">
      <div className="admin-page__header">
        <div>
          <h1 className="admin-page__title">Manage Authors</h1>
          <p className="admin-page__subtitle">
            Create and manage blog authors with profile images, bios, and social links.
          </p>
        </div>
        <Link to="/add-author" className="admin-btn admin-btn--primary">
          <Plus size={18} />
          Add Author
        </Link>
      </div>

      {error && <div className="admin-alert admin-alert--danger">Error: {error}</div>}

      <div className="admin-page__toolbar">
        <div className="admin-page__search">
        <Search size={16} className="admin-page__search-icon" />
          <input
            type="text"
            className="admin-page__search-input"            
            placeholder="Search by name or slug…"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <span className="admin-toolbar__count">{filteredAuthors.length} authors</span>
      </div>

      <TableContainer columns={columns} data={filteredAuthors} pagination />
    </div>
  );
}

export default ManageAuthors;

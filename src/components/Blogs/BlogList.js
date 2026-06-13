import React, { useEffect, useState, useMemo, useCallback } from "react";
import { Link } from "react-router-dom";
import axiosInstance, { getBlogPageUrl } from "../../utils/axiosInstnace";
import TableContainer from "../../common/TableContainer";
import {
  Plus,
  Search,
  FileText,
  Edit,
  Trash,
  HelpCircle,
  Code,
  ExternalLink,
  Home,
} from "lucide-react";
import "../../styles/admin-page.css";

function ManageBlogs() {
  const [blogs, setBlogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    const fetchBlogs = async () => {
      try {
        const response = await axiosInstance.get("/blogs");
        const data = response.data || [];
        const sorted = [...data].sort(
          (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
        );
        setBlogs(sorted);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchBlogs();
  }, []);

  const handleDelete = useCallback(async (id) => {
    const confirmed = window.confirm("Are you sure you want to delete this blog?");
    if (!confirmed) return;

    try {
      await axiosInstance.get(`/blogs/delete/${id}`);
      setBlogs((prev) => prev.filter((blog) => blog._id !== id));
    } catch (err) {
      alert("Error deleting blog: " + err.message);
    }
  }, []);

  const filteredBlogs = useMemo(() => {
    if (!searchTerm.trim()) return blogs;
    const query = searchTerm.toLowerCase();
    return blogs.filter(
      (blog) =>
        blog.blogName?.toLowerCase().includes(query) ||
        blog.blogLink?.toLowerCase().includes(query)
    );
  }, [blogs, searchTerm]);

  const homepageCount = useMemo(
    () => blogs.filter((b) => b.showOnHomepage).length,
    [blogs]
  );

  const columns = useMemo(
    () => [
      {
        name: "#",
        selector: (_row, index) => index + 1,
        sortable: false,
        width: "60px",
      },
      {
        name: "Blog",
        selector: (row) => row.blogName,
        sortable: true,
        grow: 2,
        cell: (row) => (
          <div className="admin-category-name">
            
            <div>
              <div style={{ fontWeight: 600, color: "#0f172a" }}>{row.blogName || "—"}</div>
              
            </div>
          </div>
        ),
      },
      {
        name: "Slug",
        selector: (row) => row.blogLink,
        sortable: true,
        grow: 1.5,
        cell: (row) =>
          row.blogLink ? (
            <a
              href={getBlogPageUrl(row.blogLink)}
              target="_blank"
              rel="noopener noreferrer"
              className="admin-slug admin-slug--link"
            >
              {row.blogLink}
              <ExternalLink size={12} style={{ marginLeft: 4, verticalAlign: "middle" }} />
            </a>
          ) : (
            "—"
          ),
      },
      {
        name: "Meta",
        width: "90px",
        cell: (row) => (
          <Link
            to={`/manage-meta/${row.blogLink}`}
            className="admin-btn admin-btn--secondary"
            style={{ padding: "6px 10px", fontSize: "0.75rem" }}
            title="Manage meta"
          >
            <Code size={13} />
          </Link>
        ),
        ignoreRowClick: true,
        allowOverflow: true,
        button: true,
      },
      {
        name: "FAQ",
        width: "90px",
        cell: (row) => (
          <Link
            to={`/manage-blog-faq/${row.blogLink}`}
            className="admin-btn admin-btn--secondary"
            style={{ padding: "6px 10px", fontSize: "0.75rem" }}
            title="Manage FAQs"
          >
            <HelpCircle size={13} />
          </Link>
        ),
        ignoreRowClick: true,
        allowOverflow: true,
        button: true,
      },
      {
        name: "Created",
        selector: (row) => row.createdAt,
        sortable: true,
        width: "110px",
        cell: (row) =>
          row.createdAt
            ? new Date(row.createdAt).toLocaleDateString(undefined, {
                month: "short",
                day: "numeric",
                year: "numeric",
              })
            : "—",
      },
      {
        name: "Actions",
        width: "120px",
        cell: (row) => (
          <div className="admin-action-group">
            <Link to={`/edit-blog/${row.blogLink}`} title="Edit blog">
              <button type="button" className="admin-btn admin-btn--icon admin-btn--edit">
                <Edit size={15} />
              </button>
            </Link>
            <button
              type="button"
              className="admin-btn admin-btn--icon admin-btn--delete"
              onClick={() => handleDelete(row._id)}
              title="Delete blog"
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
        <div className="admin-page__loading">Loading blogs…</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="admin-page">
        <div className="admin-page__error">Error loading blogs: {error}</div>
      </div>
    );
  }

  return (
    <div className="admin-page">
      <div className="admin-page__header">
        <div>
          <h1 className="admin-page__title">Manage Blogs</h1>
          <p className="admin-page__subtitle">
            Create blog posts, manage SEO meta, and FAQs for each article.
          </p>
        </div>
        <Link to="/add-blogs" className="admin-btn admin-btn--primary">
          <Plus size={18} />
          Add Blog
        </Link>
      </div>

      <div className="admin-page__stats">
        <div className="admin-page__stat">
          <div className="admin-page__stat-icon admin-page__stat-icon--amber">
            <FileText size={20} />
          </div>
          <div>
            <div className="admin-page__stat-label">Total Blogs</div>
            <div className="admin-page__stat-value">{blogs.length}</div>
          </div>
        </div>
        <div className="admin-page__stat">
          <div className="admin-page__stat-icon admin-page__stat-icon--green">
            <Home size={20} />
          </div>
          <div>
            <div className="admin-page__stat-label">On Homepage</div>
            <div className="admin-page__stat-value">{homepageCount}</div>
          </div>
        </div>
      </div>

      <div className="admin-page__card">
        <div className="admin-page__card-header">
          <h2 className="admin-page__card-title">All Blogs</h2>
          <span className="admin-page__card-count">
            {filteredBlogs.length} of {blogs.length} shown
          </span>
        </div>

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
        </div>

        {blogs.length === 0 ? (
          <div className="admin-page__empty">
            <div className="admin-page__empty-icon">
              <FileText size={24} />
            </div>
            <h3 className="admin-page__empty-title">No blogs yet</h3>
            <p className="admin-page__empty-text">
              Publish your first blog post to share updates and stories.
            </p>
            <Link to="/add-blogs" className="admin-btn admin-btn--primary">
              <Plus size={18} />
              Add Blog
            </Link>
          </div>
        ) : (
          <TableContainer
            columns={columns}
            data={filteredBlogs}
            noDataComponent={
              <div className="admin-page__empty" style={{ minHeight: 160 }}>
                <p className="admin-page__empty-text" style={{ margin: 0 }}>
                  No blogs match your search.
                </p>
              </div>
            }
          />
        )}
      </div>
    </div>
  );
}

export default ManageBlogs;

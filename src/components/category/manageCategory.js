import React, { useEffect, useState, useMemo, useCallback } from "react";
import { Link } from "react-router-dom";
import axiosInstance from "../../utils/axiosInstnace";
import TableContainer from "../../common/TableContainer";
import { Switch } from "@mui/material";
import { Edit, Trash, Plus, Search, Layers, CheckCircle2, XCircle, FolderOpen } from "lucide-react";
import "../../styles/admin-page.css";

function ManageCategory() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await axiosInstance.get("/categories");
        setCategories(response.data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchCategories();
  }, []);

  const handleDelete = useCallback(async (id) => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this category?"
    );
    if (confirmed) {
      try {
        await axiosInstance.get(`/categories/delete/${id}`);
        setCategories((prev) => prev.filter((category) => category._id !== id));
      } catch (err) {
        alert("Error deleting category: " + err.message);
      }
    }
  }, []);

  const handleToggleActive = useCallback(async (id, currentActive) => {
    try {
      const formData = new FormData();
      formData.append("active", !currentActive);
      await axiosInstance.put(`/categories/${id}`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      setCategories((prev) =>
        prev.map((cat) =>
          cat._id === id ? { ...cat, active: !currentActive } : cat
        )
      );
    } catch (err) {
      alert("Error updating active status: " + err.message);
    }
  }, []);

  const filteredCategories = useMemo(() => {
    if (!searchTerm.trim()) return categories;
    const query = searchTerm.toLowerCase();
    return categories.filter(
      (cat) =>
        cat.category?.toLowerCase().includes(query) ||
        cat.slugURL?.toLowerCase().includes(query)
    );
  }, [categories, searchTerm]);

  const activeCount = useMemo(
    () => categories.filter((cat) => cat.active).length,
    [categories]
  );

  const inactiveCount = categories.length - activeCount;

  const columns = useMemo(
    () => [
      {
        name: "#",
        selector: (row, index) => index + 1,
        sortable: false,
        width: "70px",
      },
      {
        name: "Category",
        selector: (row) => row.category,
        sortable: true,
        grow: 2,
        cell: (row) => (
          <div className="admin-category-name">
            <span className="admin-category-avatar">
              {(row.category || "?").charAt(0).toUpperCase()}
            </span>
            {row.category}
          </div>
        ),
      },
      {
        name: "Slug URL",
        selector: (row) => row.slugURL,
        sortable: true,
        grow: 2,
        cell: (row) => <span className="admin-slug">{row.slugURL || "—"}</span>,
      },
      {
        name: "Status",
        selector: (row) => row.active,
        sortable: true,
        width: "130px",
        cell: (row) => (
          <span
            className={`admin-badge ${row.active ? "admin-badge--active" : "admin-badge--inactive"}`}
          >
            {row.active ? "Active" : "Inactive"}
          </span>
        ),
      },
      {
        name: "Toggle",
        width: "100px",
        cell: (row) => (
          <Switch
            className="admin-toggle"
            checked={!!row.active}
            onChange={() => handleToggleActive(row._id, row.active)}
            color="warning"
            inputProps={{ "aria-label": "toggle active status" }}
          />
        ),
        ignoreRowClick: true,
        allowOverflow: true,
        button: true,
      },
      {
        name: "Actions",
        width: "120px",
        cell: (row) => (
          <div className="admin-action-group">
            <Link to={`/edit-category/${row._id}`} title="Edit category">
              <button type="button" className="admin-btn admin-btn--icon admin-btn--edit">
                <Edit size={15} />
              </button>
            </Link>
            <button
              type="button"
              className="admin-btn admin-btn--icon admin-btn--delete"
              onClick={() => handleDelete(row._id)}
              title="Delete category"
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
    [handleDelete, handleToggleActive]
  );

  if (loading) {
    return (
      <div className="admin-page">
        <div className="admin-page__loading">Loading categories…</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="admin-page">
        <div className="admin-page__error">Error loading categories: {error}</div>
      </div>
    );
  }

  return (
    <div className="admin-page">
      <div className="admin-page__header">
        <div>
          <h1 className="admin-page__title">Manage Categories</h1>
          <p className="admin-page__subtitle">
            Organize tour categories, manage slugs, and control visibility.
          </p>
        </div>
        <Link to="/add-category" className="admin-btn admin-btn--primary">
          <Plus size={18} />
          Add Category
        </Link>
      </div>

      <div className="admin-page__stats">
        <div className="admin-page__stat">
          <div className="admin-page__stat-icon admin-page__stat-icon--amber">
            <Layers size={20} />
          </div>
          <div>
            <div className="admin-page__stat-label">Total Categories</div>
            <div className="admin-page__stat-value">{categories.length}</div>
          </div>
        </div>
        <div className="admin-page__stat">
          <div className="admin-page__stat-icon admin-page__stat-icon--green">
            <CheckCircle2 size={20} />
          </div>
          <div>
            <div className="admin-page__stat-label">Active</div>
            <div className="admin-page__stat-value">{activeCount}</div>
          </div>
        </div>
        <div className="admin-page__stat">
          <div className="admin-page__stat-icon admin-page__stat-icon--slate">
            <XCircle size={20} />
          </div>
          <div>
            <div className="admin-page__stat-label">Inactive</div>
            <div className="admin-page__stat-value">{inactiveCount}</div>
          </div>
        </div>
      </div>

      <div className="admin-page__card">
        <div className="admin-page__card-header">
          <h2 className="admin-page__card-title">All Categories</h2>
          <span className="admin-page__card-count">
            {filteredCategories.length} of {categories.length} shown
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

        {categories.length === 0 ? (
          <div className="admin-page__empty">
            <div className="admin-page__empty-icon">
              <FolderOpen size={24} />
            </div>
            <h3 className="admin-page__empty-title">No categories yet</h3>
            <p className="admin-page__empty-text">
              Create your first category to organize tours on the platform.
            </p>
            <Link to="/add-category" className="admin-btn admin-btn--primary">
              <Plus size={18} />
              Add Category
            </Link>
          </div>
        ) : (
          <TableContainer
            columns={columns}
            data={filteredCategories}
            noDataComponent={
              <div className="admin-page__empty" style={{ minHeight: 160 }}>
                <p className="admin-page__empty-text" style={{ margin: 0 }}>
                  No categories match your search.
                </p>
              </div>
            }
          />
        )}
      </div>
    </div>
  );
}

export default ManageCategory;

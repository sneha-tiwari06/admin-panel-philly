import React, { useEffect, useState, useMemo, useCallback } from "react";
import { Link } from "react-router-dom";
import axiosInstance from "../../utils/axiosInstnace";
import TableContainer from "../../common/TableContainer";
import { Switch } from "@mui/material";
import {
  Plus,
  Search,
  Calendar,
  CheckCircle2,
  XCircle,
  Edit,
  Trash,
  CalendarOff,
} from "lucide-react";
import "../../styles/admin-page.css";

function formatBlockDate(dateStr) {
  if (!dateStr) return "—";
  const date = new Date(dateStr);
  return date.toLocaleDateString(undefined, {
    weekday: "short",
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

function ManageBlockDate() {
  const [blockDates, setBlockDates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    const fetchBlockDates = async () => {
      try {
        const response = await axiosInstance.get("/block-date");
        const data = response.data || [];
        const sorted = [...data].sort(
          (a, b) => new Date(b.blockDate) - new Date(a.blockDate)
        );
        setBlockDates(sorted);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchBlockDates();
  }, []);

  const handleDelete = useCallback(async (id) => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this blocked date?"
    );
    if (!confirmed) return;

    try {
      await axiosInstance.get(`/block-date/delete/${id}`);
      setBlockDates((prev) => prev.filter((item) => item._id !== id));
    } catch (err) {
      alert("Error deleting block date: " + err.message);
    }
  }, []);

  const handleToggleStatus = useCallback(async (id, currentStatus) => {
    try {
      await axiosInstance.post(`/block-date/toggle-status/${id}`, {
        isActive: !currentStatus,
      });
      setBlockDates((prev) =>
        prev.map((item) =>
          item._id === id ? { ...item, isActive: !currentStatus } : item
        )
      );
    } catch (err) {
      alert("Error updating status: " + (err.message || "Unknown error"));
    }
  }, []);

  const filteredBlockDates = useMemo(() => {
    if (!searchTerm.trim()) return blockDates;
    const query = searchTerm.toLowerCase();
    return blockDates.filter((item) => {
      const formatted = formatBlockDate(item.blockDate).toLowerCase();
      const raw = item.blockDate?.slice(0, 10) || "";
      return formatted.includes(query) || raw.includes(query);
    });
  }, [blockDates, searchTerm]);

  const activeCount = useMemo(
    () => blockDates.filter((item) => item.isActive).length,
    [blockDates]
  );

  const columns = useMemo(
    () => [
      {
        name: "#",
        selector: (_row, index) => index + 1,
        sortable: false,
        width: "70px",
      },
      {
        name: "Blocked Date",
        selector: (row) => row.blockDate,
        sortable: true,
        grow: 2,
        cell: (row) => (
          <div className="admin-category-name">
            <span className="admin-category-avatar">
              <Calendar size={16} />
            </span>
            <div>
              <div>{formatBlockDate(row.blockDate)}</div>
              <div style={{ fontSize: "0.75rem", color: "#94a3b8", marginTop: 2 }}>
                {row.blockDate?.slice(0, 10) || "—"}
              </div>
            </div>
          </div>
        ),
      },
      {
        name: "Status",
        selector: (row) => row.isActive,
        sortable: true,
        width: "130px",
        cell: (row) => (
          <span
            className={`admin-badge ${
              row.isActive ? "admin-badge--active" : "admin-badge--inactive"
            }`}
          >
            {row.isActive ? "Active" : "Inactive"}
          </span>
        ),
      },
      {
        name: "Toggle",
        width: "100px",
        cell: (row) => (
          <Switch
            className="admin-toggle"
            checked={!!row.isActive}
            onChange={() => handleToggleStatus(row._id, row.isActive)}
            color="warning"
            inputProps={{ "aria-label": "toggle block date status" }}
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
            <Link to={`/edit-block-date/${row._id}`} title="Edit block date">
              <button type="button" className="admin-btn admin-btn--icon admin-btn--edit">
                <Edit size={15} />
              </button>
            </Link>
            <button
              type="button"
              className="admin-btn admin-btn--icon admin-btn--delete"
              onClick={() => handleDelete(row._id)}
              title="Delete block date"
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
    [handleDelete, handleToggleStatus]
  );

  if (loading) {
    return (
      <div className="admin-page">
        <div className="admin-page__loading">Loading blocked dates…</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="admin-page">
        <div className="admin-page__error">Error loading blocked dates: {error}</div>
      </div>
    );
  }

  return (
    <div className="admin-page">
      <div className="admin-page__header">
        <div>
          <h1 className="admin-page__title">Block Whole Day</h1>
          <p className="admin-page__subtitle">
            Block entire days from tour bookings when tours are unavailable.
          </p>
        </div>
        <Link to="/add-block-date" className="admin-btn admin-btn--primary">
          <Plus size={18} />
          Add Blocked Day
        </Link>
      </div>

      <div className="admin-page__stats">
        <div className="admin-page__stat">
          <div className="admin-page__stat-icon admin-page__stat-icon--amber">
            <CalendarOff size={20} />
          </div>
          <div>
            <div className="admin-page__stat-label">Total Blocked Days</div>
            <div className="admin-page__stat-value">{blockDates.length}</div>
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
            <div className="admin-page__stat-value">{blockDates.length - activeCount}</div>
          </div>
        </div>
      </div>

      <div className="admin-page__card">
        <div className="admin-page__card-header">
          <h2 className="admin-page__card-title">Blocked Dates</h2>
          <span className="admin-page__card-count">
            {filteredBlockDates.length} of {blockDates.length} shown
          </span>
        </div>

        <div className="admin-page__toolbar">
          <div className="admin-page__search">
            <Search size={16} className="admin-page__search-icon" />
            <input
              type="text"
              className="admin-page__search-input"
              placeholder="Search by date…"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        {blockDates.length === 0 ? (
          <div className="admin-page__empty">
            <div className="admin-page__empty-icon">
              <CalendarOff size={24} />
            </div>
            <h3 className="admin-page__empty-title">No blocked dates yet</h3>
            <p className="admin-page__empty-text">
              Add dates when tours should not accept any bookings for the full day.
            </p>
            <Link to="/add-block-date" className="admin-btn admin-btn--primary">
              <Plus size={18} />
              Add Blocked Day
            </Link>
          </div>
        ) : (
          <TableContainer
            columns={columns}
            data={filteredBlockDates}
            noDataComponent={
              <div className="admin-page__empty" style={{ minHeight: 160 }}>
                <p className="admin-page__empty-text" style={{ margin: 0 }}>
                  No blocked dates match your search.
                </p>
              </div>
            }
          />
        )}
      </div>
    </div>
  );
}

export default ManageBlockDate;

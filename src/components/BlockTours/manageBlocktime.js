import React, { useEffect, useState, useMemo, useCallback } from "react";
import { Link } from "react-router-dom";
import axiosInstance from "../../utils/axiosInstnace";
import TableContainer from "../../common/TableContainer";
import { Switch } from "@mui/material";
import {
  Plus,
  Search,
  Calendar,
  Clock,
  CheckCircle2,
  XCircle,
  Edit,
  Trash,
  TimerOff,
} from "lucide-react";
import "../../styles/admin-page.css";

function formatBlockDate(dateStr) {
  if (!dateStr) return "—";
  return new Date(dateStr).toLocaleDateString(undefined, {
    weekday: "short",
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

function ManageBlockTime() {
  const [blockTimes, setBlockTimes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    const fetchBlockTimes = async () => {
      try {
        const response = await axiosInstance.get("/block-time");
        const data = response.data || [];
        const sorted = [...data].sort(
          (a, b) => new Date(b.blockDate) - new Date(a.blockDate)
        );
        setBlockTimes(sorted);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchBlockTimes();
  }, []);

  const handleDelete = useCallback(async (id) => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this blocked time slot?"
    );
    if (!confirmed) return;

    try {
      await axiosInstance.get(`/block-time/delete/${id}`);
      setBlockTimes((prev) => prev.filter((item) => item._id !== id));
    } catch (err) {
      alert("Error deleting block time: " + err.message);
    }
  }, []);

  const handleToggleStatus = useCallback(async (id, currentStatus) => {
    try {
      await axiosInstance.post(`/block-time/toggle-status/${id}`, {
        isActive: !currentStatus,
      });
      setBlockTimes((prev) =>
        prev.map((item) =>
          item._id === id ? { ...item, isActive: !currentStatus } : item
        )
      );
    } catch (err) {
      alert("Error updating status: " + (err.message || "Unknown error"));
    }
  }, []);

  const filteredBlockTimes = useMemo(() => {
    if (!searchTerm.trim()) return blockTimes;
    const query = searchTerm.toLowerCase();
    return blockTimes.filter((item) => {
      const formatted = formatBlockDate(item.blockDate).toLowerCase();
      const raw = item.blockDate?.slice(0, 10) || "";
      const time = item.blockTime?.toLowerCase() || "";
      return formatted.includes(query) || raw.includes(query) || time.includes(query);
    });
  }, [blockTimes, searchTerm]);

  const activeCount = useMemo(
    () => blockTimes.filter((item) => item.isActive).length,
    [blockTimes]
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
        name: "Date",
        selector: (row) => row.blockDate,
        sortable: true,
        grow: 1.5,
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
        name: "Time Slot",
        selector: (row) => row.blockTime,
        sortable: true,
        width: "140px",
        cell: (row) => (
          <span className="admin-slug">
            <Clock size={12} style={{ verticalAlign: "middle", marginRight: 4 }} />
            {row.blockTime || "—"}
          </span>
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
            inputProps={{ "aria-label": "toggle block time status" }}
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
            <Link to={`/edit-block-time/${row._id}`} title="Edit block time">
              <button type="button" className="admin-btn admin-btn--icon admin-btn--edit">
                <Edit size={15} />
              </button>
            </Link>
            <button
              type="button"
              className="admin-btn admin-btn--icon admin-btn--delete"
              onClick={() => handleDelete(row._id)}
              title="Delete block time"
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
        <div className="admin-page__loading">Loading blocked time slots…</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="admin-page">
        <div className="admin-page__error">Error loading blocked times: {error}</div>
      </div>
    );
  }

  return (
    <div className="admin-page">
      <div className="admin-page__header">
        <div>
          <h1 className="admin-page__title">Block Specific Time</h1>
          <p className="admin-page__subtitle">
            Block individual time slots on specific dates from tour bookings.
          </p>
        </div>
        <Link to="/add-block-time" className="admin-btn admin-btn--primary">
          <Plus size={18} />
          Add Blocked Time
        </Link>
      </div>

      <div className="admin-page__stats">
        <div className="admin-page__stat">
          <div className="admin-page__stat-icon admin-page__stat-icon--amber">
            <TimerOff size={20} />
          </div>
          <div>
            <div className="admin-page__stat-label">Total Blocked Slots</div>
            <div className="admin-page__stat-value">{blockTimes.length}</div>
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
            <div className="admin-page__stat-value">{blockTimes.length - activeCount}</div>
          </div>
        </div>
      </div>

      <div className="admin-page__card">
        <div className="admin-page__card-header">
          <h2 className="admin-page__card-title">Blocked Time Slots</h2>
          <span className="admin-page__card-count">
            {filteredBlockTimes.length} of {blockTimes.length} shown
          </span>
        </div>

        <div className="admin-page__toolbar">
          <div className="admin-page__search">
            <Search size={16} className="admin-page__search-icon" />
            <input
              type="text"
              className="admin-page__search-input"
              placeholder="Search by date or time slot…"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        {blockTimes.length === 0 ? (
          <div className="admin-page__empty">
            <div className="admin-page__empty-icon">
              <TimerOff size={24} />
            </div>
            <h3 className="admin-page__empty-title">No blocked time slots yet</h3>
            <p className="admin-page__empty-text">
              Add specific date and time combinations when bookings should be unavailable.
            </p>
            <Link to="/add-block-time" className="admin-btn admin-btn--primary">
              <Plus size={18} />
              Add Blocked Time
            </Link>
          </div>
        ) : (
          <TableContainer
            columns={columns}
            data={filteredBlockTimes}
            noDataComponent={
              <div className="admin-page__empty" style={{ minHeight: 160 }}>
                <p className="admin-page__empty-text" style={{ margin: 0 }}>
                  No blocked time slots match your search.
                </p>
              </div>
            }
          />
        )}
      </div>
    </div>
  );
}

export default ManageBlockTime;

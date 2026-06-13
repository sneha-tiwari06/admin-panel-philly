import { useEffect, useState, useMemo, useCallback } from "react";
import { Link } from "react-router-dom";
import axiosInstance from "../../utils/axiosInstnace";
import TableContainer from "../../common/TableContainer";
import {
  Plus,
  Search,
  Users,
  Shield,
  UserCog,
  Edit,
  Trash,
} from "lucide-react";
import "../../styles/admin-page.css";

function getRoleBadgeClass(role) {
  if (role === "admin") return "admin-badge--active";
  return "admin-badge--inactive";
}

function formatRole(role) {
  if (role === "admin") return "Admin";
  if (role === "subadmin") return "Sub Admin";
  return role || "—";
}

function ManageUsers() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const response = await axiosInstance.get("/users/all-users");
        setUsers(response.data || []);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchUsers();
  }, []);

  const handleDelete = useCallback(async (id) => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this user?"
    );
    if (!confirmed) return;

    try {
      await axiosInstance.get(`/users/delete/${id}`);
      setUsers((prev) => prev.filter((user) => user._id !== id));
    } catch (err) {
      alert("Error deleting user: " + err.message);
    }
  }, []);

  const filteredUsers = useMemo(() => {
    if (!searchTerm.trim()) return users;
    const query = searchTerm.toLowerCase();
    return users.filter(
      (user) =>
        user.username?.toLowerCase().includes(query) ||
        user.email?.toLowerCase().includes(query) ||
        user.role?.toLowerCase().includes(query)
    );
  }, [users, searchTerm]);

  const adminCount = useMemo(
    () => users.filter((user) => user.role === "admin").length,
    [users]
  );

  const subadminCount = useMemo(
    () => users.filter((user) => user.role === "subadmin").length,
    [users]
  );

  const columns = useMemo(
    () => [
      {
        name: "#",
        cell: (_row, index) => index + 1,
        sortable: false,
        width: "60px",
      },
      {
        name: "User",
        selector: (row) => row.username,
        sortable: true,
        grow: 2,
        cell: (row) => (
          <div className="admin-category-name">
            <span className="admin-category-avatar">
              {(row.username || "?").charAt(0).toUpperCase()}
            </span>
            <div>
              <div style={{ fontWeight: 600, color: "#0f172a" }}>
                {row.username || "—"}
              </div>
              {row.email && (
                <div style={{ fontSize: "0.75rem", color: "#64748b", marginTop: 2 }}>
                  {row.email}
                </div>
              )}
            </div>
          </div>
        ),
      },
      {
        name: "Role",
        selector: (row) => row.role,
        sortable: true,
        width: "140px",
        cell: (row) => (
          <span className={`admin-badge ${getRoleBadgeClass(row.role)}`}>
            {formatRole(row.role)}
          </span>
        ),
      },
      {
        name: "Actions",
        width: "120px",
        cell: (row) => (
          <div className="admin-action-group">
            <Link to={`/edit-user/${row._id}`} title="Edit user">
              <button type="button" className="admin-btn admin-btn--icon admin-btn--edit">
                <Edit size={15} />
              </button>
            </Link>
            <button
              type="button"
              className="admin-btn admin-btn--icon admin-btn--delete"
              onClick={() => handleDelete(row._id)}
              title="Delete user"
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
        <div className="admin-page__loading">Loading users…</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="admin-page">
        <div className="admin-page__error">Error loading users: {error}</div>
      </div>
    );
  }

  return (
    <div className="admin-page">
      <div className="admin-page__header">
        <div>
          <h1 className="admin-page__title">Manage Users</h1>
          <p className="admin-page__subtitle">
            Admin and sub-admin accounts with access to the panel.
          </p>
        </div>
        <Link to="/add-users" className="admin-btn admin-btn--primary">
          <Plus size={18} />
          Add User
        </Link>
      </div>

      <div className="admin-page__stats">
        <div className="admin-page__stat">
          <div className="admin-page__stat-icon admin-page__stat-icon--amber">
            <Users size={20} />
          </div>
          <div>
            <div className="admin-page__stat-label">Total Users</div>
            <div className="admin-page__stat-value">{users.length}</div>
          </div>
        </div>
        <div className="admin-page__stat">
          <div className="admin-page__stat-icon admin-page__stat-icon--green">
            <Shield size={20} />
          </div>
          <div>
            <div className="admin-page__stat-label">Admins</div>
            <div className="admin-page__stat-value">{adminCount}</div>
          </div>
        </div>
        <div className="admin-page__stat">
          <div className="admin-page__stat-icon admin-page__stat-icon--slate">
            <UserCog size={20} />
          </div>
          <div>
            <div className="admin-page__stat-label">Sub Admins</div>
            <div className="admin-page__stat-value">{subadminCount}</div>
          </div>
        </div>
      </div>

      <div className="admin-page__card">
        <div className="admin-page__card-header">
          <h2 className="admin-page__card-title">All Users</h2>
          <span className="admin-page__card-count">
            {filteredUsers.length} of {users.length} shown
          </span>
        </div>

        <div className="admin-page__toolbar">
          <div className="admin-page__search">
            <Search size={16} className="admin-page__search-icon" />
            <input
              type="text"
              className="admin-page__search-input"
              placeholder="Search by username, email, or role…"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        {users.length === 0 ? (
          <div className="admin-page__empty">
            <div className="admin-page__empty-icon">
              <Users size={24} />
            </div>
            <h3 className="admin-page__empty-title">No users yet</h3>
            <p className="admin-page__empty-text">
              Create admin or sub-admin accounts to manage the platform.
            </p>
            <Link to="/add-users" className="admin-btn admin-btn--primary">
              <Plus size={18} />
              Add User
            </Link>
          </div>
        ) : (
          <TableContainer
            columns={columns}
            data={filteredUsers}
            noDataComponent={
              <div className="admin-page__empty" style={{ minHeight: 160 }}>
                <p className="admin-page__empty-text" style={{ margin: 0 }}>
                  No users match your search.
                </p>
              </div>
            }
          />
        )}
      </div>
    </div>
  );
}

export default ManageUsers;

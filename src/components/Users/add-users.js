import { useState, useEffect } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import axiosInstance from "../../utils/axiosInstnace";
import {
  ArrowLeft,
  Save,
  User,
  Mail,
  Shield,
  Lock,
} from "lucide-react";
import "../../styles/admin-page.css";

const AddUsers = () => {
  const { id } = useParams();
  const isEdit = Boolean(id);
  const navigate = useNavigate();

  const [username, setUserName] = useState("");
  const [email, setEmail] = useState("");
  const [role, setRole] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(isEdit);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!id) return;

    setLoading(true);
    axiosInstance
      .get(`/users/${id}`)
      .then((response) => {
        const data = response.data;
        setUserName(data.username || "");
        setEmail(data.email || "");
        setRole(data.role || "");
        setPassword("");
        setConfirmPassword("");
      })
      .catch((err) => console.error("Error fetching user details:", err))
      .finally(() => setLoading(false));
  }, [id]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (submitting) return;

    if (!username || !email || !role) {
      alert("Please fill in username, email, and role.");
      return;
    }

    if (!isEdit && (!password || !confirmPassword)) {
      alert("Password and confirm password are required for new users.");
      return;
    }

    if (password && password !== confirmPassword) {
      alert("Password and confirm password do not match.");
      return;
    }

    setSubmitting(true);

    try {
      const data = {
        username,
        email,
        role,
        password,
        confirmPassword,
      };

      if (id) {
        await axiosInstance.post(`/users/update/${id}`, data);
      } else {
        await axiosInstance.post("/users/register", data);
      }

      navigate("/manage-users");
    } catch (err) {
      console.error("Error submitting user:", err);
      alert(
        "Failed to save user: " +
          (err.response?.data?.message || err.message || "Please try again.")
      );
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="admin-page">
        <div className="admin-page__loading">Loading user details…</div>
      </div>
    );
  }

  return (
    <div className="admin-page">
      <div className="admin-page__header">
        <div>
          <h1 className="admin-page__title">{isEdit ? "Edit User" : "Add User"}</h1>
          <p className="admin-page__subtitle">
            {isEdit
              ? "Update account details and role. Leave password blank to keep the current one."
              : "Create a new admin or sub-admin account for the panel."}
          </p>
        </div>
        <Link to="/manage-users" className="admin-btn admin-btn--ghost">
          <ArrowLeft size={18} />
          Back to Users
        </Link>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="admin-form-stack">
          <div className="admin-form-card">
            <div className="admin-form-section">
              <h2 className="admin-form-section__title">
                <User size={16} style={{ verticalAlign: "middle", marginRight: 6 }} />
                Account Information
              </h2>
              <div className="admin-form-grid">
                <div className="admin-form-group">
                  <label className="admin-form-label" htmlFor="username">
                    Username <span>*</span>
                  </label>
                  <input
                    id="username"
                    type="text"
                    className="admin-form-input"
                    value={username}
                    onChange={(e) => setUserName(e.target.value)}
                    placeholder="e.g. jane_admin"
                    required
                  />
                </div>
                <div className="admin-form-group">
                  <label className="admin-form-label" htmlFor="email">
                    <Mail size={14} style={{ verticalAlign: "middle", marginRight: 4 }} />
                    Email <span>*</span>
                  </label>
                  <input
                    id="email"
                    type="email"
                    className="admin-form-input"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="user@example.com"
                    required
                  />
                </div>
                <div className="admin-form-group">
                  <label className="admin-form-label" htmlFor="role">
                    <Shield size={14} style={{ verticalAlign: "middle", marginRight: 4 }} />
                    Role <span>*</span>
                  </label>
                  <select
                    id="role"
                    className="admin-form-select"
                    value={role}
                    onChange={(e) => setRole(e.target.value)}
                    required
                  >
                    <option value="">Select role</option>
                    <option value="admin">Admin</option>
                    <option value="subadmin">Sub Admin</option>
                  </select>
                  <p className="admin-form-hint">
                    Admins have full access; sub-admins have limited permissions.
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="admin-form-card">
            <div className="admin-form-section">
              <h2 className="admin-form-section__title">
                <Lock size={16} style={{ verticalAlign: "middle", marginRight: 6 }} />
                Password
              </h2>
              <div className="admin-form-grid">
                <div className="admin-form-group">
                  <label className="admin-form-label" htmlFor="password">
                    Password {!isEdit && <span>*</span>}
                  </label>
                  <input
                    id="password"
                    type="password"
                    className="admin-form-input"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder={isEdit ? "Leave blank to keep current" : "Enter password"}
                    required={!isEdit}
                    autoComplete={isEdit ? "new-password" : "new-password"}
                  />
                  {isEdit && (
                    <p className="admin-form-hint">Leave blank to keep the current password.</p>
                  )}
                </div>
                <div className="admin-form-group">
                  <label className="admin-form-label" htmlFor="confirmPassword">
                    Confirm Password {!isEdit && <span>*</span>}
                  </label>
                  <input
                    id="confirmPassword"
                    type="password"
                    className="admin-form-input"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Re-enter password"
                    required={!isEdit}
                    autoComplete="new-password"
                  />
                </div>
              </div>
            </div>

            <div className="admin-form-footer admin-form-footer--split">
              <span className="admin-form-footer__note">
                Fields marked with <span style={{ color: "#ef4444" }}>*</span> are required.
              </span>
              <div className="admin-page__actions">
                <Link to="/manage-users" className="admin-btn admin-btn--secondary">
                  Cancel
                </Link>
                <button
                  type="submit"
                  className="admin-btn admin-btn--primary"
                  disabled={submitting}
                >
                  <Save size={18} />
                  {submitting ? "Saving…" : isEdit ? "Update User" : "Create User"}
                </button>
              </div>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
};

export default AddUsers;

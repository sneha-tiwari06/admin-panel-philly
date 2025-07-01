import { useState, useEffect } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import axiosInstance from "../../utils/axiosInstnace";

const AddUsers = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [users, setUsers] = useState("");
  const [username, setUserName] = useState("");
  const [email, setEmail] = useState("");
  const [role, setRole] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  useEffect(() => {
    axiosInstance
      .get("/users/all-users")
      .then((res) => {
        setUsers(res.data);
      })
      .catch((err) => console.error("Error fetching users:", err));

    if (id) {
      axiosInstance
        .get(`/users/${id}`)
        .then((response) => {
          const data = response.data;
          setUserName(data.username || "");
          setEmail(data.email || "");
          setRole(data.role || "");
          setPassword(""); // Do NOT prefill password
          setConfirmPassword("");
        })
        .catch((err) => console.error("Error fetching user details:", err));
    }
  }, [id]);
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!username || !email || !role ) {
      alert("Please fill all the fields!");
      return;
    }

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
    }
  };

  return (
    <div className="bg-light">
      <div className="container-lg">
        <div className="py-5 px-4 bg-white mvh-100">
          <div className="d-flex justify-content-between align-items-center mb-3">
            <h2>{id ? "Edit User" : "Add User"}</h2>
            <Link to="/manage-users">
              <button className="btn btn-primary">Back</button>
            </Link>
          </div>

          <form onSubmit={handleSubmit}>
            <div className="row gx-3 gy-4">
              <div className="col-md-6">
                <label>User Name</label>
                <input
                  type="text"
                  className="form-control"
                  value={username}
                  onChange={(e) => setUserName(e.target.value)}
                  required
                />
              </div>

              <div className="col-md-6">
                <label>Email</label>
                <input
                  type="email"
                  className="form-control"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>

              <div className="col-md-6">
                <label>Password</label>
                <input
                  type="password"
                  className="form-control"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                 
                />
                <small className="text-muted">Leave blank to keep current password.</small>

              </div>

              <div className="col-md-6">
                <label>Confirm Password</label>
                <input
                  type="password"
                  className="form-control"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
               
                />
              </div>

              <div className="col-md-6">
                <label>Role</label>
                <select
                  className="form-control"
                  value={role}
                  onChange={(e) => setRole(e.target.value)}
                  required
                >
                  <option value="">Select Role</option>
                  <option value="admin">Admin</option>
                  <option value="subadmin">Sub Admin</option>
                </select>
              </div>
            </div>

            <button type="submit" className="btn btn-primary mt-4">
              {id ? "Update User" : "Create User"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default AddUsers;

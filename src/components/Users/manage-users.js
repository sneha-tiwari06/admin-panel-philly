import { useEffect, useState, useMemo } from "react";
import { Link } from "react-router-dom";
import axiosInstance from "../../utils/axiosInstnace";
import TableContainer from "../../common/TableContainer";

function ManageUsers() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const response = await axiosInstance.get("/users/all-users");
        setUsers(response.data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchUsers();
  }, []);

  const handleDelete = async (id) => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this User?"
    );
    if (confirmed) {
      try {
        await axiosInstance.get(`/users/delete/${id}`);
        setUsers(users.filter((user) => user._id !== id));
      } catch (err) {
        alert("Error deleting user: " + err.message);
      }
    }
  };

  const columns = useMemo(
    () => [
      {
        name: "Index",
        cell: (row, index) => index + 1,
        width: "80px",
        sortable: false,
      },
      {
        name: "User",
        selector: (row) => row.username,
        sortable: true,
      },
      {
        name: "Role",
        selector: (row) => row.role,
        sortable: true,
      },
      {
        name: "Action",
        cell: (row) => (
          <div className="d-flex gap-2">
            <Link to={`/edit-user/${row._id}`}>
              <button type="button" className="btn btn-warning btn-sm">
                Edit
              </button>
            </Link>
            <button
              type="button"
              className="btn btn-danger btn-sm"
              onClick={() => handleDelete(row._id)}
            >
              Delete
            </button>
          </div>
        ),
        ignoreRowClick: true,
        allowOverflow: true,
        button: true,
        width: "180px",
      },
    ],
    [users]
  );


  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div className="w-100 overview">
      <div className="section-heading">
        <h2>Manage Users</h2>
      </div>
      <div className="action-btn d-flex justify-content-between mb-3">
        <Link to="/add-users">
          <button className="btn btn-success w-auto">Add User</button>
        </Link>
      </div>
      <TableContainer columns={columns} data={users} />
    </div>
  );
}

export default ManageUsers;

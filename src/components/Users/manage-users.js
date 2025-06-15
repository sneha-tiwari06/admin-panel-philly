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
    const confirmed = window.confirm("Are you sure you want to delete this User?");
    if (confirmed) {
      try {
        await axiosInstance.delete(`/users/delete/${id}`);
        setUsers(users.filter((user) => user._id !== id));
      } catch (err) {
        alert("Error deleting user: " + err.message);
      }
    }
  };

  const columns = useMemo(
    () => [
      {
        Header: "Index",
        accessor: "index",
        Cell: ({ row }) => row.index + 1,
      },
      {
        Header: "User",
        accessor: "username",
      },
      {
        Header: "Role",
        accessor: "role",
      },
      {
        Header: "Action",
        Cell: ({ row }) => (
          <div className="action-btn2">
            <Link to={`/edit-user/${row.original._id}`}>
              <button type="button" className="w-auto btn btn-warning">Edit</button>
            </Link>           
            <button
              type="button"
              className="w-auto btn btn-danger"
              onClick={() => handleDelete(row.original._id)}
            >
              Delete
            </button>
          </div>
        ),
      },
    ],
    [users]
  );

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div className="w-100 overview">
      <div className="section-heading">
        <h2>Manage Tours</h2>
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

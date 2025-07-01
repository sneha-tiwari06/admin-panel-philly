import React, { useEffect, useState, useMemo } from "react";
import { Link } from "react-router-dom";
import axiosInstance from "../../utils/axiosInstnace";
import TableContainer from "../../common/TableContainer";

function ManageBlockDate() {
  const [blockDate, setBlockDate] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await axiosInstance.get("/block-date");
        setBlockDate(response.data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchCategories();
  }, []);

  const handleDelete = async (id) => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this date?"
    );
    if (confirmed) {
      try {
        await axiosInstance.get(`/block-date/delete/${id}`);
        setBlockDate((prev) => prev.filter((date) => date._id !== id));
      } catch (err) {
        alert("Error deleting block date: " + err.message);
      }
    }
  };

  const handleToggleStatus = async (id, currentStatus) => {
    try {
      await axiosInstance.post(`/block-date/toggle-status/${id}`, {
        isActive: !currentStatus,
      });

      // update local state
      setBlockDate((prev) =>
        prev.map((item) =>
          item._id === id ? { ...item, isActive: !currentStatus } : item
        )
      );
    } catch (err) {
      console.error("Error toggling status", err);
    }
  };

  const columns = useMemo(
    () => [
      {
        name: "Index",
        selector: (row, index) => index + 1,
        sortable: false,
      },
      {
        name: "Date",
        selector: (row) => row.blockDate,
        cell: (row) => row.blockDate?.slice(0, 10) || "-",
      },
      {
        name: "Status",
        selector: (row) => row.isActive,
        cell: (row) => (
          <div className="form-check form-switch">
            <input
              className="form-check-input"
              type="checkbox"
              checked={row.isActive}
              onChange={() => handleToggleStatus(row._id, row.isActive)}
            />
          </div>
        ),
      },
      {
        name: "Action",
        cell: (row) => (
          <div className="action-btn2">
            <Link to={`/edit-block-time/${row._id}`}>
              <button type="button" className="w-auto btn btn-warning">
                Edit
              </button>
            </Link>
            <button
              type="button"
              className="w-auto btn btn-danger"
              onClick={() => handleDelete(row._id)}
            >
              Delete
            </button>
          </div>
        ),
      },
    ],
    [blockDate]
  );


  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div className="w-100 overview">
      <div className="section-heading">
        <h2>Manage Block Date</h2>
      </div>
      <div className="action-btn d-flex justify-content-between mb-3">
        <Link to="/add-block-date">
          <button className="btn btn-success w-auto">Add Day</button>
        </Link>
      </div>
      <TableContainer columns={columns} data={blockDate} />
    </div>
  );
}

export default ManageBlockDate;

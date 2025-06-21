import React, { useEffect, useState, useMemo } from "react";
import { Link } from "react-router-dom";
import axiosInstance from "../../utils/axiosInstnace";
import TableContainer from "../../common/TableContainer";

function ManageTours() {
  const [tours, setTours] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchTours = async () => {
      try {
        const response = await axiosInstance.get("/tours");
        setTours(response.data.data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchTours();
  }, []);

  const handleDelete = async (id) => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this Tour?"
    );
    if (confirmed) {
      try {
        await axiosInstance.get(`/tours/${id}`);
        setTours(tours.filter((tour) => tour._id !== id));
      } catch (err) {
        alert("Error deleting tour: " + err.message);
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
        Header: "Category",
        accessor: "selectedCategory.category", // optional but not required here
        Cell: ({ row }) => row.original.selectedCategory?.category || "N/A",
      },

      {
        Header: "Category URL",
        accessor: "slugURL",
      },
      {
        Header: "Action",
        Cell: ({ row }) => (
          <div className="action-btn2">
            <Link to={`/edit-tour/${row.original._id}`}>
              <button type="button" className="w-auto btn btn-warning">
                Edit
              </button>
            </Link>
            <Link to={`/manage-gallery/${row.original._id}`}>
              <button type="button" className="w-auto btn btn-warning">
                Gallery
              </button>
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
    [tours]
  );

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div className="w-100 overview">
      <div className="section-heading">
        <h2>Manage Tours</h2>
      </div>
      <div className="action-btn d-flex justify-content-between mb-3">
        <Link to="/add-tours">
          <button className="btn btn-success w-auto">Add Tour</button>
        </Link>
      </div>
      <TableContainer columns={columns} data={tours} />
    </div>
  );
}

export default ManageTours;

import React, { useEffect, useState, useMemo } from "react";
import { Link } from "react-router-dom";
import axiosInstance from "../../utils/axiosInstnace";
import TableContainer from "../../common/TableContainer";

function ManageTestimonials() {
  const [testimonial, setTestimonials] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchTestimonials = async () => {
      try {
        const response = await axiosInstance.get("/testimonials");
        setTestimonials(response.data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchTestimonials();
  }, []);

  const handleDelete = async (id) => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this Testimonials?"
    );
    if (confirmed) {
      try {
        await axiosInstance.get(`/testimonials/${id}`);
        setTestimonials(
          testimonial.filter((testimonial) => testimonial._id !== id)
        );
      } catch (err) {
        alert("Error deleting tour: " + err.message);
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
        name: "Show In",
        selector: (row) => row.category?.slugURL || "N/A",
        sortable: true,
        wrap: true,
      },
      {
        name: "Title",
        selector: (row) => row.title,
        sortable: true,
        wrap: true,
      },
      {
        name: "Action",
        cell: (row) => (
          <div className="d-flex gap-2">
            <Link to={`/edit-testimonials/${row._id}`}>
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
        width: "200px",
      },
    ],
    [testimonial]
  );


  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div className="w-100 overview">
      <div className="section-heading">
        <h2>Manage Testimonials</h2>
      </div>
      <div className="action-btn d-flex justify-content-between mb-3">
        <Link to="/add-testimonials">
          <button className="btn btn-success w-auto">Add Testimonials</button>
        </Link>
      </div>
      <TableContainer columns={columns} data={testimonial} />
    </div>
  );
}

export default ManageTestimonials;

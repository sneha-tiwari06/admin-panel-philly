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
    const confirmed = window.confirm("Are you sure you want to delete this Testimonials?");
    if (confirmed) {
      try {
        await axiosInstance.delete(`/testimonials/${id}`);
        setTestimonials(testimonial.filter((testimonial) => testimonial._id !== id));
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
        Header: "Show In",
        accessor: "category.slugURL", // optional but not required here
        Cell: ({ row }) => row.original.category?.slugURL || "N/A"
      },
      
      {
        Header: "Title",
        accessor: "title",
      },
      {
        Header: "Action",
        Cell: ({ row }) => (
          <div className="action-btn2">
            <Link to={`/edit-testimonials/${row.original._id}`}>
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

import React, { useEffect, useState, useMemo } from "react";
import { Link } from "react-router-dom";
import axiosInstance from "../../utils/axiosInstnace";
import TableContainer from "../../common/TableContainer";

function ManageBlogs() {
  const [blogs, setBlogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await axiosInstance.get("/blogs");
        setBlogs(response.data);
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
      "Are you sure you want to delete this category?"
    );
    if (confirmed) {
      try {
        await axiosInstance.get(`/blogs/delete/${id}`);
        setBlogs(blogs.filter((blog) => blog._id !== id));
      } catch (err) {
        alert("Error deleting blog: " + err.message);
      }
    }
  };

  const columns = useMemo(
  () => [
    {
      name: "Index",
      selector: (row, index) => index + 1,
      sortable: false,
       width: "80px",
    },
    {
      name: "Blog Name",
      selector: (row) => row.blogName,
      sortable: true,
    },
    {
      name: "Blog Link",
      selector: (row) => row.blogLink,
      sortable: true,
    },
    {
      name: "Action",
       width: "300px",
      cell: (row) => (
        <div className="d-flex gap-2">
          <Link to={`/edit-blog/${row.blogLink}`}>
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
    },
  ],
  [blogs]
);


  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div className="w-100 overview">
      <div className="section-heading">
        <h2>Manage Blogs</h2>
      </div>
      <div className="action-btn d-flex justify-content-between mb-3">
        <Link to="/add-blogs">
          <button className="btn btn-success w-auto">Add Blog</button>
        </Link>
      </div>
      <TableContainer columns={columns} data={blogs} />
    </div>
  );
}

export default ManageBlogs;

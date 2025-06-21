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
        await axiosInstance.get(`/blogs/${id}`);
        setBlogs(blogs.filter((blog) => blog._id !== id));
      } catch (err) {
        alert("Error deleting blog: " + err.message);
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
        Header: "Blog Name",
        accessor: "blogName",
      },
      {
        Header: "Blog Link",
        accessor: "blogLink",
      },
      {
        Header: "Action",
        Cell: ({ row }) => (
          <div className="action-btn2">
            <Link to={`/edit-blog/${row.original.blogLink}`}>
              <button type="button" className="w-auto btn btn-warning">
                Edit
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
    [blogs]
  );

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div className="w-100 overview">
      <div className="section-heading">
        <h2>Manage Category</h2>
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

import React, { useEffect, useState, useMemo } from "react";
import { Link } from "react-router-dom";
import axiosInstance from "../../utils/axiosInstnace";
import TableContainer from "../../common/TableContainer";

function ManageCategory() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await axiosInstance.get("/categories");
        setCategories(response.data);
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
        await axiosInstance.get(`/categories/delete/${id}`);
        setCategories(categories.filter((category) => category._id !== id));
      } catch (err) {
        alert("Error deleting category: " + err.message);
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
        accessor: "category",
      },
      {
        Header: "Category URL",
        accessor: "slugURL",
      },
      {
        Header: "Action",
        Cell: ({ row }) => (
          <div className="action-btn2">
            <Link to={`/edit-category/${row.original._id}`}>
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
    [categories]
  );

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div className="w-100 overview">
      <div className="section-heading">
        <h2>Manage Category</h2>
      </div>
      <div className="action-btn d-flex justify-content-between mb-3">
        <Link to="/add-category">
          <button className="btn btn-success w-auto">Add Category</button>
        </Link>
      </div>
      <TableContainer columns={columns} data={categories} />
    </div>
  );
}

export default ManageCategory;

import React, { useEffect, useState, useMemo } from "react";
import { Link } from "react-router-dom";
import axiosInstance from "../../utils/axiosInstnace";
import TableContainer from "../../common/TableContainer";
import { Switch } from "@mui/material";

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
  const handleToggleActive = async (id, currentActive) => {
    try {
      // Send only the 'active' field to backend
      const formData = new FormData();
      formData.append("active", !currentActive);
      await axiosInstance.put(`/categories/${id}`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      setCategories((prev) =>
        prev.map((cat) =>
          cat._id === id ? { ...cat, active: !currentActive } : cat
        )
      );
    } catch (err) {
      alert("Error updating active status: " + err.message);
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
        name: "Category",
        selector: (row) => row.category,
        sortable: true,
      },
      {
        name: "Category URL",
        selector: (row) => row.slugURL,
        sortable: true,
      },
      {
        name: "Active",
        cell: (row) => (
          <Switch
            checked={!!row.active}
            onChange={() => handleToggleActive(row._id, row.active)}
            color="primary"
            inputProps={{ "aria-label": "toggle active status" }}
          />
        ),
        ignoreRowClick: true,
        allowOverflow: true,
        button: true,
      },
      {
        name: "Action",
        
        width: "300px",
        cell: (row) => (
          <div className="d-flex gap-2">
            <Link to={`/edit-category/${row._id}`}>
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

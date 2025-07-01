import React, { useEffect, useState, useMemo } from "react";
import { Link } from "react-router-dom";
import axiosInstance from "../../utils/axiosInstnace";
import TableContainer from "../../common/TableContainer";
import { Switch } from "@mui/material";

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
        await axiosInstance.get(`/tours/delete/${id}`);
        setTours(tours.filter((tour) => tour._id !== id));
      } catch (err) {
        alert("Error deleting tour: " + err.message);
      }
    }
  };
  // const handleToggleActive = async (id, currentActive) => {
  //   try {
  //     await axiosInstance.put(`/tours/${id}`, { active: !currentActive });
  //     setTours((prevTours) =>
  //       prevTours.map((tour) =>
  //         tour._id === id ? { ...tour, active: !currentActive } : tour
  //       )
  //     );
  //   } catch (err) {
  //     alert("Error updating active status: " + err.message);
  //   }
  // };
const columns = useMemo(
  () => [
    {
      name: "Index",
      cell: (row, index) => index + 1,
      sortable: false,
      width: "80px", // Prevent excessive column width
    },
    {
      name: "Category",
      selector: (row) => row.selectedCategory?.category || "N/A",
      sortable: true,
    },
    {
      name: "Category URL",
      selector: (row) => row.slugURL,
      sortable: true,
    },
    // Uncomment this if needed later
    // {
    //   name: "Active",
    //   cell: (row) => (
    //     <Switch
    //       checked={!!row.active}
    //       onChange={() => handleToggleActive(row._id, row.active)}
    //       color="primary"
    //       inputProps={{ "aria-label": "toggle active status" }}
    //     />
    //   ),
    //   ignoreRowClick: true,
    //   allowOverflow: true,
    //   button: true,
    // },
    {
      name: "Action",
        width: "300px",
      cell: (row) => (
        <div className="d-flex gap-2">
          <Link to={`/edit-tour/${row._id}`}>
            <button type="button" className="btn btn-warning btn-sm">
              Edit
            </button>
          </Link>
          <Link to={`/manage-gallery/${row._id}`}>
            <button type="button" className="btn btn-info btn-sm">
              Gallery
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

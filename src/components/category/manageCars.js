import React, { useEffect, useState, useMemo } from "react";
import { Link } from "react-router-dom";
import axiosInstance from "../../utils/axiosInstnace";
import TableContainer from "../../common/TableContainer";

function ManageCategory() {
  const [cars, setCars] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchCars = async () => {
      try {
        const response = await axiosInstance.get("/cars/get-cars");
        setCars(response.data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchCars();
  }, []);

  const handleDelete = async (id) => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this category?"
    );
    if (confirmed) {
      try {
        await axiosInstance.get(`/cars/delete/${id}`);
        setCars(cars.filter((car) => car._id !== id));
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
        Header: "Car Name",
        accessor: "carName",
      },
      {
        Header: "Total Cars",
        accessor: "noOfCars",
      },
      {
        Header: "Total Seats",
        accessor: "noOfSeats",
      },
      {
        Header: "Action",
        Cell: ({ row }) => (
          <ul className="list-inline d-flex" style={{ gap: "20px" }}>
            <li>
              <Link to={`/edit-car/${row.original._id}`}>
                <button type="button" className="w-auto btn btn-primary">
                  <i className="fa-solid fa-pen-to-square"></i>
                </button>
              </Link>
            </li>
            <li>
              <button
                type="button"
                className="w-auto btn btn-danger"
                onClick={() => handleDelete(row.original._id)}
              >
                <i className="fa-solid fa-trash"></i>
              </button>
            </li>
          </ul>
        ),
      },
    ],
    [cars]
  );

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div className="w-100 overview">
      <div className="section-heading">
        <h2>Manage Cars</h2>
      </div>
      <div className="action-btn d-flex justify-content-between mb-3">
        <Link to="/add-cars">
          <button className="btn btn-success w-auto">Add Post</button>
        </Link>
      </div>
      <TableContainer columns={columns} data={cars} />
    </div>
  );
}

export default ManageCategory;

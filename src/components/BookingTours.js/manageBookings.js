import React, { useEffect, useState, useMemo } from "react";
import axiosInstance from "../../utils/axiosInstnace";
import TableContainer from "../../common/TableContainer";

function ManageBookings() {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchBookings = async () => {
      try {
        const response = await axiosInstance.get("/complete-booking/bookings-tour");
        setBookings(response.data.bookings); // ✅ corrected from `data.data`
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchBookings();
  }, []);

  const columns = useMemo(
    () => [
      {
        Header: "Index",
        accessor: "index",
        Cell: ({ row }) => row.index + 1,
      },
      {
        Header: "Tour Name",
        accessor: "tour_name",
      },
      {
        Header: "Adults",
        accessor: "adults",
      },
      {
        Header: "Kids",
        accessor: "kids",
      },
      {
        Header: "Cars",
        accessor: "number_of_cars",
      },
      {
        Header: "Booking Date",
        accessor: "createdAt",
        Cell: ({ value }) => value ? value.slice(0, 10) : "-",
      },
    ],
    []
  );

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div className="w-100 overview">
      <div className="section-heading">
        <h2>Manage Bookings</h2>
      </div>

      <TableContainer columns={columns} data={bookings} />
    </div>
  );
}

export default ManageBookings;

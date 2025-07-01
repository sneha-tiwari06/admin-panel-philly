import React, { useEffect, useState, useMemo } from "react";
import axiosInstance from "../../utils/axiosInstnace";
import TableContainer from "../../common/TableContainer";

function ManageBookings() {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedBooking, setSelectedBooking] = useState(null);

  // Delete handler
  const handleDelete = async (bookingId) => {
    if (!window.confirm("Are you sure you want to delete this booking?")) return;
    try {
      await axiosInstance.delete(`/complete-booking/bookings/${bookingId}`);
      setBookings((prev) => prev.filter((b) => b._id !== bookingId));
    } catch (err) {
      alert("Failed to delete booking: " + (err.response?.data?.message || err.message));
    }
  };

  useEffect(() => {
    const fetchBookings = async () => {
      try {
        const response = await axiosInstance.get(
          "/complete-booking/bookings-tour"
        );
        setBookings(response.data.bookings);
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
        name: "Index",
        selector: (row, index) => index + 1,
        sortable: false,
        width: "70px",
      },
      {
        name: "Tour Type",
        selector: (row) => row.tour_name,
        sortable: true,
      },
      {
        name: "Name",
        selector: (row) =>
          row.guestId
            ? `${row.guestId.firstname || "Guest"} ${row.guestId.lastname || ""}`.trim()
            : "",
        sortable: true,
      },
      {
        name: "Email",
        selector: (row) =>
          row.guestId
            ? `${row.guestId.uemail || "Email Not Provided"}`.trim()
            : "",
        sortable: true,
      },
      {
        name: "Members",
        selector: (row) => row.kids + row.adults,
        sortable: true,
      },
      {
        name: "Cars",
        selector: (row) => row.number_of_cars,
        sortable: true,
      },
      {
        name: "Booking Date",
        selector: (row) =>
          row.bookingDate
            ? `${new Date(row.bookingDate).toLocaleDateString(undefined, {
                weekday: "short",
                year: "numeric",
                month: "long",
                day: "numeric",
              })} - ${row.bookingTime || ""}`
            : "",
        sortable: true,
      },
      {
        name: "Created At",
        selector: (row) => (row.createdAt ? row.createdAt.slice(0, 10) : "-"),
        sortable: true,
      },
      {
        name: "Actions",
        cell: (row) => (
          <div className="d-flex gap-2">
            <button
              className="btn btn-sm btn-primary"
              data-bs-toggle="modal"
              data-bs-target="#bookingDetailModal"
              onClick={() => setSelectedBooking(row)}
            >
              View Details
            </button>
            {/* <button
              className="btn btn-sm btn-danger"
              onClick={() => handleDelete(row._id)}
            >
              Delete
            </button> */}
          </div>
        ),
        ignoreRowClick: true,
        allowOverflow: true,
        button: true,
      },
    ],
    []
  );

  const renderDetails = () => {
    if (!selectedBooking) return null;
    const guest = selectedBooking?.guestId || {};
    const payment = selectedBooking?.paymentId || {};

    return (
      <table className="table table-bordered table-striped">
        <tbody>
          <tr>
            <th>Tour Name</th>
            <td>{selectedBooking.tour_name}</td>
          </tr>
          <tr>
            <th>Adults</th>
            <td>{selectedBooking.adults}</td>
          </tr>
          <tr>
            <th>Kids</th>
            <td>{selectedBooking.kids}</td>
          </tr>
          <tr>
            <th>Cars</th>
            <td>{selectedBooking.number_of_cars}</td>
          </tr>
          <tr>
            <th>Order Status</th>
            <td>{selectedBooking.order_status ? "Confirmed" : "Pending"}</td>
          </tr>
          <tr>
            <th>Booking Date</th>
           <td>
              {selectedBooking.bookingDate
                ? `${new Date(selectedBooking.bookingDate).toLocaleDateString(
                    undefined,
                    {
                      weekday: "short", 
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    }
                  )} - ${selectedBooking.bookingTime || ""}`
                : ""}
            </td></tr>
          {/* ✅ Guest Info */}
          <tr>
            <th>Guest Name</th>
            <td>
              {guest.firstname} {guest.lastname}
            </td>
          </tr>
          <tr>
            <th>Guest Email</th>
            <td>{guest.uemail}</td>
          </tr>
          <tr>
            <th>Guest Mobile</th>
            <td>{guest.mobile}</td>
          </tr>

          {/* ✅ Payment Info */}
          <tr>
            <th>Payment Status</th>
            <td>{payment.payment_status ? "Paid" : "Unpaid"}</td>
          </tr>
          <tr>
            <th>Total Price</th>
            <td>${payment.total_price}</td>
          </tr>
          <tr>
            <th>Sub Total</th>
            <td>${payment.sub_total}</td>
          </tr>
          <tr>
            <th>Discount</th>
            <td>{selectedBooking.discount}</td>
          </tr>
          <tr>
            <th>Payment Method</th>
            <td>{payment.payment_method}</td>
          </tr>
          <tr>
            <th>Card Detail</th>
            <td>**** **** **** {payment.card_detail}</td>
          </tr>
          <tr>
            <th>Transaction ID</th>
            <td>{payment.transactionId}</td>
          </tr>
        </tbody>
      </table>
    );
  };

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div className="container-fluid">
      <div className="section-heading mb-3">
        <h2>Manage Bookings</h2>
      </div>

      <TableContainer columns={columns} data={bookings} />

      {/* Bootstrap Modal */}
      <div
        className="modal fade"
        id="bookingDetailModal"
        tabIndex="-1"
        aria-labelledby="bookingDetailModalLabel"
        aria-hidden="true"
      >
        <div className="modal-dialog modal-lg modal-dialog-centered">
          <div className="modal-content">
            <div className="modal-header">
              <h5 className="modal-title" id="bookingDetailModalLabel">
                Booking Details
              </h5>
              <button
                type="button"
                className="btn-close"
                data-bs-dismiss="modal"
                aria-label="Close"
              />
            </div>
            <div className="modal-body">{renderDetails()}</div>
            <div className="modal-footer">
              <button
                type="button"
                className="btn btn-secondary"
                data-bs-dismiss="modal"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ManageBookings;

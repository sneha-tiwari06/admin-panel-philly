import { useEffect } from "react";
import { useState } from "react";
import { Card, Button, ProgressBar, Badge, Row, Col } from "react-bootstrap";
import axiosInstance from "../utils/axiosInstnace";
import { Link } from "react-router-dom";

function Dashboard() {
  const [totalEvents, setTotalEvents] = useState(0);
  const [contactQueries, setContactQueries] = useState(0);
  const [totalBookings, setTotalBookings] = useState(0);
  const [recentBookings, setRecentBookings] = useState([]);

  useEffect(() => {
    const fetchTotalEvents = async () => {
      try {
        const response = await axiosInstance.get("/events/count");
        setTotalEvents(response.data.count);
      } catch (error) {
        console.error("Error fetching total events:", error);
      }
    };

    fetchTotalEvents();
  }, []);
  useEffect(() => {
    const TotalContactQueries = async () => {
      try {
        const response = await axiosInstance.get("/contact/count");
        setContactQueries(response.data.count);
      } catch (error) {
        console.error("Error fetching total contact queries:", error);
      }
    };

    TotalContactQueries();
  }, []);
  useEffect(() => {
    const fetchTotalBookings = async () => {
      try {
        const response = await axiosInstance.get(
          "/complete-booking/bookings-tour/count"
        );
        setTotalBookings(response.data.count);
      } catch (error) {
        console.error("Error fetching total bookings:", error);
      }
    };
    fetchTotalBookings();
  }, []);
  useEffect(() => {
    const fetchRecentBookings = async () => {
      try {
        const response = await axiosInstance.get(
          "/complete-booking/bookings-tour"
        );
        const bookings = response.data.bookings || response.data;
        const sortedBookings = bookings
          .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
          .slice(0, 10);
        setRecentBookings(sortedBookings);
      } catch (err) {
        console.error("Error fetching recent bookings:", err);
      }
    };

    fetchRecentBookings();
  }, []);
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [showModal, setShowModal] = useState(false);

  const handleRowClick = (booking) => {
    setSelectedBooking(booking);
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setSelectedBooking(null);
  };
  const renderDetails = () => {
    if (!selectedBooking) return null;
    const guest = selectedBooking?.guestId || {};
    const payment = selectedBooking?.paymentId || {};

    return (
      <table className="table table-bordered table-striped">
        <tbody>
          <tr>
            <th>Order ID</th>
            <td>{selectedBooking.customOrderId || selectedBooking._id}</td>
          </tr>
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
          <tr>
            <th>Created AT</th>
            <td>{payment.createdAt.slice(0, 10)}</td>
          </tr>
        </tbody>
      </table>
    );
  };
  return (
    <>
      <div className="p-4">
        <h1 className="heading">Welcome Admin</h1>
        <Row className="mb-4">
          <Col md={4}>
            <Link to="/manage-bookings" style={{ textDecoration: 'none' }}>
              <Card className="text-center p-3">
                <h2 className="heading-cards">Tour Booked</h2>
                <h4>{totalBookings}</h4>
              </Card>
            </Link>

          </Col>
          <Col md={4}>
            <Link to="/manage-contact-queries" style={{ textDecoration: 'none' }}>
              <Card className="text-center p-3">
                <h2 className="heading-cards">Contact Query</h2>
                <h4>{contactQueries}</h4>
              </Card>
            </Link>

          </Col>
          <Col md={4}>
            <Link to="/manage-events" style={{ textDecoration: 'none' }}>
              <Card className="text-center p-3">
                <h2 className="heading-cards">Event Added</h2>
                <h4>{totalEvents}</h4>
              </Card>
            </Link>

          </Col>
        </Row>

        {/* Rating & Users */}
        <Row>
          <Col md={12}>
            <Card className="p-3">
              <h5>Recent Bookings</h5>
              <div className="table-responsive">
                <table className="table table-bordered align-middle mb-0">
                  <thead>
                    <tr>
                      <th>#</th>
                      <th>Tour Name</th>
                      <th>Name</th>
                      <th>Members</th>
                      <th>Cars</th>
                      <th>Booking Date</th>
                    </tr>
                  </thead>
                  <tbody>
                    {recentBookings.map((booking, i) => (
                      <tr
                        key={booking._id || i}
                        onClick={() => handleRowClick(booking)}
                        style={{
                          cursor: "pointer",
                          transition: "background-color 0.2s ease"
                        }}
                        onMouseEnter={(e) => e.currentTarget.style.backgroundColor = "#f8f9fa"}
                        onMouseLeave={(e) => e.currentTarget.style.backgroundColor = ""}
                      >
                        <td >{i + 1}</td>
                        <td >{booking.tour_name}</td>
                        <td >
                          {booking.guestId
                            ? `${booking.guestId.firstname || "Guest"} ${booking.guestId.lastname || ""
                              }`.trim()
                            : ""}
                        </td>
                        <td>{(booking.adults || 0) + (booking.kids || 0)}</td>

                        <td >{booking.number_of_cars}</td>
                        <td >
                          {booking.bookingDate
                            ? `${new Date(booking.bookingDate).toLocaleDateString(
                              undefined,
                              {
                                weekday: "short",
                                year: "numeric",
                                month: "long",
                                day: "numeric",
                              }
                            )} - ${booking.bookingTime || ""}`
                            : ""}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Card>
          </Col>
        </Row>
        {showModal && selectedBooking && (
          <>
            {/* backdrop */}
            <div className="modal-backdrop fade show" style={{ zIndex: 1040 }}></div>
            {/* modal */}
            <div className="modal fade show d-block" tabIndex="-1" role="dialog" style={{ zIndex: 1050 }}>
              <div className="modal-dialog modal-lg" role="document">
                <div className="modal-content">
                  <div className="modal-header">
                    <h5 className="modal-title">Booking Details</h5>
                    <button
                      type="button"
                      className="btn-close"
                      onClick={handleCloseModal}
                    ></button>
                  </div>
                  <div className="modal-body">{renderDetails()}</div>
                  <div className="modal-footer">
                    <button className="btn btn-secondary" onClick={handleCloseModal}>
                      Close
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </>
        )}
      </div>

    </>
  );
}

export default Dashboard;

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
  return (
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
            <h2 className="heading-cards">Event Booked</h2>
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
                    <th>Adults</th>
                    <th>Kids</th>
                    <th>Booking Date</th>
                  </tr>
                </thead>
                <tbody>
                  {recentBookings.map((booking, i) => (
                    <tr key={booking._id || i}>
                      <td>{i + 1}</td>
                      <td>{booking.tour_name}</td>
                      <td>
                        {booking.guestId
                          ? `${booking.guestId.firstname || "Guest"} ${
                              booking.guestId.lastname || ""
                            }`.trim()
                          : ""}
                      </td>
                      <td>{booking.adults}</td>
                      <td>{booking.kids}</td>
                      <td>
                        {booking.bookingDate
                          ? new Date(booking.bookingDate).toLocaleString()
                          : booking.createdAt
                          ? new Date(booking.createdAt).toLocaleString()
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
    </div>
  );
}

export default Dashboard;

import React, { useEffect, useState, useMemo } from "react";
import { Link } from "react-router-dom";
import axiosInstance from "../../utils/axiosInstnace";
import TableContainer from "../../common/TableContainer";

function ManageEvents() {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const response = await axiosInstance.get("/events");
        setEvents(response.data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchEvents();
  }, []);

  const handleDelete = async (id) => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this category?"
    );
    if (confirmed) {
      try {
        await axiosInstance.get(`/events/delete/${id}`);
        setEvents(events.filter((blog) => blog._id !== id));
      } catch (err) {
        alert("Error deleting blog: " + err.message);
      }
    }
  };

  const columns = useMemo(
    () => [
      {
        name: "Index",
        cell: (row, index) => index + 1,
        width: "80px",
        sortable: false,
      },
      {
        name: "Event Name",
        selector: (row) => row.eventName,
        sortable: true,
      },
      {
        name: "Event Link",
        selector: (row) => row.eventURL,
        sortable: true,
        wrap: true,
      },
      {
        name: "Action",
        cell: (row) => (
          <div className="d-flex gap-2">
            <Link to={`/edit-event/${row.eventURL}`}>
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
        width: "200px",
      },
    ],
    [events]
  );


  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div className="w-100 overview">
      <div className="section-heading">
        <h2>Manage Events</h2>
      </div>
      <div className="action-btn d-flex justify-content-between mb-3">
        <Link to="/add-events">
          <button className="btn btn-success w-auto">Add Event</button>
        </Link>
      </div>
      <TableContainer columns={columns} data={events} />
    </div>
  );
}

export default ManageEvents;

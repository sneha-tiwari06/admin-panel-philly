import React, { useState, useEffect } from "react";
import axiosInstance from "../../utils/axiosInstnace";

const BookingForm = () => {
  const [form, setForm] = useState({
    tourId: "",
    blockDate: "",
    blockTime: "10:00 AM",
    adultPassengers: 0,
    kidPassengers: 0
  });

  const [tours, setTours] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchTours = async () => {
      try {
        const response = await axiosInstance.get("/tours");
        setTours(response.data.data); // Assuming tours in response.data.data
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchTours();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const response = await axiosInstance.post("/bookings/book-tour", form);
      alert(response.data.message);
    } catch (err) {
      alert(err.response?.data?.message || "Error booking tour");
    }
  };

  return (
    <form onSubmit={handleSubmit} className="container">
      <h3>Book Your Tour</h3>

      {/* Dropdown showing selectedCategory.category */}
      <select
        className="form-control"
        value={form.tourId}
        onChange={(e) => setForm({ ...form, tourId: e.target.value })}
        required
      >
        <option value="">Select Tour</option>
        {tours.map((tour) => (
          <option key={tour._id} value={tour._id}>
            {tour.selectedCategory?.category || "Unnamed Tour"}
          </option>
        ))}
      </select>

      <input
        type="date"
        className="form-control mt-2"
        onChange={(e) => setForm({ ...form, blockDate: e.target.value })}
        required
      />

      <select
        className="form-control mt-2"
        value={form.blockTime}
        onChange={(e) => setForm({ ...form, blockTime: e.target.value })}
      >
        <option>10:00 AM</option>
        <option>01:00 PM</option>
        <option>04:00 PM</option>
        <option>07:00 PM</option>
      </select>

      <input
        type="number"
        min="0"
        className="form-control mt-2"
        placeholder="Adult Passengers"
        onChange={(e) =>
          setForm({ ...form, adultPassengers: parseInt(e.target.value) || 0 })
        }
      />

      <input
        type="number"
        min="0"
        className="form-control mt-2"
        placeholder="Kid Passengers"
        onChange={(e) =>
          setForm({ ...form, kidPassengers: parseInt(e.target.value) || 0 })
        }
      />

      <button type="submit" className="btn btn-primary mt-3">
        Book Now
      </button>

      {loading && <p>Loading tours...</p>}
      {error && <p className="text-danger">Error: {error}</p>}
    </form>
  );
};

export default BookingForm;

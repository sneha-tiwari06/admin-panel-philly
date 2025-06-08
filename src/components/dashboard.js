import React, { useEffect, useState } from "react";
import axiosInstance from "../utils/axiosInstnace";

function Dashboard() {
  const [totalQueries, setTotalQueries] = useState(0);
  const [contactQueries, setContactQueries] = useState(0);
 const [totalBookings, setTotalBookings] = useState(0); 
  useEffect(() => {
    const fetchTotalQueries = async () => {
      try {
        const response = await axiosInstance.get('/career-queries/count');
        setTotalQueries(response.data.count);
      } catch (error) {
        console.error('Error fetching total queries:', error);
      }
    };

    fetchTotalQueries();
  }, []);
  useEffect(() => {
    const TotalContactQueries= async () => {
      try {
        const response = await axiosInstance.get('/contact-us/count');
        setContactQueries(response.data.count);
      } catch (error) {
        console.error('Error fetching total queries:', error);
      }
    };

    TotalContactQueries();
  }, []);
 useEffect(() => {
    const fetchTotalBookings = async () => {
      try {
        const response = await axiosInstance.get('/complete-booking/bookings-tour/count');
        setTotalBookings(response.data.count);
      } catch (error) {
        console.error('Error fetching total bookings:', error);
      }
    };
    fetchTotalBookings();
  }, []);
  return (
    <div className="dashboard-container">
      <h2>Welcome to the Dashboard!</h2>
      <div className="card-container">
         <div className="card">
          <h3>Total Bookings</h3>
          <p>{totalBookings}</p>
        </div>       
        <div className="card">
          <h3>Event Queries</h3>
          <p>Total Queries: {contactQueries}</p>
        </div>       
      </div>
    </div>
  );
}

export default Dashboard;

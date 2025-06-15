// src/App.js
import React from "react";
import "./App.css";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import Login from "./auth/login";
import Register from "./auth/register";
import Dashboard from "./components/dashboard";
import ProtectedRoute from "./auth/protectedRoute";
import ManageCategory from "./components/category/manageCategory";
import ManageCars from "./components/category/manageCars";
import AddCategory from "./components/category/addCategory";
import AddCars from "./components/category/addCars";
import BlogPost from "./components/manageTours/addTours";
import AddTours from "./components/manageTours/addTours";
import ManageTours from "./components/manageTours/manageTours";
import Testimonials from "./components/common/addTestimonials";
import ManageTestimonials from "./components/common/manageTestimonials";
import ManageFAQ from "./components/common/manageFAQ";
import AddFAQ from "./components/common/addFAQ";
import AddBlog from "./components/Blogs/addBlog";
import ManageBlogs from "./components/Blogs/BlogList";
import ManageEvents from "./components/Event/ManageEvent";
import AddEvent from "./components/Event/addEvent";
import ManageGallery from "./components/manageTours/manageGallery";
import AddGallery from "./components/manageTours/addGallery";
import ManageBlockDate from "./components/BlockTours/manageBlockdate";
import BlockDate from "./components/BlockTours/blockDate";
import ManageBlockTime from "./components/BlockTours/manageBlocktime";
import BlockTime from "./components/BlockTours/blockTime";
import BookingForm from "./components/BookingTours.js/bookingTours";
import ManageBookings from "./components/BookingTours.js/manageBookings";
import Coupons from "./components/coupon/coupon";
import Offers from "./components/coupon/listCoupon";
import ManageContactQuery from "./components/contactQueries/contactQueries";
import DashboardSubAdmin from "./components/dashboard-subadmin";
import ManageUsers from "./components/Users/manage-users";
import AddUsers from "./components/Users/add-users";

function App() {
  return (
    <Router>
      <div className="App">
        <Routes>
          <Route path="/" element={<Login />} />
          <Route element={<ProtectedRoute />}>
            <Route
              path="/register"
              element={<Register />}
            />

            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/dashboard-subadmin" element={<DashboardSubAdmin />} />
            <Route path="/manage-category" element={<ManageCategory />} />
            <Route path="/add-category" element={<AddCategory />} />
            <Route path="/edit-category/:id" element={<AddCategory />} />
            <Route path="/manage-cars" element={<ManageCars />} />
            <Route path="/add-cars" element={<AddCars />} />
            <Route path="/edit-car/:id" element={<AddCars />} />
            <Route path="/manage-tours" element={<ManageTours />} />
            <Route path="/add-tours" element={<AddTours />} />
            <Route path="/edit-tour/:id" element={<AddTours />} />
            <Route path="/manage-gallery/:id" element={<ManageGallery />} />
            <Route path="/add-gallery/tour/:tourId" element={<AddGallery />} />
            <Route
              path="/edit-gallery/:tourId/:galleryId"
              element={<AddGallery />}
            />
            <Route
              path="/manage-testimonials"
              element={<ManageTestimonials />}
            />
            <Route path="/add-testimonials" element={<Testimonials />} />
            <Route path="/edit-testimonials/:id" element={<Testimonials />} />
            <Route path="/manage-faqs/" element={<ManageFAQ />} />
            <Route path="/add-faqs" element={<AddFAQ />} />
            <Route path="/edit-faqs/:id" element={<AddFAQ />} />
            <Route path="/manage-blogs" element={<ManageBlogs />} />
            <Route path="/add-blogs" element={<AddBlog />} />
            <Route path="/edit-blog/:slug" element={<AddBlog />} />
            <Route path="/manage-events" element={<ManageEvents />} />
            <Route path="/add-events" element={<AddEvent />} />
            <Route path="/edit-event/:slug" element={<AddEvent />} />
            <Route path="/manage-block-dates" element={<ManageBlockDate />} />
            <Route path="/add-block-date" element={<BlockDate />} />
            <Route path="/edit-block-date/:id" element={<BlockDate />} />
            <Route path="/manage-block-times" element={<ManageBlockTime />} />
            <Route path="/add-block-time" element={<BlockTime />} />
            <Route path="/edit-block-time/:id" element={<BlockTime />} />
            <Route path="/manage-booking" element={<BookingForm />} />
            <Route path="/manage-bookings" element={<ManageBookings />} />
            <Route path="/add-offers" element={<Coupons />} />
            <Route path="/edit-coupon/:id" element={<Coupons />} />
            <Route path="/offers" element={<Offers />} />
            <Route
              path="/manage-contact-queries"
              element={<ManageContactQuery />}
            />
            <Route
              path="/manage-users"
              element={<ManageUsers />}
            />
            <Route
              path="/add-users"
              element={<AddUsers />}
            />
            <Route path="/edit-user/:id" element={<AddUsers />} />

          </Route>
        </Routes>
      </div>
    </Router>
  );
}

export default App;

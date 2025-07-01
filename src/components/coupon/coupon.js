import React, { useState, useEffect } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import axiosInstance from "../../utils/axiosInstnace";

const Coupons = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [couponName, setCouponName] = useState("");
  const [code, setCode] = useState("");
  const [discountType, setDiscountType] = useState("");
  const [totalDiscount, setTotalDiscount] = useState("");
  const [totalAmount, setTotalAmount] = useState("");
  const [toursList, setToursList] = useState([]);
  const [selectedTour, setSelectedTour] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [uses, setUses] = useState("");
  useEffect(() => {
    axiosInstance
      .get("/categories")
      .then((res) => {
        setToursList(res.data);
      })
      .catch((err) => console.error("Error fetching categories:", err));

    if (id) {
      axiosInstance
        .get(`/coupons/${id}`)
        .then((response) => {
          const data = response.data;
          setCouponName(data.couponName || "");
          setCode(data.code || "");
          setDiscountType(data.discountType || "");
          setTotalDiscount(data.totalDiscount || "");
          setTotalAmount(data.totalAmount || "");
          setSelectedTour(data.tours[0]?._id || "");
          setStartDate(data.startDate ? data.startDate.slice(0, 10) : "");
          setEndDate(data.endDate ? data.endDate.slice(0, 10) : "");
          setUses(data.uses || "");
        })
        .catch((err) => console.error("Error fetching coupon details:", err));
    }
  }, [id]);
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (
      !couponName ||
      !code ||
      !discountType ||
      !totalDiscount ||
      !totalAmount ||
      !selectedTour ||
      !startDate ||
      !endDate ||
      !uses
    ) {
      alert("Please fill all the fields!");
      return;
    }

    try {
      const data = {
        couponName,
        code,
        discountType,
        totalDiscount,
        totalAmount,
        tours: [selectedTour],
        startDate,
        endDate,
        uses,
      };

      if (id) {
        await axiosInstance.post(`/coupons/update/${id}`, data);
      } else {
        await axiosInstance.post("/coupons/add", data);
      }

      navigate("/offers");
    } catch (err) {
      console.error("Error submitting coupon:", err);
    }
  };

  return (
    <div className="bg-light">
      <div className="container-lg">
        <div className="py-5 px-4 bg-white mvh-100">
          <div className="d-flex justify-content-between align-items-center mb-3">
            <h2>{id ? "Edit Coupon" : "Add Coupon"}</h2>
            <Link to="/offers">
              <button className="btn btn-primary">Back</button>
            </Link>
          </div>

          <form onSubmit={handleSubmit}>
            <div className="row gx-3 gy-4">
              <div className="col-md-6">
                <label>Coupon Name</label>
                <input
                  type="text"
                  className="form-control"
                  value={couponName}
                  onChange={(e) => setCouponName(e.target.value)}
                  required
                />
              </div>

              <div className="col-md-6">
                <label>Coupon Code</label>
                <input
                  type="text"
                  className="form-control"
                  value={code}
                  onChange={(e) => setCode(e.target.value)}
                  required
                />
              </div>

              <div className="col-md-6">
                <label>Discount Type</label>
                <select
                  className="form-control"
                  value={discountType}
                  onChange={(e) => setDiscountType(e.target.value)}
                  required
                >
                  <option value="">Select Discount Type</option>
                  <option value="percentage">Percentage</option>
                  <option value="fixed-amount">Fixed Amount</option>
                </select>
              </div>

              <div className="col-md-6">
                <label>Discount</label>
                <input
                  type="number"
                  className="form-control"
                  value={totalDiscount}
                  onChange={(e) => setTotalDiscount(e.target.value)}
                  required
                />
              </div>

              <div className="col-md-6">
                <label>Total Amount</label>
                <input
                  type="number"
                  className="form-control"
                  value={totalAmount}
                  onChange={(e) => setTotalAmount(e.target.value)}
                  required
                />
              </div>

              <div className="col-md-6">
                <label>Tours</label>
                <select
                  className="form-control"
                  value={selectedTour}
                  onChange={(e) => setSelectedTour(e.target.value)}
                  required
                >
                  <option value="">Select Tour</option>
                  {toursList.map((tour) => (
                    <option key={tour._id} value={tour._id}>
                      {tour.category}
                    </option>
                  ))}
                </select>
              </div>

              <div className="col-md-6">
                <label>Start Date</label>
                <input
                  type="date"
                  className="form-control"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  required
                />
              </div>

              <div className="col-md-6">
                <label>End Date</label>
                <input
                  type="date"
                  className="form-control"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  required
                />
              </div>

              <div className="col-md-6">
                <label>Uses Per Customer</label>
                <input
                  type="number"
                  className="form-control"
                  value={uses}
                  onChange={(e) => setUses(e.target.value)}
                  required
                />
              </div>
            </div>

            <button type="submit" className="btn btn-primary mt-4">
              {id ? "Update Coupon" : "Create Coupon"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Coupons;

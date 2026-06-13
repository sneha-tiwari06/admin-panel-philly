import React, { useState, useEffect } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import axiosInstance from "../../utils/axiosInstnace";
import {
  ArrowLeft,
  Save,
  Tag,
  Percent,
  Calendar,
  MapPin,
} from "lucide-react";
import "../../styles/admin-page.css";

function Coupons() {
  const { id } = useParams();
  const isEdit = Boolean(id);
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
  const [loading, setLoading] = useState(isEdit);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const categoriesRes = await axiosInstance.get("/categories");
        setToursList(categoriesRes.data || []);

        if (id) {
          const response = await axiosInstance.get(`/coupons/${id}`);
          const data = response.data;
          setCouponName(data.couponName || "");
          setCode(data.code || "");
          setDiscountType(data.discountType || "");
          setTotalDiscount(data.totalDiscount ?? "");
          setTotalAmount(data.totalAmount ?? "");
          setSelectedTour(data.tours?.[0]?._id || "");
          setStartDate(data.startDate ? data.startDate.slice(0, 10) : "");
          setEndDate(data.endDate ? data.endDate.slice(0, 10) : "");
          setUses(data.uses ?? "");
        }
      } catch (err) {
        console.error("Error loading coupon form:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [id]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);

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
      alert("Failed to save coupon. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  const discountPreview =
    totalDiscount && discountType === "percentage"
      ? `${totalDiscount}% off`
      : totalDiscount && discountType === "fixed-amount"
      ? `$${totalDiscount} off`
      : null;

  if (loading) {
    return (
      <div className="admin-page">
        <div className="admin-page__loading">Loading coupon details…</div>
      </div>
    );
  }

  return (
    <div className="admin-page">
      <div className="admin-page__header">
        <div>
          <h1 className="admin-page__title">
            {isEdit ? "Edit Coupon" : "Add Coupon"}
          </h1>
          <p className="admin-page__subtitle">
            {isEdit
              ? "Update discount details, validity, and applicable tour category."
              : "Create a new discount code for customers to use at checkout."}
          </p>
        </div>
        <Link to="/offers" className="admin-btn admin-btn--ghost">
          <ArrowLeft size={18} />
          Back to Coupons
        </Link>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="admin-form-stack">
          <div className="admin-form-card">
            <div className="admin-form-section">
              <h2 className="admin-form-section__title">
                <Tag size={16} style={{ verticalAlign: "middle", marginRight: 6 }} />
                Coupon Details
              </h2>
              <p className="admin-form-section__desc">
                Basic information customers will see when applying the code.
              </p>

              <div className="admin-form-grid">
                <div className="admin-form-group">
                  <label className="admin-form-label" htmlFor="couponName">
                    Coupon Name <span>*</span>
                  </label>
                  <input
                    id="couponName"
                    type="text"
                    className="admin-form-input"
                    value={couponName}
                    onChange={(e) => setCouponName(e.target.value)}
                    placeholder="e.g. Summer Sale"
                    required
                  />
                </div>

                <div className="admin-form-group">
                  <label className="admin-form-label" htmlFor="code">
                    Coupon Code <span>*</span>
                  </label>
                  <input
                    id="code"
                    type="text"
                    className="admin-form-input"
                    value={code}
                    onChange={(e) => setCode(e.target.value.toUpperCase())}
                    placeholder="e.g. SUMMER20"
                    required
                  />
                  {code && (
                    <p className="admin-form-hint">
                      Customers enter: <span className="admin-slug">{code}</span>
                    </p>
                  )}
                </div>
              </div>
            </div>
          </div>

          <div className="admin-form-layout">
            <div className="admin-form-card">
              <div className="admin-form-section">
                <h2 className="admin-form-section__title">
                  <Percent size={16} style={{ verticalAlign: "middle", marginRight: 6 }} />
                  Discount Settings
                </h2>
                <p className="admin-form-section__desc">
                  Define how much discount applies and minimum order amount.
                </p>

                <div className="admin-form-grid">
                  <div className="admin-form-group">
                    <label className="admin-form-label" htmlFor="discountType">
                      Discount Type <span>*</span>
                    </label>
                    <select
                      id="discountType"
                      className="admin-form-select"
                      value={discountType}
                      onChange={(e) => setDiscountType(e.target.value)}
                      required
                    >
                      <option value="">Select discount type</option>
                      <option value="percentage">Percentage (%)</option>
                      <option value="fixed-amount">Fixed Amount ($)</option>
                    </select>
                  </div>

                  <div className="admin-form-group">
                    <label className="admin-form-label" htmlFor="totalDiscount">
                      Discount Value <span>*</span>
                    </label>
                    <input
                      id="totalDiscount"
                      type="number"
                      className="admin-form-input"
                      value={totalDiscount}
                      onChange={(e) => setTotalDiscount(e.target.value)}
                      placeholder={discountType === "percentage" ? "e.g. 20" : "e.g. 50"}
                      min="0"
                      required
                    />
                  </div>

                  <div className="admin-form-group admin-form-group--full">
                    <label className="admin-form-label" htmlFor="totalAmount">
                      Minimum Order Amount <span>*</span>
                    </label>
                    <input
                      id="totalAmount"
                      type="number"
                      className="admin-form-input"
                      value={totalAmount}
                      onChange={(e) => setTotalAmount(e.target.value)}
                      placeholder="e.g. 100"
                      min="0"
                      required
                    />
                    <p className="admin-form-hint">
                      Minimum cart total required to use this coupon.
                    </p>
                  </div>

                  {discountPreview && (
                    <div className="admin-form-group admin-form-group--full">
                      <span className="admin-price-badge">
                        <Percent size={14} />
                        Preview: {discountPreview}
                        {totalAmount ? ` on orders over $${totalAmount}` : ""}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="admin-form-card">
              <div className="admin-form-section">
                <h2 className="admin-form-section__title">
                  <Calendar size={16} style={{ verticalAlign: "middle", marginRight: 6 }} />
                  Validity & Usage
                </h2>
                <p className="admin-form-section__desc">
                  Set when the coupon is valid and how often it can be used.
                </p>

                <div className="admin-form-grid">
                  <div className="admin-form-group">
                    <label className="admin-form-label" htmlFor="startDate">
                      Start Date <span>*</span>
                    </label>
                    <input
                      id="startDate"
                      type="date"
                      className="admin-form-input"
                      value={startDate}
                      onChange={(e) => setStartDate(e.target.value)}
                      required
                    />
                  </div>

                  <div className="admin-form-group">
                    <label className="admin-form-label" htmlFor="endDate">
                      End Date <span>*</span>
                    </label>
                    <input
                      id="endDate"
                      type="date"
                      className="admin-form-input"
                      value={endDate}
                      onChange={(e) => setEndDate(e.target.value)}
                      required
                    />
                  </div>

                  <div className="admin-form-group admin-form-group--full">
                    <label className="admin-form-label" htmlFor="uses">
                      Uses Per Customer <span>*</span>
                    </label>
                    <input
                      id="uses"
                      type="number"
                      className="admin-form-input"
                      value={uses}
                      onChange={(e) => setUses(e.target.value)}
                      placeholder="e.g. 1"
                      min="1"
                      required
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="admin-form-card">
            <div className="admin-form-section">
              <h2 className="admin-form-section__title">
                <MapPin size={16} style={{ verticalAlign: "middle", marginRight: 6 }} />
                Applicable Tour Category
              </h2>
              <p className="admin-form-section__desc">
                Select which tour category this coupon applies to.
              </p>

              <div className="admin-form-group" style={{ maxWidth: 480 }}>
                <label className="admin-form-label" htmlFor="selectedTour">
                  Tour Category <span>*</span>
                </label>
                <select
                  id="selectedTour"
                  className="admin-form-select"
                  value={selectedTour}
                  onChange={(e) => setSelectedTour(e.target.value)}
                  required
                >
                  <option value="">Select tour category</option>
                  {toursList.map((tour) => (
                    <option key={tour._id} value={tour._id}>
                      {tour.category}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="admin-form-footer admin-form-footer--split">
              <span className="admin-form-footer__note">
                Fields marked with <span style={{ color: "#ef4444" }}>*</span> are required.
              </span>
              <div className="admin-page__actions">
                <Link to="/offers" className="admin-btn admin-btn--secondary">
                  Cancel
                </Link>
                <button
                  type="submit"
                  className="admin-btn admin-btn--primary"
                  disabled={submitting}
                >
                  <Save size={18} />
                  {submitting ? "Saving…" : isEdit ? "Update Coupon" : "Create Coupon"}
                </button>
              </div>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
}

export default Coupons;

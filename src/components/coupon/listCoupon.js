import React, { useEffect, useState, useMemo, useCallback } from "react";
import { Link } from "react-router-dom";
import axiosInstance from "../../utils/axiosInstnace";
import TableContainer from "../../common/TableContainer";
import {
  Plus,
  Search,
  Tag,
  Percent,
  DollarSign,
  Edit,
  Trash,
  Ticket,
} from "lucide-react";
import "../../styles/admin-page.css";

function formatDiscount(row) {
  if (!row.totalDiscount) return "—";
  if (row.discountType === "percentage") return `${row.totalDiscount}%`;
  if (row.discountType === "fixed-amount") return `$${row.totalDiscount}`;
  return row.totalDiscount;
}

function formatDiscountType(type) {
  if (type === "percentage") return "Percentage";
  if (type === "fixed-amount") return "Fixed Amount";
  return type || "—";
}

function isCouponActive(coupon) {
  if (!coupon.startDate || !coupon.endDate) return true;
  const now = new Date();
  const start = new Date(coupon.startDate);
  const end = new Date(coupon.endDate);
  return now >= start && now <= end;
}

function formatDateRange(coupon) {
  if (!coupon.startDate && !coupon.endDate) return "—";
  const start = coupon.startDate ? coupon.startDate.slice(0, 10) : "—";
  const end = coupon.endDate ? coupon.endDate.slice(0, 10) : "—";
  return `${start} → ${end}`;
}

function Offers() {
  const [coupons, setCoupons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    const fetchCoupons = async () => {
      try {
        const response = await axiosInstance.get("/coupons");
        setCoupons(response.data || []);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchCoupons();
  }, []);

  const handleDelete = useCallback(async (id) => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this coupon?"
    );
    if (!confirmed) return;

    try {
      await axiosInstance.get(`/coupons/delete/${id}`);
      setCoupons((prev) => prev.filter((coupon) => coupon._id !== id));
    } catch (err) {
      alert("Error deleting coupon: " + err.message);
    }
  }, []);

  const filteredCoupons = useMemo(() => {
    if (!searchTerm.trim()) return coupons;
    const query = searchTerm.toLowerCase();
    return coupons.filter(
      (coupon) =>
        coupon.couponName?.toLowerCase().includes(query) ||
        coupon.code?.toLowerCase().includes(query) ||
        coupon.discountType?.toLowerCase().includes(query)
    );
  }, [coupons, searchTerm]);

  const percentageCount = useMemo(
    () => coupons.filter((c) => c.discountType === "percentage").length,
    [coupons]
  );

  const activeCount = useMemo(
    () => coupons.filter(isCouponActive).length,
    [coupons]
  );

  const columns = useMemo(
    () => [
      {
        name: "#",
        selector: (_row, index) => index + 1,
        sortable: false,
        width: "70px",
      },
      {
        name: "Coupon",
        selector: (row) => row.couponName,
        sortable: true,
        grow: 2,
        cell: (row) => (
          <div className="admin-category-name">
            <span className="admin-category-avatar">
              <Tag size={16} />
            </span>
            <div>
              <div style={{ fontWeight: 600, color: "#0f172a" }}>
                {row.couponName || "—"}
              </div>
              <div style={{ fontSize: "0.75rem", color: "#94a3b8", marginTop: 2 }}>
                {formatDateRange(row)}
              </div>
            </div>
          </div>
        ),
      },
      {
        name: "Code",
        selector: (row) => row.code,
        sortable: true,
        width: "140px",
        cell: (row) => <span className="admin-slug">{row.code || "—"}</span>,
      },
      {
        name: "Type",
        selector: (row) => row.discountType,
        sortable: true,
        width: "130px",
        cell: (row) => (
          <span className="admin-badge admin-badge--inactive">
            {formatDiscountType(row.discountType)}
          </span>
        ),
      },
      {
        name: "Discount",
        selector: (row) => row.totalDiscount,
        sortable: true,
        width: "110px",
        cell: (row) => (
          <span style={{ fontWeight: 700, color: "#d97706" }}>{formatDiscount(row)}</span>
        ),
      },
      {
        name: "Min Amount",
        selector: (row) => row.totalAmount,
        sortable: true,
        width: "110px",
        cell: (row) => (
          <span style={{ fontWeight: 600, color: "#0f172a" }}>
            {row.totalAmount ? `$${row.totalAmount}` : "—"}
          </span>
        ),
      },
      {
        name: "Uses",
        selector: (row) => row.uses,
        sortable: true,
        width: "80px",
      },
      {
        name: "Status",
        width: "110px",
        cell: (row) => (
          <span
            className={`admin-badge ${
              isCouponActive(row) ? "admin-badge--active" : "admin-badge--inactive"
            }`}
          >
            {isCouponActive(row) ? "Active" : "Expired"}
          </span>
        ),
      },
      {
        name: "Actions",
        width: "120px",
        cell: (row) => (
          <div className="admin-action-group">
            <Link to={`/edit-coupon/${row._id}`} title="Edit coupon">
              <button type="button" className="admin-btn admin-btn--icon admin-btn--edit">
                <Edit size={15} />
              </button>
            </Link>
            <button
              type="button"
              className="admin-btn admin-btn--icon admin-btn--delete"
              onClick={() => handleDelete(row._id)}
              title="Delete coupon"
            >
              <Trash size={15} />
            </button>
          </div>
        ),
        ignoreRowClick: true,
        allowOverflow: true,
        button: true,
      },
    ],
    [handleDelete]
  );

  if (loading) {
    return (
      <div className="admin-page">
        <div className="admin-page__loading">Loading coupons…</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="admin-page">
        <div className="admin-page__error">Error loading coupons: {error}</div>
      </div>
    );
  }

  return (
    <div className="admin-page">
      <div className="admin-page__header">
        <div>
          <h1 className="admin-page__title">Manage Coupons</h1>
          <p className="admin-page__subtitle">
            Create and manage discount codes for tour bookings.
          </p>
        </div>
        <Link to="/add-offers" className="admin-btn admin-btn--primary">
          <Plus size={18} />
          Add Coupon
        </Link>
      </div>

      <div className="admin-page__stats">
        <div className="admin-page__stat">
          <div className="admin-page__stat-icon admin-page__stat-icon--amber">
            <Ticket size={20} />
          </div>
          <div>
            <div className="admin-page__stat-label">Total Coupons</div>
            <div className="admin-page__stat-value">{coupons.length}</div>
          </div>
        </div>
        <div className="admin-page__stat">
          <div className="admin-page__stat-icon admin-page__stat-icon--green">
            <Tag size={20} />
          </div>
          <div>
            <div className="admin-page__stat-label">Active Now</div>
            <div className="admin-page__stat-value">{activeCount}</div>
          </div>
        </div>
        <div className="admin-page__stat">
          <div className="admin-page__stat-icon admin-page__stat-icon--blue">
            <Percent size={20} />
          </div>
          <div>
            <div className="admin-page__stat-label">Percentage</div>
            <div className="admin-page__stat-value">{percentageCount}</div>
          </div>
        </div>
        <div className="admin-page__stat">
          <div className="admin-page__stat-icon admin-page__stat-icon--slate">
            <DollarSign size={20} />
          </div>
          <div>
            <div className="admin-page__stat-label">Fixed Amount</div>
            <div className="admin-page__stat-value">
              {coupons.length - percentageCount}
            </div>
          </div>
        </div>
      </div>

      <div className="admin-page__card">
        <div className="admin-page__card-header">
          <h2 className="admin-page__card-title">All Coupons</h2>
          <span className="admin-page__card-count">
            {filteredCoupons.length} of {coupons.length} shown
          </span>
        </div>

        <div className="admin-page__toolbar">
          <div className="admin-page__search">
            <Search size={16} className="admin-page__search-icon" />
            <input
              type="text"
              className="admin-page__search-input"
              placeholder="Search by name, code, or type…"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        {coupons.length === 0 ? (
          <div className="admin-page__empty">
            <div className="admin-page__empty-icon">
              <Tag size={24} />
            </div>
            <h3 className="admin-page__empty-title">No coupons yet</h3>
            <p className="admin-page__empty-text">
              Create discount codes to offer promotions on tour bookings.
            </p>
            <Link to="/add-offers" className="admin-btn admin-btn--primary">
              <Plus size={18} />
              Add Coupon
            </Link>
          </div>
        ) : (
          <TableContainer
            columns={columns}
            data={filteredCoupons}
            noDataComponent={
              <div className="admin-page__empty" style={{ minHeight: 160 }}>
                <p className="admin-page__empty-text" style={{ margin: 0 }}>
                  No coupons match your search.
                </p>
              </div>
            }
          />
        )}
      </div>
    </div>
  );
}

export default Offers;

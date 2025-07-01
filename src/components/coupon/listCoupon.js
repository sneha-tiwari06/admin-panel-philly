import React, { useEffect, useState, useMemo } from "react";
import { Link } from "react-router-dom";
import axiosInstance from "../../utils/axiosInstnace";
import TableContainer from "../../common/TableContainer";

function Offers() {
  const [coupons, setCoupons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchCoupons = async () => {
      try {
        const response = await axiosInstance.get("/coupons");
        setCoupons(response.data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchCoupons();
  }, []);

  const handleDelete = async (id) => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this category?"
    );
    if (confirmed) {
      try {
        await axiosInstance.get(`/coupons/delete/${id}`);
        setCoupons(coupons.filter((coupon) => coupon._id !== id));
      } catch (err) {
        alert("Error deleting Offer: " + err.message);
      }
    }
  };

  const columns = useMemo(
    () => [
      {
        name: "Index",
        selector: (row, index) => index + 1,
        sortable: false,
      },
      {
        name: "Coupon Name",
        selector: (row) => row.couponName,
        sortable: true,
      },
      {
        name: "Coupon Code",
        selector: (row) => row.code,
        sortable: true,
      },
      {
        name: "Discount Type",
        selector: (row) => row.discountType,
        sortable: true,
      },
      {
        name: "Total Discount",
        selector: (row) => row.totalDiscount,
        sortable: true,
      },
      {
        name: "Action",
        width: "300px",
        cell: (row) => (
          <div className="d-flex gap-2">
            <Link to={`/edit-coupon/${row._id}`}>
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
      }

    ],
    [coupons]
  );


  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div className="w-100 overview">
      <div className="section-heading">
        <h2>Manage Offers</h2>
      </div>
      <div className="action-btn d-flex justify-content-between mb-3">
        <Link to="/add-offers">
          <button className="btn btn-success w-auto">Add Offers </button>
        </Link>
      </div>
      <TableContainer columns={columns} data={coupons} />
    </div>
  );
}

export default Offers;

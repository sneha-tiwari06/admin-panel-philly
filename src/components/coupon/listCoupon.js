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
    const confirmed = window.confirm("Are you sure you want to delete this category?");
    if (confirmed) {
      try {
        await axiosInstance.delete(`/coupons/${id}`);
        setCoupons(coupons.filter((coupon) => coupon._id !== id));
      } catch (err) {
        alert("Error deleting Offer: " + err.message);
      }
    }
  };

  const columns = useMemo(
    () => [
      {
        Header: "Index",
        accessor: "index",
        Cell: ({ row }) => row.index + 1,
      },
      {
        Header: "Coupon Name",
        accessor: "couponName",
      },
      {
        Header: "Coupon Code",
        accessor: "code",
      },
      {
        Header: "Discount Type",
        accessor: "discountType",
      },
      {
        Header: "Total Discount",
        accessor: "totalDiscount",
      },
      
      {
        Header: "Action",
        Cell: ({ row }) => (
          <div className="action-btn2">
            <Link to={`/edit-coupon/${row.original._id}`}>
              <button type="button" className="w-auto btn btn-warning">Edit</button>
            </Link>
            <button
              type="button"
              className="w-auto btn btn-danger"
              onClick={() => handleDelete(row.original._id)}
            >
              Delete
            </button>
          </div>
        ),
      },
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

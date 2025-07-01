import React, { useEffect, useState, useMemo } from "react";
import { Link } from "react-router-dom";
import axiosInstance from "../../utils/axiosInstnace";
import TableContainer from "../../common/TableContainer";

function ManageFAQ() {
  const [faqs, setFaqs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchFaqs = async () => {
      try {
        const response = await axiosInstance.get("/faqs");
        setFaqs(response.data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchFaqs();
  }, []);

  const handleDelete = async (id) => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this FAQ?"
    );
    if (confirmed) {
      try {
        await axiosInstance.get(`/faqs/delete/${id}`);
        setFaqs(faqs.filter((faq) => faq._id !== id));
      } catch (err) {
        alert("Error deleting tour: " + err.message);
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
      name: "Category",
      selector: (row) => row.category?.slugURL || "N/A",
      sortable: true,
      wrap: true,
    },
    {
      name: "Question",
      selector: (row) => row.question,
      cell: (row) => {
        const words = row.question?.split(" ") || [];
        const sliced = words.slice(0, 15).join(" ");
        return words.length > 15 ? `${sliced}...` : sliced;
      },
      wrap: true,
    },
    {
      name: "Action",
      cell: (row) => (
        <div className="d-flex gap-2">
          <Link to={`/edit-faqs/${row._id}`}>
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
      width: "180px",
    },
  ],
  [faqs]
);


  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div className="w-100 overview">
      <div className="section-heading">
        <h2>Manage FAQS</h2>
      </div>
      <div className="action-btn d-flex justify-content-between mb-3">
        <Link to="/add-faqs">
          <button className="btn btn-success w-auto">Add FAQS</button>
        </Link>
      </div>
      <TableContainer columns={columns} data={faqs} />
    </div>
  );
}

export default ManageFAQ;

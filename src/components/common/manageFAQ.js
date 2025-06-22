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
        Header: "Index",
        accessor: "index",
        Cell: ({ row }) => row.index + 1,
      },
      {
        Header: "Category",
        accessor: "category.slugURL",
        Cell: ({ row }) => row.original.category?.slugURL || "N/A",
      },

      {
        Header: "Question",
        accessor: "question",
        Cell: ({ value }) => {
          const words = value.split(" ");
          const sliced = words.slice(0, 15).join(" ");
          return words.length > 15 ? `${sliced}...` : sliced;
        },
      },

      {
        Header: "Action",
        Cell: ({ row }) => (
          <div className="action-btn2">
            <Link to={`/edit-faqs/${row.original._id}`}>
              <button type="button" className="w-auto btn btn-warning">
                Edit
              </button>
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

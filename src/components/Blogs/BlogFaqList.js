import React, { useEffect, useState, useMemo } from "react";
import { Link, useParams } from "react-router-dom";
import axiosInstance from "../../utils/axiosInstnace";
import TableContainer from "../../common/TableContainer";
import { Edit, Trash } from "lucide-react";

function ManageBlogFaq() {
  const { slug } = useParams();
  const [faqs, setFaqs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!slug) return;
    const fetchFaqs = async () => {
      try {
        const response = await axiosInstance.get(`/blog-faqs/blog/${slug}`);
        setFaqs(response.data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchFaqs();
  }, [slug]);

  const handleDelete = async (id) => {
    const confirmed = window.confirm("Are you sure you want to delete this FAQ?");
    if (confirmed) {
      try {
        await axiosInstance.get(`/blog-faqs/delete/${id}`);
        setFaqs(faqs.filter((f) => f._id !== id));
      } catch (err) {
        alert("Error deleting FAQ: " + err.message);
      }
    }
  };

  const columns = useMemo(
    () => [
      {
        name: "Index",
        selector: (row, index) => index + 1,
        sortable: false,
        width: "80px",
      },
      {
        name: "Question",
        selector: (row) => row.question,
        sortable: true,
        width: "300px",
      },
      {
        name: "Answer",
        selector: (row) => row.answer,
        sortable: true,
        width: "400px",
      },
      {
        name: "Action",
        width: "200px",
        cell: (row) => (
          <div className="d-flex gap-2">
            <Link to={`/edit-blog-faq/${slug}/${row._id}`}>
              <button type="button" className="btn btn-warning btn-sm">
                <Edit size={14} />
              </button>
            </Link>
            <button
              type="button"
              className="btn btn-danger btn-sm"
              onClick={() => handleDelete(row._id)}
            >
              <Trash size={14} />
            </button>
          </div>
        ),
        ignoreRowClick: true,
        allowOverflow: true,
        button: true,
      },
    ],
    [faqs, slug]
  );

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div className="w-100 overview">
      <div className="section-heading d-flex justify-content-between align-items-center">
        <h2>
          Manage Blog FAQs{" "}
          {slug && <small className="text-muted">(Blog: {slug})</small>}
        </h2>
        <Link to="/manage-blogs">
          <button className="btn btn-outline-secondary btn-sm">Back to Blogs</button>
        </Link>
      </div>
      <div className="action-btn d-flex justify-content-between mb-3">
        <Link to={`/add-blog-faq/${slug}`}>
          <button className="btn btn-success w-auto">Add FAQ</button>
        </Link>
      </div>
      <TableContainer columns={columns} data={faqs} />
    </div>
  );
}

export default ManageBlogFaq;

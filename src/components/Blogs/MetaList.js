import React, { useEffect, useState, useMemo } from "react";
import { Link, useParams } from "react-router-dom";
import axiosInstance from "../../utils/axiosInstnace";
import TableContainer from "../../common/TableContainer";
import { Edit, Trash } from "lucide-react";

function ManageMeta() {
  const { slug } = useParams();
  const [meta, setMeta] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!slug) return;
    const fetchMeta = async () => {
      try {
        const response = await axiosInstance.get(`/meta/blog/${slug}`);
        setMeta(response.data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchMeta();
  }, [slug]);

  const handleDelete = async (id) => {
    const confirmed = window.confirm("Are you sure you want to delete this meta?");
    if (confirmed) {
      try {
        await axiosInstance.get(`/meta/delete/${id}`);
        setMeta(meta.filter((m) => m._id !== id));
      } catch (err) {
        alert("Error deleting meta: " + err.message);
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
        name: "Meta/Schema Name",
        selector: (row) => row.metaName,
        sortable: true,
        width: "300px",
      },
      {
        name: "Meta/Schema",
        selector: (row) => row.metaValue,
        sortable: true,
        width: "300px",
      },
      {
        name: "Action",
        width: "200px",
        cell: (row) => (
          <div className="d-flex gap-2">
            <Link to={`/edit-meta/${slug}/${row._id}`}>
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
    [meta, slug]
  );

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div className="w-100 overview">
      <div className="section-heading d-flex justify-content-between align-items-center">
        <h2>Manage Meta {slug && <small className="text-muted">(Blog: {slug})</small>}</h2>
        <Link to="/manage-blogs">
          <button className="btn btn-outline-secondary btn-sm">Back to Blogs</button>
        </Link>
      </div>
      <div className="action-btn d-flex justify-content-between mb-3">
        <Link to={`/add-meta/${slug}`}>
          <button className="btn btn-success w-auto">Add Meta</button>
        </Link>
      </div>
      <TableContainer columns={columns} data={meta} />
    </div>
  );
}

export default ManageMeta;

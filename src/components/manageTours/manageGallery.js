import React, { useEffect, useState, useMemo } from "react";
import { Link, useParams } from "react-router-dom";
import axiosInstance, { BASE_IMAGE_URL } from "../../utils/axiosInstnace";
import TableContainer from "../../common/TableContainer";

function ManageGallery() {
  const { id: tourId } = useParams(); // Read tourId from URL
  const [gallery, setGallery] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchGallery = async () => {
      try {
        const response = await axiosInstance.get(`/gallery/${tourId}`);
        const data = Array.isArray(response.data)
          ? response.data
          : response.data.data;
        setGallery(Array.isArray(data) ? data : []);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    if (tourId) fetchGallery();
  }, [tourId]);

  const handleDelete = async (id) => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this gallery image?"
    );
    if (confirmed) {
      try {
        await axiosInstance.get(`/gallery/${id}`);
        setGallery(gallery.filter((item) => item._id !== id));
      } catch (err) {
        alert("Error deleting gallery image: " + err.message);
      }
    }
  };

  const columns = useMemo(
    () => [
      {
        name: "Index",
        cell: (row, index) => index + 1,
        sortable: false,
      },
      {
        name: "Image",
        selector: (row) => row.imagePath,
        cell: (row) => {
          let imgPath = row.imagePath;
          if (!imgPath.startsWith("/uploads")) {
            imgPath = `/uploads/galleryImages/${imgPath}`;
          }
          return (
            <img
              src={`${BASE_IMAGE_URL}${imgPath}`}
              alt={row.galleryAltText}
              style={{ width: "100px", height: "60px", objectFit: "cover" }}
            />
          );
        },
        ignoreRowClick: true,
        allowOverflow: true,
      },
      {
        name: "Alt Text",
        selector: (row) => row.galleryAltText || "-",
        sortable: true,
      },
      {
        name: "Action",
        cell: (row) => (
          <div className="d-flex gap-2">
            <Link to={`/edit-gallery/${tourId}/${row._id}`}>
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
      },
    ],
    [gallery]
  );

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div className="w-100 overview">
      <div className="section-heading">
        <h2>Manage Gallery</h2>
      </div>
      <div className="action-btn d-flex justify-content-between mb-3">
        <Link to={`/add-gallery/tour/${tourId}`}>
          <button className="btn btn-success w-auto">Add Gallery</button>
        </Link>
      </div>
      <TableContainer columns={columns} data={gallery} />
    </div>
  );
}

export default ManageGallery;

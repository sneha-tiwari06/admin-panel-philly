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
        await axiosInstance.delete(`/gallery/${id}`);
        setGallery(gallery.filter((item) => item._id !== id));
      } catch (err) {
        alert("Error deleting gallery image: " + err.message);
      }
    }
  };

  const columns = useMemo(
    () => [
      {
        Header: "Index",
        accessor: (_, i) => i + 1,
        id: "row", // Required for custom accessor
      },
      {
        Header: "Image",
        accessor: "imagePath",
        Cell: ({ row }) => {
          let imgPath = row.original.imagePath;
          if (!imgPath.startsWith("/uploads")) {
            imgPath = `/uploads/galleryImages/${imgPath}`;
          }
          return (
            <img
              src={`${BASE_IMAGE_URL}${imgPath}`}
              alt={row.original.galleryAltText}
              style={{ width: "100px", height: "60px", objectFit: "cover" }}
            />
          );
        },
      },
      {
        Header: "Alt Text",
        accessor: "galleryAltText",
      },
      {
        Header: "Action",
        Cell: ({ row }) => (
          <div className="action-btn2">
           <Link to={`/edit-gallery/${tourId}/${row.original._id}`}>
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

import React, { useEffect, useState, useMemo, useCallback } from "react";
import { Link, useParams } from "react-router-dom";
import axiosInstance, { getImageUrl } from "../../utils/axiosInstnace";
import TableContainer from "../../common/TableContainer";
import {
  Plus,
  Search,
  Image,
  Edit,
  Trash,
  ArrowLeft,
  Images,
} from "lucide-react";
import "../../styles/admin-page.css";

function ManageGallery() {
  const { id: tourId } = useParams();
  const [gallery, setGallery] = useState([]);
  const [tourTitle, setTourTitle] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    const fetchData = async () => {
      if (!tourId) return;

      try {
        const [galleryRes, tourRes] = await Promise.allSettled([
          axiosInstance.get(`/gallery/${tourId}`),
          axiosInstance.get(`/tours/${tourId}`),
        ]);

        if (galleryRes.status === "fulfilled") {
          const data = galleryRes.value.data;
          const items = Array.isArray(data) ? data : data.data;
          setGallery(Array.isArray(items) ? items : []);
        } else {
          throw galleryRes.reason;
        }

        if (tourRes.status === "fulfilled") {
          setTourTitle(tourRes.value.data?.data?.metaTitle || "");
        }
      } catch (err) {
        setError(err.message || "Failed to load gallery");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [tourId]);

  const handleDelete = useCallback(async (id) => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this gallery image?"
    );
    if (!confirmed) return;

    try {
      await axiosInstance.get(`/gallery/${id}`);
      setGallery((prev) => prev.filter((item) => item._id !== id));
    } catch (err) {
      alert("Error deleting gallery image: " + err.message);
    }
  }, []);

  const filteredGallery = useMemo(() => {
    if (!searchTerm.trim()) return gallery;
    const query = searchTerm.toLowerCase();
    return gallery.filter((item) =>
      item.galleryAltText?.toLowerCase().includes(query)
    );
  }, [gallery, searchTerm]);

  const getImageSrc = (row) => {
    const imgPath = row.imagePath;
    if (!imgPath) return "";
    return imgPath.startsWith("http") ? imgPath : getImageUrl(imgPath);
  };

  const columns = useMemo(
    () => [
      {
        name: "#",
        cell: (_row, index) => index + 1,
        sortable: false,
        width: "70px",
      },
      {
        name: "Preview",
        width: "120px",
        cell: (row) => {
          const src = getImageSrc(row);
          return src ? (
            <img
              src={src}
              alt={row.galleryAltText || "Gallery image"}
              className="admin-gallery-thumb"
            />
          ) : (
            <span className="admin-badge admin-badge--inactive">No image</span>
          );
        },
        ignoreRowClick: true,
        allowOverflow: true,
      },
      {
        name: "Alt Text",
        selector: (row) => row.galleryAltText,
        sortable: true,
        grow: 2,
        cell: (row) => (
          <span style={{ fontWeight: 500, color: "#0f172a" }}>
            {row.galleryAltText || "—"}
          </span>
        ),
      },
      {
        name: "Actions",
        width: "120px",
        cell: (row) => (
          <div className="admin-action-group">
            <Link
              to={`/edit-gallery/${tourId}/${row._id}`}
              title="Edit gallery image"
            >
              <button type="button" className="admin-btn admin-btn--icon admin-btn--edit">
                <Edit size={15} />
              </button>
            </Link>
            <button
              type="button"
              className="admin-btn admin-btn--icon admin-btn--delete"
              onClick={() => handleDelete(row._id)}
              title="Delete gallery image"
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
    [handleDelete, tourId]
  );

  if (loading) {
    return (
      <div className="admin-page">
        <div className="admin-page__loading">Loading gallery…</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="admin-page">
        <div className="admin-page__error">Error loading gallery: {error}</div>
      </div>
    );
  }

  return (
    <div className="admin-page">
      <div className="admin-page__header">
        <div>
          <h1 className="admin-page__title">Manage Gallery</h1>
          <p className="admin-page__subtitle">
            {tourTitle
              ? `Gallery images for "${tourTitle}"`
              : "Upload and manage tour gallery images."}
          </p>
        </div>
        <div className="admin-page__actions">
          <Link to="/manage-tours" className="admin-btn admin-btn--ghost">
            <ArrowLeft size={18} />
            Back to Tours
          </Link>
          <Link to={`/add-gallery/tour/${tourId}`} className="admin-btn admin-btn--primary">
            <Plus size={18} />
            Add Gallery
          </Link>
        </div>
      </div>

      <div className="admin-page__stats">
        <div className="admin-page__stat">
          <div className="admin-page__stat-icon admin-page__stat-icon--amber">
            <Images size={20} />
          </div>
          <div>
            <div className="admin-page__stat-label">Total Images</div>
            <div className="admin-page__stat-value">{gallery.length}</div>
          </div>
        </div>
        <div className="admin-page__stat">
          <div className="admin-page__stat-icon admin-page__stat-icon--green">
            <Image size={20} />
          </div>
          <div>
            <div className="admin-page__stat-label">With Alt Text</div>
            <div className="admin-page__stat-value">
              {gallery.filter((item) => item.galleryAltText?.trim()).length}
            </div>
          </div>
        </div>
      </div>

      <div className="admin-page__card">
        <div className="admin-page__card-header">
          <h2 className="admin-page__card-title">Gallery Images</h2>
          <span className="admin-page__card-count">
            {filteredGallery.length} of {gallery.length} shown
          </span>
        </div>

        <div className="admin-page__toolbar">
          <div className="admin-page__search">
            <Search size={16} className="admin-page__search-icon" />
            <input
              type="text"
              className="admin-page__search-input"
              placeholder="Search by alt text…"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        {gallery.length === 0 ? (
          <div className="admin-page__empty">
            <div className="admin-page__empty-icon">
              <Images size={24} />
            </div>
            <h3 className="admin-page__empty-title">No gallery images yet</h3>
            <p className="admin-page__empty-text">
              Add images to showcase this tour on the website.
            </p>
            <Link to={`/add-gallery/tour/${tourId}`} className="admin-btn admin-btn--primary">
              <Plus size={18} />
              Add Gallery
            </Link>
          </div>
        ) : (
          <TableContainer
            columns={columns}
            data={filteredGallery}
            noDataComponent={
              <div className="admin-page__empty" style={{ minHeight: 160 }}>
                <p className="admin-page__empty-text" style={{ margin: 0 }}>
                  No images match your search.
                </p>
              </div>
            }
          />
        )}
      </div>
    </div>
  );
}

export default ManageGallery;

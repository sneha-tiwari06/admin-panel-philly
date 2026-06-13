import React, { useEffect, useState, useMemo, useCallback } from "react";
import { Link } from "react-router-dom";
import axiosInstance, { getTourPageUrl } from "../../utils/axiosInstnace";
import TableContainer from "../../common/TableContainer";
import {
  Edit,
  Image,
  Trash,
  Plus,
  Search,
  MapPin,
  Home,
  Layers,
  DollarSign,
} from "lucide-react";
import "../../styles/admin-page.css";

function formatTourPrice(tour) {
  if (tour.tourPrice) return `$${tour.tourPrice}`;
  const parts = [];
  if (tour.adultPrice) parts.push(`$${tour.adultPrice} adult`);
  if (tour.kidsPrice) parts.push(`$${tour.kidsPrice} kids`);
  return parts.length ? parts.join(" · ") : "—";
}

function getTourPriceSortValue(tour) {
  return Number(tour.tourPrice || tour.adultPrice || tour.kidsPrice || 0);
}

function hasTourPricing(tour) {
  return Boolean(tour.tourPrice || tour.adultPrice || tour.kidsPrice);
}

function ManageTours() {
  const [tours, setTours] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    const fetchTours = async () => {
      try {
        const response = await axiosInstance.get("/tours");
        setTours(response.data.data || []);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchTours();
  }, []);

  const handleDelete = useCallback(async (id) => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this tour?"
    );
    if (confirmed) {
      try {
        await axiosInstance.get(`/tours/delete/${id}`);
        setTours((prev) => prev.filter((tour) => tour._id !== id));
      } catch (err) {
        alert("Error deleting tour: " + err.message);
      }
    }
  }, []);

  const filteredTours = useMemo(() => {
    if (!searchTerm.trim()) return tours;
    const query = searchTerm.toLowerCase();
    return tours.filter(
      (tour) =>
        tour.metaTitle?.toLowerCase().includes(query) ||
        tour.slugURL?.toLowerCase().includes(query) ||
        tour.selectedCategory?.category?.toLowerCase().includes(query)
    );
  }, [tours, searchTerm]);

  const homepageCount = useMemo(
    () => tours.filter((tour) => tour.showOnHome).length,
    [tours]
  );

  const categoryCount = useMemo(() => {
    const ids = new Set(
      tours.map((tour) => tour.selectedCategory?._id).filter(Boolean)
    );
    return ids.size;
  }, [tours]);

  const columns = useMemo(
    () => [
      {
        name: "#",
        cell: (_row, index) => index + 1,
        sortable: false,
        width: "70px",
      },
      {
        name: "Tour",
        selector: (row) => row.metaTitle,
        sortable: true,
        grow: 2,
        cell: (row) => (
          <div className="admin-category-name">
           
            <div>
              <div>{row.metaTitle || "Untitled Tour"}</div>
            
            </div>
          </div>
        ),
      },
      {
        name: "Category",
        selector: (row) => row.selectedCategory?.category,
        sortable: true,
        grow: 1.5,
        cell: (row) => (
          <span>{row.selectedCategory?.category || "—"}</span>
        ),
      },
      {
        name: "Slug URL",
        selector: (row) => row.slugURL,
        sortable: true,
        grow: 1.5,
        cell: (row) =>
          row.slugURL ? (
            <a
              href={getTourPageUrl(row.slugURL)}
              target="_blank"
              rel="noopener noreferrer"
              className="admin-slug admin-slug--link"
              title={`Open ${getTourPageUrl(row.slugURL)}`}
            >
              {row.slugURL}
            </a>
          ) : (
            "—"
          ),
      },
      {
        name: "Price",
        selector: (row) => getTourPriceSortValue(row),
        sortable: true,
        width: "160px",
        cell: (row) => (
          <span style={{ fontWeight: 600, color: "#0f172a", fontSize: "0.8125rem" }}>
            {formatTourPrice(row)}
          </span>
        ),
      },
      {
        name: "Actions",
        width: "140px",
        cell: (row) => (
          <div className="admin-action-group">
            <Link to={`/edit-tour/${row._id}`} title="Edit tour">
              <button type="button" className="admin-btn admin-btn--icon admin-btn--edit">
                <Edit size={15} />
              </button>
            </Link>
            <Link to={`/manage-gallery/${row._id}`} title="Manage gallery">
              <button type="button" className="admin-btn admin-btn--icon admin-btn--gallery">
                <Image size={15} />
              </button>
            </Link>
            <button
              type="button"
              className="admin-btn admin-btn--icon admin-btn--delete"
              onClick={() => handleDelete(row._id)}
              title="Delete tour"
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
        <div className="admin-page__loading">Loading tours…</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="admin-page">
        <div className="admin-page__error">Error loading tours: {error}</div>
      </div>
    );
  }

  return (
    <div className="admin-page">
      <div className="admin-page__header">
        <div>
          <h1 className="admin-page__title">Manage Tours</h1>
          <p className="admin-page__subtitle">
            View and manage all tour listings, pricing, and gallery images.
          </p>
        </div>
        <Link to="/add-tours" className="admin-btn admin-btn--primary">
          <Plus size={18} />
          Add Tour
        </Link>
      </div>

      <div className="admin-page__stats">
        <div className="admin-page__stat">
          <div className="admin-page__stat-icon admin-page__stat-icon--amber">
            <MapPin size={20} />
          </div>
          <div>
            <div className="admin-page__stat-label">Total Tours</div>
            <div className="admin-page__stat-value">{tours.length}</div>
          </div>
        </div>
        <div className="admin-page__stat">
          <div className="admin-page__stat-icon admin-page__stat-icon--green">
            <Home size={20} />
          </div>
          <div>
            <div className="admin-page__stat-label">On Homepage</div>
            <div className="admin-page__stat-value">{homepageCount}</div>
          </div>
        </div>
        <div className="admin-page__stat">
          <div className="admin-page__stat-icon admin-page__stat-icon--slate">
            <Layers size={20} />
          </div>
          <div>
            <div className="admin-page__stat-label">Categories Used</div>
            <div className="admin-page__stat-value">{categoryCount}</div>
          </div>
        </div>
        <div className="admin-page__stat">
          <div className="admin-page__stat-icon admin-page__stat-icon--green">
            <DollarSign size={20} />
          </div>
          <div>
            <div className="admin-page__stat-label">With Pricing</div>
            <div className="admin-page__stat-value">
              {tours.filter(hasTourPricing).length}
            </div>
          </div>
        </div>
      </div>

      <div className="admin-page__card">
        <div className="admin-page__card-header">
          <h2 className="admin-page__card-title">All Tours</h2>
          <span className="admin-page__card-count">
            {filteredTours.length} of {tours.length} shown
          </span>
        </div>

        <div className="admin-page__toolbar">
          <div className="admin-page__search">
            <Search size={16} className="admin-page__search-icon" />
            <input
              type="text"
              className="admin-page__search-input"
              placeholder="Search by tour name, slug, or category…"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        {tours.length === 0 ? (
          <div className="admin-page__empty">
            <div className="admin-page__empty-icon">
              <MapPin size={24} />
            </div>
            <h3 className="admin-page__empty-title">No tours yet</h3>
            <p className="admin-page__empty-text">
              Create your first tour to start accepting bookings.
            </p>
            <Link to="/add-tours" className="admin-btn admin-btn--primary">
              <Plus size={18} />
              Add Tour
            </Link>
          </div>
        ) : (
          <TableContainer
            columns={columns}
            data={filteredTours}
            noDataComponent={
              <div className="admin-page__empty" style={{ minHeight: 160 }}>
                <p className="admin-page__empty-text" style={{ margin: 0 }}>
                  No tours match your search.
                </p>
              </div>
            }
          />
        )}
      </div>
    </div>
  );
}

export default ManageTours;

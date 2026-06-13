import React, { useEffect, useState, useMemo, useCallback } from "react";
import { Link } from "react-router-dom";
import axiosInstance, { getItineraryPageUrl } from "../../utils/axiosInstnace";
import TableContainer from "../../common/TableContainer";
import {
  Plus,
  Search,
  MapPin,
  Edit,
  Trash,
  ExternalLink,
  FileText,
  Home,
} from "lucide-react";
import "../../styles/admin-page.css";

function ManageItineraries() {
  const [itineraries, setItineraries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    const fetchItineraries = async () => {
      try {
        const response = await axiosInstance.get("/itineraries/admin/all");
        const data = response.data || [];
        const sorted = [...data].sort(
          (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
        );
        setItineraries(sorted);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchItineraries();
  }, []);

  const handleDelete = useCallback(async (id) => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this itinerary and its detail content?"
    );
    if (!confirmed) return;

    try {
      await axiosInstance.get(`/itineraries/delete/${id}`);
      setItineraries((prev) => prev.filter((item) => item._id !== id));
    } catch (err) {
      alert("Error deleting itinerary: " + err.message);
    }
  }, []);

  const filteredItineraries = useMemo(() => {
    if (!searchTerm.trim()) return itineraries;
    const query = searchTerm.toLowerCase();
    return itineraries.filter(
      (item) =>
        item.title?.toLowerCase().includes(query) ||
        item.slug?.toLowerCase().includes(query) ||
        item.location?.toLowerCase().includes(query)
    );
  }, [itineraries, searchTerm]);

  const homepageCount = useMemo(
    () => itineraries.filter((item) => item.showOnHomepage).length,
    [itineraries]
  );

  const columns = useMemo(
    () => [
      {
        name: "#",
        selector: (_row, index) => index + 1,
        sortable: false,
        width: "60px",
      },
      {
        name: "Itinerary",
        selector: (row) => row.title,
        sortable: true,
        grow: 2,
        cell: (row) => (
          <div className="admin-category-name">
            <div>
              <div style={{ fontWeight: 600, color: "#0f172a" }}>{row.title || "—"}</div>
              <div style={{ fontSize: "0.75rem", color: "#64748b" }}>{row.location || ""}</div>
            </div>
          </div>
        ),
      },
      {
        name: "Slug",
        selector: (row) => row.slug,
        sortable: true,
        grow: 1.5,
        cell: (row) =>
          row.slug ? (
            <a
              href={getItineraryPageUrl(row.slug)}
              target="_blank"
              rel="noopener noreferrer"
              className="admin-slug admin-slug--link"
            >
              {row.slug}
              <ExternalLink size={12} style={{ marginLeft: 4, verticalAlign: "middle" }} />
            </a>
          ) : (
            "—"
          ),
      },
      // {
      //   name: "Home",
      //   width: "70px",
      //   cell: (row) =>
      //     row.showOnHomepage ? (
      //       <span title="Shown on homepage">
      //         <Home size={16} color="#16a34a" />
      //       </span>
      //     ) : (
      //       "—"
      //     ),
      // },
      {
        name: "Detail",
        width: "100px",
        cell: (row) => (
          <Link
            to={`/add-itinerary-detail/${row.slug}`}
            className="admin-btn admin-btn--secondary"
            style={{ padding: "6px 10px", fontSize: "0.75rem" }}
            title="Manage detail content"
          >
            <FileText size={14} />
          </Link>
        ),
      },
      {
        name: "Actions",
        width: "120px",
        cell: (row) => (
          <div className="admin-action-group">
            <Link to={`/edit-itinerary/${row.slug}`} title="Edit itinerary">
              <button type="button" className="admin-btn admin-btn--icon admin-btn--edit">
                <Edit size={15} />
              </button>
            </Link>
            <button
              type="button"
              className="admin-btn admin-btn--icon admin-btn--delete"
              onClick={() => handleDelete(row._id)}
              title="Delete itinerary"
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
        <div className="admin-page__loading">Loading itineraries…</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="admin-page">
        <div className="admin-page__error">Error loading itineraries: {error}</div>
      </div>
    );
  }

  return (
    <div className="admin-page">
      <div className="admin-page__header">
        <div>
          <h1 className="admin-page__title">Manage Itineraries</h1>
          <p className="admin-page__subtitle">
            Create itinerary cards with SEO metadata, images, and quick facts.
          </p>
        </div>
        <Link to="/add-itinerary" className="admin-btn admin-btn--primary">
          <Plus size={18} />
          Add Itinerary
        </Link>
      </div>

      <div className="admin-page__stats">
        <div className="admin-page__stat">
          <div className="admin-page__stat-icon admin-page__stat-icon--amber">
            <MapPin size={20} />
          </div>
          <div>
            <div className="admin-page__stat-label">Total Itineraries</div>
            <div className="admin-page__stat-value">{itineraries.length}</div>
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
      </div>

      <div className="admin-page__card">
        <div className="admin-page__card-header">
          <h2 className="admin-page__card-title">All Itineraries</h2>
          <span className="admin-page__card-count">
            {filteredItineraries.length} of {itineraries.length} shown
          </span>
        </div>

        <div className="admin-page__toolbar">
          <div className="admin-page__search">
            <Search size={16} className="admin-page__search-icon" />
            <input
              type="text"
              className="admin-page__search-input"
              placeholder="Search by title, slug, or location…"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        {itineraries.length === 0 ? (
          <div className="admin-page__empty">
            <div className="admin-page__empty-icon">
              <MapPin size={24} />
            </div>
            <h3 className="admin-page__empty-title">No itineraries yet</h3>
            <p className="admin-page__empty-text">
              Create your first itinerary to feature Philadelphia tour stops.
            </p>
            <Link to="/add-itinerary" className="admin-btn admin-btn--primary">
              <Plus size={18} />
              Add Itinerary
            </Link>
          </div>
        ) : (
          <TableContainer
            columns={columns}
            data={filteredItineraries}
            noDataComponent={
              <div className="admin-page__empty" style={{ minHeight: 160 }}>
                <p className="admin-page__empty-text" style={{ margin: 0 }}>
                  No itineraries match your search.
                </p>
              </div>
            }
          />
        )}
      </div>
    </div>
  );
}

export default ManageItineraries;

import React, { useEffect, useState, useMemo } from "react";
import { Link } from "react-router-dom";
import axiosInstance, { getItineraryPageUrl } from "../../utils/axiosInstnace";
import TableContainer from "../../common/TableContainer";
import { Search, FileText, Edit, ExternalLink, CheckCircle, AlertCircle } from "lucide-react";
import "../../styles/admin-page.css";

function ManageItineraryDetails() {
  const [itineraries, setItineraries] = useState([]);
  const [details, setDetails] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [itinerariesRes, detailsRes] = await Promise.all([
          axiosInstance.get("/itineraries/admin/all"),
          axiosInstance.get("/itinerary-details"),
        ]);
        setItineraries(itinerariesRes.data || []);
        setDetails(detailsRes.data || []);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const detailSlugSet = useMemo(
    () => new Set(details.map((item) => item.itinerarySlug)),
    [details]
  );

  const rows = useMemo(
    () =>
      itineraries.map((item) => ({
        ...item,
        hasDetail: detailSlugSet.has(item.slug),
      })),
    [itineraries, detailSlugSet]
  );

  const filteredRows = useMemo(() => {
    if (!searchTerm.trim()) return rows;
    const query = searchTerm.toLowerCase();
    return rows.filter(
      (item) =>
        item.title?.toLowerCase().includes(query) ||
        item.slug?.toLowerCase().includes(query)
    );
  }, [rows, searchTerm]);

  const withDetailCount = useMemo(
    () => rows.filter((item) => item.hasDetail).length,
    [rows]
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
          <div>
            <div style={{ fontWeight: 600, color: "#0f172a" }}>{row.title || "—"}</div>
            <a
              href={getItineraryPageUrl(row.slug)}
              target="_blank"
              rel="noopener noreferrer"
              className="admin-slug admin-slug--link"
              style={{ fontSize: "0.75rem" }}
            >
              {row.slug}
              <ExternalLink size={11} style={{ marginLeft: 4, verticalAlign: "middle" }} />
            </a>
          </div>
        ),
      },
      {
        name: "Status",
        width: "130px",
        cell: (row) =>
          row.hasDetail ? (
            <span style={{ color: "#16a34a", display: "inline-flex", alignItems: "center", gap: 6 }}>
              <CheckCircle size={15} />
              Has Detail
            </span>
          ) : (
            <span style={{ color: "#d97706", display: "inline-flex", alignItems: "center", gap: 6 }}>
              <AlertCircle size={15} />
              Missing
            </span>
          ),
      },
      {
        name: "Actions",
        width: "140px",
        cell: (row) => (
          <Link
            to={`/add-itinerary-detail/${row.slug}`}
            className="admin-btn admin-btn--primary"
            style={{ padding: "6px 12px", fontSize: "0.75rem" }}
          >
            <Edit size={14} />
            {row.hasDetail ? "Edit Detail" : "Add Detail"}
          </Link>
        ),
      },
    ],
    []
  );

  if (loading) {
    return (
      <div className="admin-page">
        <div className="admin-page__loading">Loading itinerary details…</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="admin-page">
        <div className="admin-page__error">Error loading itinerary details: {error}</div>
      </div>
    );
  }

  return (
    <div className="admin-page">
      <div className="admin-page__header">
        <div>
          <h1 className="admin-page__title">Manage Itinerary Details</h1>
          <p className="admin-page__subtitle">
            Add or update full page content, highlights, table of contents, and FAQs for each itinerary.
          </p>
        </div>
        <Link to="/manage-itineraries" className="admin-btn admin-btn--secondary">
          Manage Itineraries
        </Link>
      </div>

      <div className="admin-page__stats">
        <div className="admin-page__stat">
          <div className="admin-page__stat-icon admin-page__stat-icon--amber">
            <FileText size={20} />
          </div>
          <div>
            <div className="admin-page__stat-label">Total Itineraries</div>
            <div className="admin-page__stat-value">{itineraries.length}</div>
          </div>
        </div>
        <div className="admin-page__stat">
          <div className="admin-page__stat-icon admin-page__stat-icon--green">
            <CheckCircle size={20} />
          </div>
          <div>
            <div className="admin-page__stat-label">With Detail Content</div>
            <div className="admin-page__stat-value">{withDetailCount}</div>
          </div>
        </div>
      </div>

      <div className="admin-page__card">
        <div className="admin-page__card-header">
          <h2 className="admin-page__card-title">Itinerary Detail Pages</h2>
          <span className="admin-page__card-count">
            {filteredRows.length} of {rows.length} shown
          </span>
        </div>

        <div className="admin-page__toolbar">
          <div className="admin-page__search">
            <Search size={16} className="admin-page__search-icon" />
            <input
              type="text"
              className="admin-page__search-input"
              placeholder="Search by title or slug…"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        {rows.length === 0 ? (
          <div className="admin-page__empty">
            <div className="admin-page__empty-icon">
              <FileText size={24} />
            </div>
            <h3 className="admin-page__empty-title">No itineraries found</h3>
            <p className="admin-page__empty-text">
              Create an itinerary first, then return here to add its detail page content.
            </p>
            <Link to="/add-itinerary" className="admin-btn admin-btn--primary">
              Add Itinerary
            </Link>
          </div>
        ) : (
          <TableContainer
            columns={columns}
            data={filteredRows}
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

export default ManageItineraryDetails;

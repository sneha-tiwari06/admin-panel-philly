import React, { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import axiosInstance from "../../utils/axiosInstnace";
import { ArrowLeft, Save, Code } from "lucide-react";
import "../../styles/admin-page.css";

const AddMeta = () => {
  const { slug, id } = useParams();
  const navigate = useNavigate();
  const isEdit = Boolean(id);

  const [metaName, setMetaName] = useState("");
  const [metaValue, setMetaValue] = useState("");
  const [loading, setLoading] = useState(isEdit);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!id) return;

    axiosInstance
      .get(`/meta/${id}`)
      .then((response) => {
        const data = response.data;
        setMetaName(data.metaName || "");
        setMetaValue(data.metaValue || "");
      })
      .catch((err) => console.error("Error fetching meta details:", err))
      .finally(() => setLoading(false));
  }, [id]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      if (isEdit) {
        await axiosInstance.post(`/meta/update/${id}`, { metaName, metaValue });
      } else {
        await axiosInstance.post("/meta/add", {
          blogSlug: slug,
          metaName,
          metaValue,
        });
      }
      navigate(`/manage-meta/${slug}`);
    } catch (err) {
      console.error("Error submitting meta:", err);
      alert("Error: " + (err.response?.data?.message || err.message));
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="admin-page">
        <div className="admin-page__loading">Loading meta details…</div>
      </div>
    );
  }

  return (
    <div className="admin-page">
      <div className="admin-page__header">
        <div>
          <h1 className="admin-page__title">{isEdit ? "Edit Meta" : "Add Meta"}</h1>
          <p className="admin-page__subtitle">
            {isEdit
              ? "Update schema or meta entry for this blog."
              : <>Add meta/schema for blog: <span className="admin-slug">{slug}</span></>}
          </p>
        </div>
        <Link
          to={slug ? `/manage-meta/${slug}` : "/manage-blogs"}
          className="admin-btn admin-btn--ghost"
        >
          <ArrowLeft size={18} />
          Back
        </Link>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="admin-form-stack">
          <div className="admin-form-card" style={{ maxWidth: 720 }}>
            <div className="admin-form-section">
              <h2 className="admin-form-section__title">
                <Code size={16} style={{ verticalAlign: "middle", marginRight: 6 }} />
                Meta / Schema Entry
              </h2>
              <p className="admin-form-section__desc">
                Structured data or custom meta tags for SEO.
              </p>

              <div className="admin-form-grid">
                <div className="admin-form-group admin-form-group--full">
                  <label className="admin-form-label" htmlFor="metaName">
                    Meta / Schema Name <span>*</span>
                  </label>
                  <input
                    id="metaName"
                    type="text"
                    className="admin-form-input"
                    value={metaName}
                    onChange={(e) => setMetaName(e.target.value)}
                    placeholder="e.g. article:author"
                    required
                  />
                </div>

                <div className="admin-form-group admin-form-group--full">
                  <label className="admin-form-label" htmlFor="metaValue">
                    Meta / Schema Value <span>*</span>
                  </label>
                  <textarea
                    id="metaValue"
                    className="admin-form-textarea admin-form-textarea--code"
                    value={metaValue}
                    onChange={(e) => setMetaValue(e.target.value)}
                    placeholder='{"@type": "Article", ...}'
                    required
                  />
                </div>
              </div>
            </div>

            <div className="admin-form-footer admin-form-footer--split">
              <span className="admin-form-footer__note">
                Fields marked with <span style={{ color: "#ef4444" }}>*</span> are required.
              </span>
              <div className="admin-page__actions">
                <Link
                  to={slug ? `/manage-meta/${slug}` : "/manage-blogs"}
                  className="admin-btn admin-btn--secondary"
                >
                  Cancel
                </Link>
                <button
                  type="submit"
                  className="admin-btn admin-btn--primary"
                  disabled={submitting}
                >
                  <Save size={18} />
                  {submitting ? "Saving…" : isEdit ? "Update Meta" : "Create Meta"}
                </button>
              </div>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
};

export default AddMeta;

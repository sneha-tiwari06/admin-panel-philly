import React, { useState, useEffect, useRef } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import axiosInstance, { getImageUrl, getEventPageUrl } from "../../utils/axiosInstnace";
import TextEditor from "../../common/ckEditor";
import {
  ArrowLeft,
  Save,
  Search,
  FileText,
  Upload,
  Image,
  X,
  Link2,
  Code,
  CalendarDays,
} from "lucide-react";
import "../../styles/admin-page.css";

function slugify(text) {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");
}

function isPdfFile(file, url) {
  if (file?.type === "application/pdf") return true;
  if (file?.name?.toLowerCase().endsWith(".pdf")) return true;
  if (url?.toLowerCase().includes(".pdf")) return true;
  return false;
}

const AddEvent = () => {
  const { slug } = useParams();
  const isEdit = Boolean(slug);
  const navigate = useNavigate();

  const [metaTitle, setMetaTitle] = useState("");
  const [metaKeywords, setMetaKeywords] = useState("");
  const [metaDescription, setMetaDescription] = useState("");
  const [eventName, setEventName] = useState("");
  const [eventURL, setEventURL] = useState("");
  const [slugTouched, setSlugTouched] = useState(false);
  const [eventDesc, setEventDesc] = useState("");
  const [schema, setSchema] = useState("");
  const [file, setFile] = useState(null);
  const [previewURL, setPreviewURL] = useState("");
  const [loading, setLoading] = useState(isEdit);
  const [submitting, setSubmitting] = useState(false);
  const fileInputRef = useRef(null);

  useEffect(() => {
    if (!slug) return;

    setLoading(true);
    axiosInstance
      .get(`/events/${slug}`)
      .then((response) => {
        const data = response.data;
        setMetaTitle(data.metaTitle || "");
        setMetaKeywords(data.metaKeywords || "");
        setMetaDescription(data.metaDescription || "");
        setEventName(data.eventName || "");
        setEventDesc(data?.eventDesc || "");
        setSchema(data.schema || "");
        setEventURL(data.eventURL || "");
        setSlugTouched(true);
        if (data.attached_document) {
          setPreviewURL(getImageUrl(data.attached_document));
        }
      })
      .catch((err) => console.error("Error fetching event details:", err))
      .finally(() => setLoading(false));
  }, [slug]);

  const handleEventNameChange = (e) => {
    const value = e.target.value;
    setEventName(value);
    if (!slugTouched && !isEdit) {
      setEventURL(slugify(value));
    }
  };

  const handleEventURLChange = (e) => {
    setSlugTouched(true);
    setEventURL(slugify(e.target.value));
  };

  const handleFileChange = (selectedFile) => {
    if (!selectedFile) return;
    setFile(selectedFile);
    setPreviewURL(URL.createObjectURL(selectedFile));
  };

  const handleFileInput = (e) => {
    handleFileChange(e.target.files[0]);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.currentTarget.classList.remove("admin-upload--active");
    handleFileChange(e.dataTransfer.files[0]);
  };

  const handleRemoveFile = () => {
    setFile(null);
    setPreviewURL("");
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (submitting) return;
    setSubmitting(true);

    try {
      const formData = new FormData();
      formData.append("metaTitle", metaTitle);
      formData.append("metaKeywords", metaKeywords);
      formData.append("metaDescription", metaDescription);
      formData.append("eventName", eventName);
      formData.append("eventDesc", eventDesc);
      formData.append("schema", schema);
      formData.append("eventURL", eventURL);

      if (file) {
        formData.append("attached_document_filename", file.name);
        formData.append("attached_document", file, file.name);
      }

      if (slug) {
        await axiosInstance.post(`/events/update/${slug}`, formData, {
          headers: { "Content-Type": "multipart/form-data" },
        });
      } else {
        await axiosInstance.post("/events/add", formData, {
          headers: { "Content-Type": "multipart/form-data" },
        });
      }

      navigate("/manage-events");
    } catch (err) {
      console.error("Error submitting event:", err);
      alert("Failed to save event. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="admin-page">
        <div className="admin-page__loading">Loading event details…</div>
      </div>
    );
  }

  const showPdfPreview = isPdfFile(file, previewURL);

  return (
    <div className="admin-page">
      <div className="admin-page__header">
        <div>
          <h1 className="admin-page__title">
            {isEdit ? "Edit Event" : "Add Event"}
          </h1>
          <p className="admin-page__subtitle">
            {isEdit
              ? "Update event details, SEO settings, description, and attached file."
              : "Create a new event page with SEO metadata and rich content."}
          </p>
        </div>
        <Link to="/manage-events" className="admin-btn admin-btn--ghost">
          <ArrowLeft size={18} />
          Back to Events
        </Link>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="admin-form-stack">
          <div className="admin-form-card">
            <div className="admin-form-section">
              <h2 className="admin-form-section__title">
                <Search size={16} style={{ verticalAlign: "middle", marginRight: 6 }} />
                SEO Information
              </h2>
              <div className="admin-form-grid">
                <div className="admin-form-group">
                  <label className="admin-form-label" htmlFor="metaTitle">
                    Meta Title <span>*</span>
                  </label>
                  <input
                    id="metaTitle"
                    className="admin-form-input"
                    value={metaTitle}
                    onChange={(e) => setMetaTitle(e.target.value)}
                    required
                  />
                </div>
                <div className="admin-form-group">
                  <label className="admin-form-label" htmlFor="metaKeywords">
                    Meta Keywords <span>*</span>
                  </label>
                  <input
                    id="metaKeywords"
                    className="admin-form-input"
                    value={metaKeywords}
                    onChange={(e) => setMetaKeywords(e.target.value)}
                    required
                  />
                </div>
                <div className="admin-form-group admin-form-group--full">
                  <label className="admin-form-label" htmlFor="metaDescription">
                    Meta Description <span>*</span>
                  </label>
                  <textarea
                    id="metaDescription"
                    className="admin-form-textarea"
                    value={metaDescription}
                    onChange={(e) => setMetaDescription(e.target.value)}
                    required
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="admin-form-layout">
            <div className="admin-form-card">
              <div className="admin-form-section">
                <h2 className="admin-form-section__title">
                  <CalendarDays size={16} style={{ verticalAlign: "middle", marginRight: 6 }} />
                  Event Details
                </h2>
                <div className="admin-form-grid">
                  <div className="admin-form-group admin-form-group--full">
                    <label className="admin-form-label" htmlFor="eventName">
                      Event Name
                    </label>
                    <input
                      id="eventName"
                      className="admin-form-input"
                      value={eventName}
                      onChange={handleEventNameChange}
                      placeholder="e.g. Summer Food Festival"
                    />
                  </div>
                  <div className="admin-form-group admin-form-group--full">
                    <label className="admin-form-label" htmlFor="eventURL">
                      Event Slug / URL
                    </label>
                    <input
                      id="eventURL"
                      className="admin-form-input"
                      value={eventURL}
                      onChange={handleEventURLChange}
                      placeholder="summer-food-festival"
                    />
                    <p className="admin-form-hint">
                      URL-friendly slug (auto-generated from event name).
                    </p>
                  </div>
                  {eventURL && (
                    <div className="admin-form-group admin-form-group--full">
                      <div className="admin-slug-preview">
                        <Link2 size={15} />
                        Live page:{" "}
                        <a
                          href={getEventPageUrl(eventURL)}
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          {getEventPageUrl(eventURL)}
                        </a>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="admin-form-card">
              <div className="admin-form-section">
                <h2 className="admin-form-section__title">
                  <Image size={16} style={{ verticalAlign: "middle", marginRight: 6 }} />
                  Event File
                </h2>
                <p className="admin-form-section__desc">
                  Upload an image or PDF document for this event.
                </p>

                <input
                  id="event-file-upload"
                  ref={fileInputRef}
                  type="file"
                  className="admin-upload__input"
                  accept=".jpg,.jpeg,.png,.webp,.pdf,image/jpeg,image/png,image/webp,application/pdf"
                  onChange={handleFileInput}
                />

                {!previewURL ? (
                  <label
                    htmlFor="event-file-upload"
                    className="admin-upload"
                    onDragOver={(e) => {
                      e.preventDefault();
                      e.currentTarget.classList.add("admin-upload--active");
                    }}
                    onDragLeave={(e) => {
                      e.currentTarget.classList.remove("admin-upload--active");
                    }}
                    onDrop={handleDrop}
                  >
                    <div className="admin-upload__icon">
                      <Upload size={22} />
                    </div>
                    <p className="admin-upload__title">Drop file here or browse</p>
                    <p className="admin-upload__text">
                      Supports JPG, PNG, WEBP, and PDF
                    </p>
                    <span className="admin-upload__browse">
                      <Image size={14} />
                      Choose File
                    </span>
                  </label>
                ) : (
                  <div className="admin-preview">
                    <div className="admin-preview__header">
                      <span>File Preview</span>
                      <div className="admin-action-group">
                        <button
                          type="button"
                          className="admin-btn admin-btn--secondary"
                          style={{ padding: "6px 12px", fontSize: "0.75rem" }}
                          onClick={() => fileInputRef.current?.click()}
                        >
                          Change File
                        </button>
                        <button
                          type="button"
                          className="admin-preview__remove"
                          onClick={handleRemoveFile}
                          aria-label="Remove file"
                        >
                          <X size={16} />
                        </button>
                      </div>
                    </div>
                    <div className="admin-preview__body">
                      {showPdfPreview ? (
                        <div className="admin-preview__file">
                          <FileText size={40} color="#d97706" />
                          <span>{file?.name || "PDF Document"}</span>
                        </div>
                      ) : (
                        <img
                          src={previewURL}
                          alt="Event preview"
                          className="admin-preview__image"
                        />
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="admin-form-card">
            <div className="admin-form-section">
              <h2 className="admin-form-section__title">Event Description</h2>
              <div className="admin-form-editor">
                <TextEditor value={eventDesc} onChange={setEventDesc} />
              </div>
            </div>
          </div>

          <div className="admin-form-card">
            <div className="admin-form-section">
              <h2 className="admin-form-section__title">
                <Code size={16} style={{ verticalAlign: "middle", marginRight: 6 }} />
                Schema Markup
              </h2>
              <textarea
                className="admin-form-textarea admin-form-textarea--code"
                value={schema}
                onChange={(e) => setSchema(e.target.value)}
                placeholder='{"@context": "https://schema.org", ...}'
              />
            </div>

            <div className="admin-form-footer admin-form-footer--split">
              <span className="admin-form-footer__note">
                Fields marked with <span style={{ color: "#ef4444" }}>*</span> are required.
              </span>
              <div className="admin-page__actions">
                <Link to="/manage-events" className="admin-btn admin-btn--secondary">
                  Cancel
                </Link>
                <button
                  type="submit"
                  className="admin-btn admin-btn--primary"
                  disabled={submitting}
                >
                  <Save size={18} />
                  {submitting ? "Saving…" : isEdit ? "Update Event" : "Create Event"}
                </button>
              </div>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
};

export default AddEvent;

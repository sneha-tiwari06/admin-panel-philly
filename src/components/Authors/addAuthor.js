import React, { useState, useEffect, useRef } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import axiosInstance, { getImageUrl, getAuthorPageUrl } from "../../utils/axiosInstnace";
import TextEditor from "../../common/ckEditor";
import Toast from "react-bootstrap/Toast";
import ToastContainer from "react-bootstrap/ToastContainer";
import {
  ArrowLeft,
  Save,
  User,
  Upload,
  Image,
  X,
  Link2,
  Plus,
  Trash2,
  Share2,
} from "lucide-react";
import "../../styles/admin-page.css";

const PLATFORM_OPTIONS = [
  "Facebook",
  "Instagram",
  "Twitter",
  "LinkedIn",
  "YouTube",
  "TikTok",
  "Pinterest",
  "Website",
  "Other",
];

const slugify = (value) =>
  value
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");

const AddAuthor = () => {
  const { slug } = useParams();
  const isEdit = Boolean(slug);
  const navigate = useNavigate();

  const [name, setName] = useState("");
  const [authorSlug, setAuthorSlug] = useState("");
  const [description, setDescription] = useState("");
  const [socialLinks, setSocialLinks] = useState([]);
  const [file, setFile] = useState(null);
  const [previewURL, setPreviewURL] = useState("");
  const fileInputRef = useRef(null);
  const [loading, setLoading] = useState(isEdit);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [toast, setToast] = useState({
    show: false,
    title: "",
    message: "",
    bg: "danger",
  });

  const notify = ({ title, message, bg = "danger", withAlert = false }) => {
    if (withAlert) alert(`${title}: ${message}`);
    setToast({ show: true, title, message, bg });
  };

  useEffect(() => {
    if (!slug) return;

    setLoading(true);
    axiosInstance
      .get(`/authors/${slug}`)
      .then((response) => {
        const data = response.data;
        setName(data.name || "");
        setAuthorSlug(data.authorSlug || "");
        setDescription(data.description || "");
        setSocialLinks(data.socialLinks || []);
        if (data.attached_document) {
          setPreviewURL(getImageUrl(data.attached_document));
        }
      })
      .catch((err) => {
        notify({
          title: "Load Failed",
          message: err.response?.data?.message || err.message || "Failed to load author.",
          bg: "danger",
          withAlert: true,
        });
      })
      .finally(() => setLoading(false));
  }, [slug]);

  const handleNameChange = (value) => {
    setName(value);
    if (!isEdit && !authorSlug) {
      setAuthorSlug(slugify(value));
    }
  };

  const handleFileInput = (e) => {
    const selectedFile = e.target.files[0];
    if (!selectedFile) return;
    setFile(selectedFile);
    setPreviewURL(URL.createObjectURL(selectedFile));
  };

  const handleRemoveFile = () => {
    setFile(null);
    setPreviewURL("");
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const addSocialLink = () => {
    setSocialLinks((prev) => [...prev, { platform: "Facebook", url: "" }]);
  };

  const updateSocialLink = (index, field, value) => {
    setSocialLinks((prev) =>
      prev.map((item, i) => (i === index ? { ...item, [field]: value } : item))
    );
  };

  const removeSocialLink = (index) => {
    setSocialLinks((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (isSubmitting) return;
    setIsSubmitting(true);

    try {
      const cleanedLinks = socialLinks.filter((link) => link.platform && link.url.trim());
      const formData = new FormData();
      formData.append("name", name);
      formData.append("authorSlug", authorSlug);
      formData.append("description", description);
      formData.append("socialLinks", JSON.stringify(cleanedLinks));

      if (file) {
        formData.append("attached_document_filename", file.name);
        formData.append("attached_document", file, file.name);
      }

      if (slug) {
        await axiosInstance.post(`/authors/update/${slug}`, formData, {
          headers: { "Content-Type": "multipart/form-data" },
        });
      } else {
        await axiosInstance.post("/authors/add", formData, {
          headers: { "Content-Type": "multipart/form-data" },
        });
      }

      notify({
        title: slug ? "Update Success" : "Save Success",
        message: slug ? "Author updated successfully." : "Author created successfully.",
        bg: "success",
      });
      navigate("/manage-authors");
    } catch (err) {
      notify({
        title: "Save Failed",
        message: err.response?.data?.message || err.message || "Something went wrong.",
        bg: "danger",
        withAlert: true,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="admin-page">
        <div className="admin-page__loading">Loading author details…</div>
      </div>
    );
  }

  return (
    <div className="admin-page">
      <ToastContainer position="top-end" className="p-3" style={{ zIndex: 9999 }}>
        <Toast
          bg={toast.bg}
          onClose={() => setToast((prev) => ({ ...prev, show: false }))}
          show={toast.show}
          delay={3500}
          autohide
        >
          <Toast.Header closeButton>
            <strong className="me-auto">{toast.title || "Notification"}</strong>
          </Toast.Header>
          <Toast.Body className="text-white">{toast.message}</Toast.Body>
        </Toast>
      </ToastContainer>

      <div className="admin-page__header">
        <div>
          <h1 className="admin-page__title">{isEdit ? "Edit Author" : "Add Author"}</h1>
          <p className="admin-page__subtitle">
            {isEdit
              ? "Update author profile, bio, image, and social media links."
              : "Create a new author profile for blog posts."}
          </p>
        </div>
        <Link to="/manage-authors" className="admin-btn admin-btn--ghost">
          <ArrowLeft size={18} />
          Back to Authors
        </Link>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="admin-form-stack">
          <div className="admin-form-layout">
            <div className="admin-form-card">
              <div className="admin-form-section">
                <h2 className="admin-form-section__title">
                  <User size={16} style={{ verticalAlign: "middle", marginRight: 6 }} />
                  Author Details
                </h2>
                <div className="admin-form-grid">
                  <div className="admin-form-group admin-form-group--full">
                    <label className="admin-form-label" htmlFor="authorName">
                      Author Name <span>*</span>
                    </label>
                    <input
                      id="authorName"
                      className="admin-form-input"
                      value={name}
                      onChange={(e) => handleNameChange(e.target.value)}
                      required
                    />
                  </div>
                  <div className="admin-form-group admin-form-group--full">
                    <label className="admin-form-label" htmlFor="authorSlug">
                      Author Slug <span>*</span>
                    </label>
                    <input
                      id="authorSlug"
                      className="admin-form-input"
                      value={authorSlug}
                      onChange={(e) => setAuthorSlug(slugify(e.target.value))}
                      placeholder="john-doe"
                      required
                    />
                  </div>
                  {authorSlug && (
                    <div className="admin-form-group admin-form-group--full">
                      <div className="admin-slug-preview">
                        <Link2 size={15} />
                        Live page:{" "}
                        <a href={getAuthorPageUrl(authorSlug)} target="_blank" rel="noopener noreferrer">
                          {getAuthorPageUrl(authorSlug)}
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
                  Author Image
                </h2>
                <input
                  id="author-file-upload"
                  ref={fileInputRef}
                  type="file"
                  className="admin-upload__input"
                  accept=".jpg,.jpeg,.png,.webp"
                  onChange={handleFileInput}
                />
                {!previewURL ? (
                  <label htmlFor="author-file-upload" className="admin-upload">
                    <div className="admin-upload__icon">
                      <Upload size={22} />
                    </div>
                    <p className="admin-upload__title">Drop image here or browse</p>
                    <p className="admin-upload__text">Supports JPG, PNG, WEBP</p>
                    <span className="admin-upload__browse">
                      <Image size={14} /> Choose Image
                    </span>
                  </label>
                ) : (
                  <div className="admin-gallery-preview">
                    <div className="admin-preview__header">
                      <span>Preview</span>
                      <div className="admin-action-group">
                        <button
                          type="button"
                          className="admin-btn admin-btn--secondary"
                          style={{ padding: "6px 12px", fontSize: "0.75rem" }}
                          onClick={() => fileInputRef.current?.click()}
                        >
                          Change
                        </button>
                        <button
                          type="button"
                          className="admin-preview__remove"
                          onClick={handleRemoveFile}
                          aria-label="Remove"
                        >
                          <X size={16} />
                        </button>
                      </div>
                    </div>
                    <img src={previewURL} alt="Author preview" />
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="admin-form-card">
            <div className="admin-form-section">
              <h2 className="admin-form-section__title">Author Description</h2>
              <div className="admin-form-editor">
                <TextEditor value={description} onChange={setDescription} />
              </div>
            </div>
          </div>

          <div className="admin-form-card">
            <div className="admin-form-section">
              <div className="d-flex justify-content-between align-items-center mb-3">
                <h2 className="admin-form-section__title mb-0">
                  <Share2 size={16} style={{ verticalAlign: "middle", marginRight: 6 }} />
                  Social Media Links
                </h2>
                <button type="button" className="admin-btn admin-btn--secondary" onClick={addSocialLink}>
                  <Plus size={16} />
                  Add Link
                </button>
              </div>

              {socialLinks.length === 0 ? (
                <p className="admin-form-footer__note mb-0">
                  No social links added yet. Click &quot;Add Link&quot; to add profiles.
                </p>
              ) : (
                <div className="admin-form-stack" style={{ gap: "12px" }}>
                  {socialLinks.map((link, index) => (
                    <div key={index} className="admin-form-grid" style={{ alignItems: "end" }}>
                      <div className="admin-form-group">
                        <label className="admin-form-label">Platform</label>
                        <select
                          className="admin-form-input"
                          value={link.platform}
                          onChange={(e) => updateSocialLink(index, "platform", e.target.value)}
                        >
                          {PLATFORM_OPTIONS.map((platform) => (
                            <option key={platform} value={platform}>
                              {platform}
                            </option>
                          ))}
                        </select>
                      </div>
                      <div className="admin-form-group" style={{ flex: 1 }}>
                        <label className="admin-form-label">URL</label>
                        <input
                          className="admin-form-input"
                          type="url"
                          value={link.url}
                          onChange={(e) => updateSocialLink(index, "url", e.target.value)}
                          placeholder="https://"
                        />
                      </div>
                      <div className="admin-form-group">
                        <button
                          type="button"
                          className="admin-btn admin-btn--ghost admin-btn--danger"
                          onClick={() => removeSocialLink(index)}
                          aria-label="Remove social link"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="admin-form-footer admin-form-footer--split">
              <span className="admin-form-footer__note">Save author profile and social links.</span>
              <div className="admin-page__actions">
                <Link to="/manage-authors" className="admin-btn admin-btn--secondary">
                  Cancel
                </Link>
                <button type="submit" className="admin-btn admin-btn--primary" disabled={isSubmitting}>
                  <Save size={18} />
                  {isSubmitting ? "Saving…" : isEdit ? "Update Author" : "Create Author"}
                </button>
              </div>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
};

export default AddAuthor;

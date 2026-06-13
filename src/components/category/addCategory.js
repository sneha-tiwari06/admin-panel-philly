import React, { useState, useRef, useEffect } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import axiosInstance, { getImageUrl } from "../../utils/axiosInstnace";
import {
  ArrowLeft,
  Upload,
  FileText,
  Save,
  X,
  Layers,
  Link2,
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

function AddCategory() {
  const { id } = useParams();
  const isEdit = Boolean(id);
  const [category, setCategory] = useState("");
  const [slugURL, setSlugURL] = useState("");
  const [slugTouched, setSlugTouched] = useState(false);
  const [file, setFile] = useState(null);
  const [previewURL, setPreviewURL] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [loading, setLoading] = useState(isEdit);
  const fileInputRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    if (!id) return;

    axiosInstance
      .get(`/categories/${id}`)
      .then((response) => {
        const { category, slugURL, attached_document } = response.data;
        setCategory(category || "");
        setSlugURL(slugURL || "");
        setSlugTouched(true);
        if (attached_document) {
          setPreviewURL(getImageUrl(attached_document));
        }
      })
      .catch((err) => console.error("Error fetching category details:", err))
      .finally(() => setLoading(false));
  }, [id]);

  const handleCategoryChange = (e) => {
    const value = e.target.value;
    setCategory(value);
    if (!slugTouched && !isEdit) {
      setSlugURL(slugify(value));
    }
  };

  const handleSlugChange = (e) => {
    setSlugTouched(true);
    setSlugURL(slugify(e.target.value));
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
    setSubmitting(true);

    try {
      const formData = new FormData();
      formData.append("category", category);
      formData.append("slugURL", slugURL);

      if (file) {
        formData.append("attached_document_filename", file.name);
        formData.append("attached_document", file, file.name);
      }

      if (id) {
        await axiosInstance.post(`/categories/update/${id}`, formData, {
          headers: { "Content-Type": "multipart/form-data" },
        });
      } else {
        await axiosInstance.post("/categories/add", formData, {
          headers: { "Content-Type": "multipart/form-data" },
        });
      }

      navigate("/manage-category");
    } catch (err) {
      console.error("Error submitting category:", err);
      alert("Failed to save category. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="admin-page">
        <div className="admin-page__loading">Loading category details…</div>
      </div>
    );
  }

  const showPdfPreview = isPdfFile(file, previewURL);

  return (
    <div className="admin-page">
      <div className="admin-page__header">
        <div>
          <h1 className="admin-page__title">
            {isEdit ? "Edit Category" : "Add Category"}
          </h1>
          <p className="admin-page__subtitle">
            {isEdit
              ? "Update category details, slug URL, and attached document."
              : "Create a new tour category with a unique slug and optional file."}
          </p>
        </div>
        <Link to="/manage-category" className="admin-btn admin-btn--ghost">
          <ArrowLeft size={18} />
          Back to Categories
        </Link>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="admin-form-layout">
          <div className="admin-form-card">
            <div className="admin-form-section">
              <h2 className="admin-form-section__title">Basic Information</h2>
              <p className="admin-form-section__desc">
                Category name and URL slug used across the platform.
              </p>

              <div className="admin-form-grid">
                <div className="admin-form-group">
                  <label className="admin-form-label" htmlFor="category">
                    Category Name <span>*</span>
                  </label>
                  <input
                    id="category"
                    className="admin-form-input"
                    type="text"
                    value={category}
                    onChange={handleCategoryChange}
                    placeholder="e.g. City Tours"
                    required
                  />
                  <p className="admin-form-hint">Display name shown to users.</p>
                </div>

                <div className="admin-form-group">
                  <label className="admin-form-label" htmlFor="slugURL">
                    Slug URL <span>*</span>
                  </label>
                  <input
                    id="slugURL"
                    className="admin-form-input"
                    type="text"
                    value={slugURL}
                    onChange={handleSlugChange}
                    placeholder="e.g. city-tours"
                    required
                  />
                  <p className="admin-form-hint">URL-friendly identifier (auto-generated from name).</p>
                </div>

                {slugURL && (
                  <div className="admin-form-group admin-form-group--full">
                    <div className="admin-slug-preview">
                      <Link2 size={15} />
                      Preview: <strong>/{slugURL}</strong>
                    </div>
                  </div>
                )}
              </div>
            </div>

            <div className="admin-form-footer admin-form-footer--split">
              <span className="admin-form-footer__note">
                Fields marked with <span style={{ color: "#ef4444" }}>*</span> are required.
              </span>
              <div className="admin-page__actions">
                <Link to="/manage-category" className="admin-btn admin-btn--secondary">
                  Cancel
                </Link>
                <button
                  type="submit"
                  className="admin-btn admin-btn--primary"
                  disabled={submitting}
                >
                  <Save size={18} />
                  {submitting ? "Saving…" : isEdit ? "Update Category" : "Create Category"}
                </button>
              </div>
            </div>
          </div>

          <div className="admin-form-card">
            <div className="admin-form-section">
              <h2 className="admin-form-section__title">Category File</h2>
              <p className="admin-form-section__desc">
                Upload an image or PDF document for this category.
              </p>

              <input
                id="category-file-upload"
                ref={fileInputRef}
                type="file"
                className="admin-upload__input"
                accept=".jpg,.jpeg,.png,.pdf,image/jpeg,image/png,application/pdf"
                onChange={handleFileInput}
              />

              {!previewURL ? (
                <label
                  htmlFor="category-file-upload"
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
                  <p className="admin-upload__text">Supports JPG, PNG, and PDF up to 10MB</p>
                  <span className="admin-upload__browse">
                    <Layers size={14} />
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
                        alt="Category preview"
                        className="admin-preview__image"
                      />
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </form>
    </div>
  );
}

export default AddCategory;

import React, { useState, useEffect, useRef } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import axiosInstance, { getImageUrl } from "../../utils/axiosInstnace";
import {
  ArrowLeft,
  Save,
  Plus,
  X,
  Upload,
  Image,
} from "lucide-react";
import "../../styles/admin-page.css";

const emptyGalleryField = () => ({
  galleryAltText: "",
  file: null,
  imageUrl: "",
});

function AddGallery() {
  const { tourId, galleryId } = useParams();
  const isEdit = Boolean(galleryId);
  const navigate = useNavigate();

  const [galleryFields, setGalleryFields] = useState([emptyGalleryField()]);
  const [tourTitle, setTourTitle] = useState("");
  const [loading, setLoading] = useState(isEdit);
  const [submitting, setSubmitting] = useState(false);
  const fileInputRefs = useRef([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        if (tourId) {
          const tourRes = await axiosInstance.get(`/tours/${tourId}`);
          setTourTitle(tourRes.data?.data?.metaTitle || "");
        }

        if (galleryId) {
          const response = await axiosInstance.get(`/gallery/single/${galleryId}`);
          const data = response.data;

          setGalleryFields([
            {
              galleryAltText: data.galleryAltText || "",
              file: null,
              imageUrl: getImageUrl(data.imagePath),
            },
          ]);
        }
      } catch (err) {
        console.error("Error fetching gallery data:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [galleryId, tourId]);

  const handleInputChange = (index, e) => {
    const { name, value, files } = e.target;
    const updatedFields = [...galleryFields];

    if (name === "file") {
      const selectedFile = files[0];
      if (!selectedFile) return;
      updatedFields[index].file = selectedFile;
      updatedFields[index].imageUrl = URL.createObjectURL(selectedFile);
    } else {
      updatedFields[index][name] = value;
    }

    setGalleryFields(updatedFields);
  };

  const handleAddField = () => {
    setGalleryFields([...galleryFields, emptyGalleryField()]);
  };

  const handleRemoveField = (index) => {
    if (galleryFields.length === 1) return;
    setGalleryFields(galleryFields.filter((_, i) => i !== index));
  };

  const handleRemoveImage = (index) => {
    const updatedFields = [...galleryFields];
    updatedFields[index].file = null;
    updatedFields[index].imageUrl = "";
    if (fileInputRefs.current[index]) {
      fileInputRefs.current[index].value = "";
    }
    setGalleryFields(updatedFields);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      const formData = new FormData();
      formData.append("tourId", tourId);

      const firstFile = galleryFields.find((f) => f.file);
      if (firstFile?.file && galleryId) {
        formData.append("attached_document_filename", firstFile.file.name);
      }

      formData.append(
        "galleryData",
        JSON.stringify(
          galleryFields.map((field) => ({
            galleryAltText: field.galleryAltText,
            fileName: field.file?.name || "",
          }))
        )
      );

      galleryFields.forEach((field) => {
        if (field.file) {
          formData.append("files", field.file, field.file.name);
        }
      });

      if (galleryId) {
        await axiosInstance.post(`/gallery/update/${galleryId}`, formData, {
          headers: { "Content-Type": "multipart/form-data" },
        });
      } else {
        await axiosInstance.post("/gallery", formData, {
          headers: { "Content-Type": "multipart/form-data" },
        });
      }

      navigate(`/manage-gallery/${tourId}`);
    } catch (err) {
      console.error("Error submitting gallery:", err);
      alert("Failed to save gallery. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="admin-page">
        <div className="admin-page__loading">Loading gallery details…</div>
      </div>
    );
  }

  return (
    <div className="admin-page">
      <div className="admin-page__header">
        <div>
          <h1 className="admin-page__title">
            {isEdit ? "Edit Gallery Image" : "Add Gallery Images"}
          </h1>
          <p className="admin-page__subtitle">
            {tourTitle
              ? `${isEdit ? "Update" : "Upload"} gallery images for "${tourTitle}"`
              : "Add alt text and images for the tour gallery."}
          </p>
        </div>
        <Link to={`/manage-gallery/${tourId}`} className="admin-btn admin-btn--ghost">
          <ArrowLeft size={18} />
          Back to Gallery
        </Link>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="admin-form-stack">
          {galleryFields.map((gallery, index) => {
            const inputId = `gallery-file-${index}`;

            return (
              <div className="admin-form-card admin-gallery-item-card" key={index}>
                <div className="admin-gallery-item-card__header">
                  <h2 className="admin-gallery-item-card__title">
                    {isEdit ? "Gallery Image" : `Image ${index + 1}`}
                  </h2>
                  {!isEdit && galleryFields.length > 1 && (
                    <button
                      type="button"
                      className="admin-btn admin-btn--icon admin-btn--delete"
                      onClick={() => handleRemoveField(index)}
                      aria-label="Remove gallery item"
                    >
                      <X size={15} />
                    </button>
                  )}
                </div>

                <div className="admin-form-layout">
                  <div>
                    <div className="admin-form-group" style={{ marginBottom: 16 }}>
                      <label className="admin-form-label" htmlFor={`alt-${index}`}>
                        Gallery Alt Text <span>*</span>
                      </label>
                      <input
                        id={`alt-${index}`}
                        type="text"
                        className="admin-form-input"
                        name="galleryAltText"
                        value={gallery.galleryAltText}
                        onChange={(e) => handleInputChange(index, e)}
                        placeholder="Describe the image for accessibility"
                        required
                      />
                      <p className="admin-form-hint">
                        Used for SEO and screen readers.
                      </p>
                    </div>

                    <input
                      id={inputId}
                      ref={(el) => {
                        fileInputRefs.current[index] = el;
                      }}
                      type="file"
                      className="admin-upload__input"
                      name="file"
                      accept="image/*"
                      onChange={(e) => handleInputChange(index, e)}
                      required={!isEdit && !gallery.imageUrl}
                    />

                    {!gallery.imageUrl ? (
                      <label htmlFor={inputId} className="admin-upload">
                        <div className="admin-upload__icon">
                          <Upload size={22} />
                        </div>
                        <p className="admin-upload__title">Drop image here or browse</p>
                        <p className="admin-upload__text">Supports JPG, PNG, WEBP</p>
                        <span className="admin-upload__browse">
                          <Image size={14} />
                          Choose Image
                        </span>
                      </label>
                    ) : null}
                  </div>

                  <div className="admin-gallery-preview">
                    {gallery.imageUrl ? (
                      <>
                        <div className="admin-preview__header">
                          <span>Preview</span>
                          <div className="admin-action-group">
                            <button
                              type="button"
                              className="admin-btn admin-btn--secondary"
                              style={{ padding: "6px 12px", fontSize: "0.75rem" }}
                              onClick={() => fileInputRefs.current[index]?.click()}
                            >
                              Change
                            </button>
                            <button
                              type="button"
                              className="admin-preview__remove"
                              onClick={() => handleRemoveImage(index)}
                              aria-label="Remove image"
                            >
                              <X size={16} />
                            </button>
                          </div>
                        </div>
                        <img src={gallery.imageUrl} alt={gallery.galleryAltText || "Preview"} />
                      </>
                    ) : (
                      <div className="admin-gallery-preview__placeholder">
                        <Image size={32} />
                        <span>Image preview will appear here</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}

          {!isEdit && (
            <button
              type="button"
              className="admin-btn admin-btn--secondary"
              onClick={handleAddField}
            >
              <Plus size={16} />
              Add Another Image
            </button>
          )}

          <div className="admin-form-card">
            <div className="admin-form-footer admin-form-footer--split" style={{ marginTop: 0, paddingTop: 0, borderTop: "none" }}>
              <span className="admin-form-footer__note">
                {isEdit
                  ? "Leave image unchanged if you only want to update alt text."
                  : "You can upload multiple images at once."}
              </span>
              <div className="admin-page__actions">
                <Link to={`/manage-gallery/${tourId}`} className="admin-btn admin-btn--secondary">
                  Cancel
                </Link>
                <button
                  type="submit"
                  className="admin-btn admin-btn--primary"
                  disabled={submitting}
                >
                  <Save size={18} />
                  {submitting ? "Saving…" : isEdit ? "Update Gallery" : "Add Gallery"}
                </button>
              </div>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
}

export default AddGallery;

import React, { useState, useEffect, useRef } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import axiosInstance, { getImageUrl, getItineraryPageUrl } from "../../utils/axiosInstnace";
import TextEditor from "../../common/ckEditor";
import {
  ArrowLeft,
  Save,
  Search,
  Upload,
  Image,
  X,
  Link2,
  MapPin,
  Clock,
  Sun,
  Home,
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

const AddItinerary = () => {
  const { slug } = useParams();
  const isEdit = Boolean(slug);
  const navigate = useNavigate();

  const [metaTitle, setMetaTitle] = useState("");
  const [metaKeywords, setMetaKeywords] = useState("");
  const [metaDescription, setMetaDescription] = useState("");
  const [title, setTitle] = useState("");
  const [itinerarySlug, setItinerarySlug] = useState("");
  const [slugTouched, setSlugTouched] = useState(false);
  const [shortDescription, setShortDescription] = useState("");
  const [imageAlt, setImageAlt] = useState("");
  const [location, setLocation] = useState("");
  const [duration, setDuration] = useState("");
  const [bestTimeToVisit, setBestTimeToVisit] = useState("");
  const [showOnHomepage, setShowOnHomepage] = useState(false);
  const [active, setActive] = useState(true);
  const [file, setFile] = useState(null);
  const [previewURL, setPreviewURL] = useState("");
  const [loading, setLoading] = useState(isEdit);
  const [submitting, setSubmitting] = useState(false);
  const [slugCheck, setSlugCheck] = useState({
    status: "idle",
    available: true,
    existingTitle: "",
    existingSlug: "",
  });
  const fileInputRef = useRef(null);

  useEffect(() => {
    if (!slug) return;

    setLoading(true);
    axiosInstance
      .get(`/itineraries/admin/${slug}`)
      .then((response) => {
        const data = response.data;
        setMetaTitle(data.metaTitle || "");
        setMetaKeywords(data.metaKeywords || "");
        setMetaDescription(data.metaDescription || "");
        setTitle(data.title || "");
        setItinerarySlug(data.slug || "");
        setShortDescription(data.shortDescription || "");
        setImageAlt(data.imageAlt || "");
        setLocation(data.location || "");
        setDuration(data.duration || "");
        setBestTimeToVisit(data.bestTimeToVisit || "");
        setShowOnHomepage(data.showOnHomepage || false);
        setActive(data.active !== false);
        setSlugTouched(true);
        if (data.image) {
          setPreviewURL(getImageUrl(data.image));
        }
      })
      .catch((err) => {
        console.error("Error fetching itinerary:", err);
        alert("Failed to load itinerary.");
      })
      .finally(() => setLoading(false));
  }, [slug]);

  useEffect(() => {
    if (!itinerarySlug.trim()) {
      setSlugCheck({ status: "idle", available: true, existingTitle: "", existingSlug: "" });
      return;
    }

    setSlugCheck((prev) => ({ ...prev, status: "checking" }));

    const timer = setTimeout(async () => {
      try {
        const params = slug ? { exclude: slug } : {};
        const response = await axiosInstance.get(`/itineraries/check-slug/${itinerarySlug}`, {
          params,
        });
        setSlugCheck({
          status: "done",
          available: response.data.available,
          existingTitle: response.data.existingTitle || "",
          existingSlug: response.data.existingSlug || "",
        });
      } catch (err) {
        setSlugCheck({
          status: "error",
          available: true,
          existingTitle: "",
          existingSlug: "",
        });
      }
    }, 400);

    return () => clearTimeout(timer);
  }, [itinerarySlug, slug]);

  const handleTitleChange = (e) => {
    const value = e.target.value;
    setTitle(value);
    if (!slugTouched && !isEdit) {
      setItinerarySlug(slugify(value));
    }
  };

  const handleSlugChange = (e) => {
    setSlugTouched(true);
    setItinerarySlug(slugify(e.target.value));
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

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (submitting) return;

    if (!itinerarySlug.trim()) {
      alert("Please enter a valid slug.");
      return;
    }

    if (slugCheck.status === "checking") {
      alert("Please wait while the slug is being checked.");
      return;
    }

    if (!slugCheck.available) {
      alert(
        slugCheck.existingTitle
          ? `Slug "${itinerarySlug}" is already used by "${slugCheck.existingTitle}". Please choose a different slug or edit the existing itinerary.`
          : `Slug "${itinerarySlug}" is already in use. Please choose a different slug.`
      );
      return;
    }

    setSubmitting(true);

    try {
      const formData = new FormData();
      formData.append("metaTitle", metaTitle);
      formData.append("metaKeywords", metaKeywords);
      formData.append("metaDescription", metaDescription);
      formData.append("title", title);
      formData.append("slug", itinerarySlug);
      formData.append("shortDescription", shortDescription);
      formData.append("imageAlt", imageAlt);
      formData.append("location", location);
      formData.append("duration", duration);
      formData.append("bestTimeToVisit", bestTimeToVisit);
      formData.append("showOnHomepage", showOnHomepage);
      formData.append("active", active);

      if (file) {
        formData.append("image_filename", file.name);
        formData.append("image", file, file.name);
      }

      if (slug) {
        await axiosInstance.post(`/itineraries/update/${slug}`, formData, {
          headers: { "Content-Type": "multipart/form-data" },
        });
      } else {
        await axiosInstance.post("/itineraries/add", formData, {
          headers: { "Content-Type": "multipart/form-data" },
        });
      }

      navigate("/manage-itineraries");
    } catch (err) {
      console.error("Error submitting itinerary:", err);
      const data = err.response?.data;
      if (data?.error === "DUPLICATE_SLUG") {
        alert(
          data.message ||
            `Slug "${itinerarySlug}" already exists. Please use a different slug or edit the existing itinerary.`
        );
        setSlugCheck({
          status: "done",
          available: false,
          existingTitle: data.existingTitle || "",
          existingSlug: data.existingSlug || itinerarySlug,
        });
      } else {
        alert(data?.message || data?.error || "Failed to save itinerary.");
      }
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="admin-page">
        <div className="admin-page__loading">Loading itinerary…</div>
      </div>
    );
  }

  return (
    <div className="admin-page">
      <div className="admin-page__header">
        <div>
          <h1 className="admin-page__title">{isEdit ? "Edit Itinerary" : "Add Itinerary"}</h1>
          <p className="admin-page__subtitle">
            {isEdit
              ? "Update itinerary card details, SEO settings, and quick facts."
              : "Create a new itinerary with listing card info and SEO metadata."}
          </p>
        </div>
        <Link to="/manage-itineraries" className="admin-btn admin-btn--ghost">
          <ArrowLeft size={18} />
          Back to Itineraries
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
                  <MapPin size={16} style={{ verticalAlign: "middle", marginRight: 6 }} />
                  Itinerary Details
                </h2>
                <div className="admin-form-grid">
                  <div className="admin-form-group admin-form-group--full">
                    <label className="admin-form-label" htmlFor="title">
                      Title <span>*</span>
                    </label>
                    <input
                      id="title"
                      className="admin-form-input"
                      value={title}
                      onChange={handleTitleChange}
                      required
                    />
                  </div>
                  <div className="admin-form-group admin-form-group--full">
                    <label className="admin-form-label" htmlFor="itinerarySlug">
                      Slug / URL <span>*</span>
                    </label>
                    <input
                      id="itinerarySlug"
                      className="admin-form-input"
                      value={itinerarySlug}
                      onChange={handleSlugChange}
                      required
                    />
                    {itinerarySlug && slugCheck.status === "checking" && (
                      <p className="admin-form-hint">Checking slug availability…</p>
                    )}
                    {itinerarySlug && slugCheck.status === "done" && slugCheck.available && (
                      <p className="admin-form-hint" style={{ color: "#16a34a" }}>
                        This slug is available.
                      </p>
                    )}
                    {itinerarySlug && slugCheck.status === "done" && !slugCheck.available && (
                      <p className="admin-form-hint" style={{ color: "#dc2626" }}>
                        Slug already used
                        {slugCheck.existingTitle ? ` by "${slugCheck.existingTitle}"` : ""}.{" "}
                        {slugCheck.existingSlug && (
                          <Link to={`/edit-itinerary/${slugCheck.existingSlug}`}>
                            Edit existing itinerary
                          </Link>
                        )}
                      </p>
                    )}
                  </div>
                  {itinerarySlug && (
                    <div className="admin-form-group admin-form-group--full">
                      <div className="admin-slug-preview">
                        <Link2 size={15} />
                        Live page:{" "}
                        <a
                          href={getItineraryPageUrl(itinerarySlug)}
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          {getItineraryPageUrl(itinerarySlug)}
                        </a>
                      </div>
                    </div>
                  )}
                  <div className="admin-form-group">
                    <label className="admin-form-label" htmlFor="location">
                      Location <span>*</span>
                    </label>
                    <input
                      id="location"
                      className="admin-form-input"
                      value={location}
                      onChange={(e) => setLocation(e.target.value)}
                      required
                    />
                  </div>
                  <div className="admin-form-group">
                    <label className="admin-form-label" htmlFor="duration">
                      Typical Stop <span>*</span>
                    </label>
                    <input
                      id="duration"
                      className="admin-form-input"
                      value={duration}
                      onChange={(e) => setDuration(e.target.value)}
                      placeholder="e.g. 10–15 min stop"
                      required
                    />
                  </div>
                  <div className="admin-form-group admin-form-group--full">
                    <label className="admin-form-label" htmlFor="bestTimeToVisit">
                      Best Time to Visit <span>*</span>
                    </label>
                    <input
                      id="bestTimeToVisit"
                      className="admin-form-input"
                      value={bestTimeToVisit}
                      onChange={(e) => setBestTimeToVisit(e.target.value)}
                      placeholder="e.g. Year-round"
                      required
                    />
                  </div>
                  <div className="admin-form-group admin-form-group--full">
                    <label className="admin-form-label" htmlFor="imageAlt">
                      Image Alt Text <span>*</span>
                    </label>
                    <input
                      id="imageAlt"
                      className="admin-form-input"
                      value={imageAlt}
                      onChange={(e) => setImageAlt(e.target.value)}
                      required
                    />
                  </div>
                  {/* <div className="admin-form-group">
                    <label className="admin-form-label admin-form-label--checkbox">
                      <input
                        type="checkbox"
                        checked={showOnHomepage}
                        onChange={(e) => setShowOnHomepage(e.target.checked)}
                      />
                      <Home size={14} style={{ marginRight: 6 }} />
                      Show on Homepage
                    </label>
                  </div> */}
                  <div className="admin-form-group">
                    <label className="admin-form-label admin-form-label--checkbox">
                      <input
                        type="checkbox"
                        checked={active}
                        onChange={(e) => setActive(e.target.checked)}
                      />
                      Active
                    </label>
                  </div>
                </div>
              </div>
            </div>

            <div className="admin-form-card">
              <div className="admin-form-section">
                <h2 className="admin-form-section__title">
                  <Image size={16} style={{ verticalAlign: "middle", marginRight: 6 }} />
                  Itinerary Thumbnail Image
                </h2>
                <input
                  id="itinerary-image-upload"
                  ref={fileInputRef}
                  type="file"
                  className="admin-upload__input"
                  accept=".jpg,.jpeg,.png,.webp,image/jpeg,image/png,image/webp"
                  onChange={handleFileInput}
                />

                {!previewURL ? (
                  <label htmlFor="itinerary-image-upload" className="admin-upload">
                    <div className="admin-upload__icon">
                      <Upload size={22} />
                    </div>
                    <p className="admin-upload__title">Drop image here or browse</p>
                    <p className="admin-upload__text">Supports JPG, PNG, WEBP</p>
                    <span className="admin-upload__browse">
                      <Image size={14} />
                      Choose File
                    </span>
                  </label>
                ) : (
                  <div className="admin-preview">
                    <div className="admin-preview__header">
                      <span>Image Preview</span>
                      <div className="admin-action-group">
                        <button
                          type="button"
                          className="admin-btn admin-btn--secondary"
                          style={{ padding: "6px 12px", fontSize: "0.75rem" }}
                          onClick={() => fileInputRef.current?.click()}
                        >
                          Change Image
                        </button>
                        <button
                          type="button"
                          className="admin-preview__remove"
                          onClick={handleRemoveFile}
                          aria-label="Remove image"
                        >
                          <X size={16} />
                        </button>
                      </div>
                    </div>
                    <div className="admin-preview__body">
                      <img src={previewURL} alt="Itinerary preview" className="admin-preview__image" />
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="admin-form-card">
            <div className="admin-form-section">
              <h2 className="admin-form-section__title">Short Description</h2>
              <p className="admin-form-section__desc">
                Brief intro shown at the top of the itinerary detail page.
              </p>
              <div className="admin-form-editor">
                <TextEditor value={shortDescription} onChange={setShortDescription} height={120} />
              </div>
            </div>
          </div>

          <div className="admin-form-card">
            <div className="admin-form-footer admin-form-footer--split">
              <span className="admin-form-footer__note">
                After saving, add full page content in{" "}
                <Link to="/manage-itinerary-details">Itinerary Details</Link>.
              </span>
              <div className="admin-page__actions">
                <Link to="/manage-itineraries" className="admin-btn admin-btn--secondary">
                  Cancel
                </Link>
                <button
                  type="submit"
                  className="admin-btn admin-btn--primary"
                  disabled={submitting || (itinerarySlug && !slugCheck.available)}
                >
                  <Save size={18} />
                  {submitting ? "Saving…" : isEdit ? "Update Itinerary" : "Create Itinerary"}
                </button>
              </div>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
};

export default AddItinerary;

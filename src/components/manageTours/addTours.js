import React, { useState, useEffect } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import axiosInstance, { getTourPageUrl } from "../../utils/axiosInstnace";
import TextEditor from "../../common/ckEditor";
import {
  ArrowLeft,
  Save,
  Plus,
  X,
  Link2,
  Search,
  MapPin,
  DollarSign,
  FileText,
  Code,
  Home,
} from "lucide-react";
import "../../styles/admin-page.css";

const PRIVATE_TOUR_CATEGORIES = [
  "4 Seater Private Tours (2hr)",
  "7 Seater Private Tours (2hr)",
  "4 Seater Private Tours (1hr)",
  "7 Seater Private Tours (1hr)",
];

function isPrivateTourCategory(categoryName) {
  return PRIVATE_TOUR_CATEGORIES.includes(categoryName);
}

function AddTours() {
  const { id } = useParams();
  const isEdit = Boolean(id);
  const navigate = useNavigate();

  const [metaTitle, setMetaTitle] = useState("");
  const [metaKeywords, setMetaKeywords] = useState("");
  const [metaDescription, setMetaDescription] = useState("");
  const [metaTags, setMetaTags] = useState([""]);

  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState(null);

  const [slugURL, setSlugURL] = useState("");
  const [content, setContent] = useState("");

  const [tourPrice, setTourPrice] = useState("");
  const [adultPrice, setAdultPrice] = useState("");
  const [kidsPrice, setKidsPrice] = useState("");
  const [showOnHomepage, setShowOnHomepage] = useState(false);
  const [tourSchema, setTourSchema] = useState("");

  const [loading, setLoading] = useState(isEdit);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const categoriesRes = await axiosInstance.get("/categories");
        setCategories(categoriesRes.data || []);

        if (id) {
          const response = await axiosInstance.get(`/tours/${id}`);
          const data = response.data.data;

          setMetaTitle(data.metaTitle || "");
          setMetaKeywords(data.metaKeywords || "");
          setMetaDescription(data.metaDescription || "");
          setMetaTags(data.metaTags?.length ? data.metaTags : [""]);
          setSlugURL(data.slugURL || "");
          setContent(data.content || "");
          setSelectedCategory(data.selectedCategory || null);
          setTourPrice(data.tourPrice || "");
          setAdultPrice(data.adultPrice || "");
          setKidsPrice(data.kidsPrice || "");
          setShowOnHomepage(data.showOnHome || false);
          setTourSchema(data.tourSchema || "");
        }
      } catch (err) {
        console.error("Error loading tour form:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [id]);

  const handleCategoryChange = (e) => {
    const selectedId = e.target.value;
    const categoryObj = categories.find((cat) => cat._id === selectedId);
    setSelectedCategory(categoryObj || null);
    setSlugURL(categoryObj?.slugURL || "");
  };

  const isPrivateTour = isPrivateTourCategory(selectedCategory?.category);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      const formData = new FormData();
      formData.append("metaTitle", metaTitle);
      formData.append("metaKeywords", metaKeywords);
      formData.append("metaDescription", metaDescription);
      formData.append("category", selectedCategory?._id || "");
      formData.append("slugURL", slugURL);
      formData.append("content", content);
      formData.append("tourSchema", tourSchema);
      formData.append("metaTags", JSON.stringify(metaTags));

      if (isPrivateTour) {
        formData.append("tourPrice", tourPrice);
      } else {
        formData.append("adultPrice", adultPrice);
        formData.append("kidsPrice", kidsPrice);
      }
      formData.append("showOnHomepage", showOnHomepage);

      if (id) {
        await axiosInstance.post(`/tours/update/${id}`, formData);
      } else {
        await axiosInstance.post("/tours", formData);
      }

      navigate("/manage-tours");
    } catch (err) {
      console.error("Error submitting tour:", err);
      alert("Failed to save tour. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  const addMetaTag = () => setMetaTags([...metaTags, ""]);
  const removeMetaTag = (index) =>
    setMetaTags(metaTags.filter((_, i) => i !== index));
  const handleMetaChange = (index, value) => {
    const updated = [...metaTags];
    updated[index] = value;
    setMetaTags(updated);
  };

  if (loading) {
    return (
      <div className="admin-page">
        <div className="admin-page__loading">Loading tour details…</div>
      </div>
    );
  }

  return (
    <div className="admin-page">
      <div className="admin-page__header">
        <div>
          <h1 className="admin-page__title">{isEdit ? "Edit Tour" : "Add Tour"}</h1>
          <p className="admin-page__subtitle">
            {isEdit
              ? "Update tour content, pricing, SEO settings, and schema markup."
              : "Create a new tour with category, pricing, description, and SEO metadata."}
          </p>
        </div>
        <Link to="/manage-tours" className="admin-btn admin-btn--ghost">
          <ArrowLeft size={18} />
          Back to Tours
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
              <p className="admin-form-section__desc">
                Meta tags used for search engines and social sharing.
              </p>

              <div className="admin-form-grid">
                <div className="admin-form-group">
                  <label className="admin-form-label" htmlFor="metaTitle">
                    Meta Title <span>*</span>
                  </label>
                  <input
                    id="metaTitle"
                    className="admin-form-input"
                    type="text"
                    value={metaTitle}
                    onChange={(e) => setMetaTitle(e.target.value)}
                    placeholder="Philadelphia Day Tour – Explore the City in 2 Hour"
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
                    type="text"
                    value={metaKeywords}
                    onChange={(e) => setMetaKeywords(e.target.value)}
                    placeholder="philadelphia tours, day tour, city tour"
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
                    placeholder="Brief description for search engine results…"
                    required
                  />
                </div>

                <div className="admin-form-group admin-form-group--full">
                  <label className="admin-form-label">Additional Meta Tags</label>
                  <div className="admin-meta-tags">
                    {metaTags.map((tag, idx) => (
                      <div className="admin-meta-tag-row" key={idx}>
                        <input
                          type="text"
                          className="admin-form-input"
                          value={tag}
                          onChange={(e) => handleMetaChange(idx, e.target.value)}
                          placeholder={`Meta tag ${idx + 1}`}
                        />
                        {idx > 0 && (
                          <button
                            type="button"
                            className="admin-btn admin-btn--icon admin-btn--delete"
                            onClick={() => removeMetaTag(idx)}
                            aria-label="Remove meta tag"
                          >
                            <X size={15} />
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                  <button
                    type="button"
                    className="admin-btn admin-btn--secondary"
                    style={{ marginTop: 10 }}
                    onClick={addMetaTag}
                  >
                    <Plus size={16} />
                    Add Meta Tag
                  </button>
                </div>
              </div>
            </div>
          </div>

          <div className="admin-form-layout">
            <div className="admin-form-card">
              <div className="admin-form-section">
                <h2 className="admin-form-section__title">
                  <MapPin size={16} style={{ verticalAlign: "middle", marginRight: 6 }} />
                  Tour Setup
                </h2>
                <p className="admin-form-section__desc">
                  Category, pricing, and visibility settings.
                </p>

                <div className="admin-form-grid">
                  <div className="admin-form-group admin-form-group--full">
                    <label className="admin-form-label" htmlFor="category">
                      Category <span>*</span>
                    </label>
                    <select
                      id="category"
                      className="admin-form-select"
                      value={selectedCategory?._id || ""}
                      onChange={handleCategoryChange}
                      required
                    >
                      <option value="">Select a category</option>
                      {categories.map((cat) => (
                        <option key={cat._id} value={cat._id}>
                          {cat.category}
                        </option>
                      ))}
                    </select>
                    <p className="admin-form-hint">
                      Slug URL is auto-set from the selected category.
                    </p>
                  </div>

                  {selectedCategory && (
                    <div className="admin-form-group admin-form-group--full">
                      {isPrivateTour ? (
                        <span className="admin-price-badge">
                          <DollarSign size={14} />
                          Private tour — single flat price
                        </span>
                      ) : (
                        <span className="admin-price-badge">
                          <DollarSign size={14} />
                          Group tour — adult & kids pricing
                        </span>
                      )}
                    </div>
                  )}

                  {isPrivateTour ? (
                    <div className="admin-form-group admin-form-group--full">
                      <label className="admin-form-label" htmlFor="tourPrice">
                        Tour Price
                      </label>
                      <input
                        id="tourPrice"
                        className="admin-form-input"
                        type="text"
                        value={tourPrice}
                        onChange={(e) => setTourPrice(e.target.value)}
                        placeholder="e.g. 299"
                      />
                    </div>
                  ) : (
                    <>
                      <div className="admin-form-group">
                        <label className="admin-form-label" htmlFor="adultPrice">
                          Adult Price
                        </label>
                        <input
                          id="adultPrice"
                          className="admin-form-input"
                          type="text"
                          value={adultPrice}
                          onChange={(e) => setAdultPrice(e.target.value)}
                          placeholder="e.g. 69"
                        />
                      </div>
                      <div className="admin-form-group">
                        <label className="admin-form-label" htmlFor="kidsPrice">
                          Kids Price
                        </label>
                        <input
                          id="kidsPrice"
                          className="admin-form-input"
                          type="text"
                          value={kidsPrice}
                          onChange={(e) => setKidsPrice(e.target.value)}
                          placeholder="e.g. 49"
                        />
                      </div>
                    </>
                  )}

                  <div className="admin-form-group admin-form-group--full">
                    <label className="admin-form-label" htmlFor="slugURL">
                      Tour Slug URL
                    </label>
                    <input
                      id="slugURL"
                      className="admin-form-input admin-form-input--readonly"
                      type="text"
                      value={slugURL}
                      readOnly
                    />
                    {slugURL && (
                      <div className="admin-slug-preview" style={{ marginTop: 10 }}>
                        <Link2 size={15} />
                        Live page:{" "}
                        <a
                          href={getTourPageUrl(slugURL)}
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          {getTourPageUrl(slugURL)}
                        </a>
                      </div>
                    )}
                  </div>

                  <div className="admin-form-group admin-form-group--full">
                    <label className="admin-form-checkbox" htmlFor="showOnHomepage">
                      <input
                        type="checkbox"
                        id="showOnHomepage"
                        checked={showOnHomepage}
                        onChange={(e) => setShowOnHomepage(e.target.checked)}
                      />
                      <Home size={16} />
                      <span>Show on Homepage</span>
                    </label>
                  </div>
                </div>
              </div>
            </div>

            <div className="admin-form-card">
              <div className="admin-form-section">
                <h2 className="admin-form-section__title">
                  <Code size={16} style={{ verticalAlign: "middle", marginRight: 6 }} />
                  Schema Markup
                </h2>
                <p className="admin-form-section__desc">
                  JSON-LD or structured data for rich search results.
                </p>
                <div className="admin-form-group">
                  <label className="admin-form-label" htmlFor="tourSchema">
                    Tour Schema <span>*</span>
                  </label>
                  <textarea
                    id="tourSchema"
                    className="admin-form-textarea admin-form-textarea--code"
                    value={tourSchema}
                    onChange={(e) => setTourSchema(e.target.value)}
                    placeholder='{"@context": "https://schema.org", ...}'
                    required
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="admin-form-card">
            <div className="admin-form-section">
              <h2 className="admin-form-section__title">
                <FileText size={16} style={{ verticalAlign: "middle", marginRight: 6 }} />
                Tour Description
              </h2>
              <p className="admin-form-section__desc">
                Full tour content displayed on the public tour page.
              </p>
              <div className="admin-form-editor">
                <TextEditor value={content} onChange={setContent} />
              </div>
            </div>
          </div>

          <div className="admin-form-card">
            <div className="admin-form-footer admin-form-footer--split" style={{ marginTop: 0, paddingTop: 0, borderTop: "none" }}>
              <span className="admin-form-footer__note">
                Fields marked with <span style={{ color: "#ef4444" }}>*</span> are required.
              </span>
              <div className="admin-page__actions">
                <Link to="/manage-tours" className="admin-btn admin-btn--secondary">
                  Cancel
                </Link>
                <button
                  type="submit"
                  className="admin-btn admin-btn--primary"
                  disabled={submitting}
                >
                  <Save size={18} />
                  {submitting ? "Saving…" : isEdit ? "Update Tour" : "Create Tour"}
                </button>
              </div>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
}

export default AddTours;

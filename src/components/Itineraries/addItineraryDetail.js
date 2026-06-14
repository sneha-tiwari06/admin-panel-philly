import React, { useEffect, useState, useRef } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import axiosInstance, { getImageUrl, getItineraryPageUrl } from "../../utils/axiosInstnace";
import TextEditor from "../../common/ckEditor";
import { ArrowLeft, Save, Plus, X, FileText, HelpCircle, List, Image, Upload } from "lucide-react";
import "../../styles/admin-page.css";

const initialFaqItem = () => ({ question: "", answer: "" });

const AddItineraryDetail = () => {
  const { slug } = useParams();
  const navigate = useNavigate();

  const [itineraryTitle, setItineraryTitle] = useState("");
  const [content, setContent] = useState("");
  const [tableContent, setTableContent] = useState("");
  const [highlights, setHighlights] = useState([""]);
  const [faqs, setFaqs] = useState([initialFaqItem()]);
  const [file, setFile] = useState(null);
  const [previewURL, setPreviewURL] = useState("");
  const [removeDetailImage, setRemoveDetailImage] = useState(false);
  const fileInputRef = useRef(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [hasExistingDetail, setHasExistingDetail] = useState(false);

  useEffect(() => {
    if (!slug) return;

    const fetchData = async () => {
      try {
        const [itineraryRes, detailRes] = await Promise.all([
          axiosInstance.get(`/itineraries/admin/${slug}`),
          axiosInstance.get(`/itinerary-details/${slug}`).catch(() => ({ data: null })),
        ]);

        setItineraryTitle(itineraryRes.data?.title || slug);

        if (detailRes.data) {
          const detail = detailRes.data;
          setContent(detail.content || "");
          setTableContent(detail.tableContent || "");
          setHighlights(detail.highlights?.length ? detail.highlights : [""]);
          setFaqs(detail.faqs?.length ? detail.faqs : [initialFaqItem()]);
          if (detail.detailImage) {
            setPreviewURL(getImageUrl(detail.detailImage));
          }
          setHasExistingDetail(true);
        }
      } catch (err) {
        console.error("Error loading itinerary detail:", err);
        alert("Failed to load itinerary detail.");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [slug]);

  const addHighlight = () => setHighlights((prev) => [...prev, ""]);
  const removeHighlight = (index) =>
    setHighlights((prev) => (prev.length <= 1 ? prev : prev.filter((_, i) => i !== index)));
  const updateHighlight = (index, value) => {
    setHighlights((prev) => {
      const next = [...prev];
      next[index] = value;
      return next;
    });
  };

  const addFaq = () => setFaqs((prev) => [...prev, initialFaqItem()]);
  const removeFaq = (index) =>
    setFaqs((prev) => (prev.length <= 1 ? prev : prev.filter((_, i) => i !== index)));
  const updateFaq = (index, field, value) => {
    setFaqs((prev) => {
      const next = [...prev];
      next[index] = { ...next[index], [field]: value };
      return next;
    });
  };

  const handleFileInput = (e) => {
    const selectedFile = e.target.files[0];
    if (!selectedFile) return;
    setFile(selectedFile);
    setPreviewURL(URL.createObjectURL(selectedFile));
    setRemoveDetailImage(false);
  };

  const handleRemoveFile = () => {
    setFile(null);
    setPreviewURL("");
    setRemoveDetailImage(true);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (submitting) return;
    setSubmitting(true);

    try {
      const validHighlights = highlights.filter((item) => item.trim());
      const validFaqs = faqs.filter((item) => item.question.trim() && item.answer.trim());

      const formData = new FormData();
      formData.append("content", content);
      formData.append("tableContent", tableContent);
      formData.append("highlights", JSON.stringify(validHighlights));
      formData.append("faqs", JSON.stringify(validFaqs));
      formData.append("removeDetailImage", removeDetailImage);

      if (file) {
        formData.append("detailImage_filename", file.name);
        formData.append("detailImage", file, file.name);
      }

      await axiosInstance.post(`/itinerary-details/save/${slug}`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      navigate("/manage-itinerary-details");
    } catch (err) {
      console.error("Error saving itinerary detail:", err);
      alert(err.response?.data?.message || "Failed to save itinerary detail.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteDetail = async () => {
    if (!hasExistingDetail) return;
    const confirmed = window.confirm(
      "Delete this itinerary detail content? The itinerary card will remain."
    );
    if (!confirmed) return;

    try {
      await axiosInstance.get(`/itinerary-details/delete/${slug}`);
      navigate("/manage-itinerary-details");
    } catch (err) {
      alert(err.response?.data?.message || "Failed to delete itinerary detail.");
    }
  };

  if (loading) {
    return (
      <div className="admin-page">
        <div className="admin-page__loading">Loading itinerary detail…</div>
      </div>
    );
  }

  return (
    <div className="admin-page">
      <div className="admin-page__header">
        <div>
          <h1 className="admin-page__title">
            {hasExistingDetail ? "Edit Itinerary Detail" : "Add Itinerary Detail"}
          </h1>
          <p className="admin-page__subtitle">
            {itineraryTitle} — full page content shown on the website detail page.
          </p>
          {slug && (
            <p className="admin-page__subtitle" style={{ marginTop: 4 }}>
              <a href={getItineraryPageUrl(slug)} target="_blank" rel="noopener noreferrer">
                {getItineraryPageUrl(slug)}
              </a>
            </p>
          )}
        </div>
        <Link to="/manage-itinerary-details" className="admin-btn admin-btn--ghost">
          <ArrowLeft size={18} />
          Back to Details
        </Link>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="admin-form-stack">
          <div className="admin-form-card">
            <div className="admin-form-section">
              <h2 className="admin-form-section__title">
                <Image size={16} style={{ verticalAlign: "middle", marginRight: 6 }} />
                Detail Image
              </h2>
              <p className="admin-form-section__desc">
                Large image shown on the itinerary detail page (separate from the listing card image).
              </p>
              <input
                id="detail-image-upload"
                ref={fileInputRef}
                type="file"
                className="admin-upload__input"
                accept=".jpg,.jpeg,.png,.webp"
                onChange={handleFileInput}
              />
              {!previewURL ? (
                <label htmlFor="detail-image-upload" className="admin-upload">
                  <div className="admin-upload__icon">
                    <Upload size={22} />
                  </div>
                  <p className="admin-upload__title">Drop detail image here or browse</p>
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
                  <img src={previewURL} alt="Detail preview" />
                </div>
              )}
            </div>
          </div>

          <div className="admin-form-card">
            <div className="admin-form-section">
              <h2 className="admin-form-section__title">
                <List size={16} style={{ verticalAlign: "middle", marginRight: 6 }} />
                Table of Contents
              </h2>
              <div className="admin-form-editor">
                <TextEditor value={tableContent} onChange={setTableContent} height={150} />
              </div>
            </div>
          </div>

          <div className="admin-form-card">
            <div className="admin-form-section">
              <h2 className="admin-form-section__title">
                <FileText size={16} style={{ verticalAlign: "middle", marginRight: 6 }} />
                Itinerary Description
              </h2>
              <p className="admin-form-section__desc">
                Full page content shown below the image and table of contents.
              </p>
              <div className="admin-form-editor">
                <TextEditor value={content} onChange={setContent} />
              </div>
            </div>
          </div>

          <div className="admin-form-card">
            <div className="admin-form-section">
              <h2 className="admin-form-section__title">Tour Highlights</h2>
              <p className="admin-form-section__desc">
                Add bullet points featured on the itinerary detail page.
              </p>
              {highlights.map((item, index) => (
                <div className="admin-meta-tag-row" key={index}>
                  <input
                    type="text"
                    className="admin-form-input"
                    value={item}
                    onChange={(e) => updateHighlight(index, e.target.value)}
                    placeholder="e.g. Photo opportunities at iconic landmarks"
                  />
                  <button
                    type="button"
                    className="admin-btn admin-btn--icon admin-btn--delete"
                    onClick={() => removeHighlight(index)}
                    disabled={highlights.length <= 1}
                  >
                    <X size={15} />
                  </button>
                </div>
              ))}
              <button type="button" className="admin-btn admin-btn--secondary" onClick={addHighlight}>
                <Plus size={16} />
                Add Highlight
              </button>
            </div>
          </div>

          <div className="admin-form-card">
            <div className="admin-form-section">
              <h2 className="admin-form-section__title">
                <HelpCircle size={16} style={{ verticalAlign: "middle", marginRight: 6 }} />
                FAQs
              </h2>
              {faqs.map((faq, index) => (
                <div
                  key={index}
                  style={{
                    border: "1px solid #e2e8f0",
                    borderRadius: 8,
                    padding: 16,
                    marginBottom: 12,
                  }}
                >
                  <div className="admin-form-group">
                    <label className="admin-form-label">Question</label>
                    <input
                      className="admin-form-input"
                      value={faq.question}
                      onChange={(e) => updateFaq(index, "question", e.target.value)}
                    />
                  </div>
                  <div className="admin-form-group">
                    <label className="admin-form-label">Answer</label>
                    <textarea
                      className="admin-form-textarea"
                      value={faq.answer}
                      onChange={(e) => updateFaq(index, "answer", e.target.value)}
                      rows={3}
                    />
                  </div>
                  <button
                    type="button"
                    className="admin-btn admin-btn--secondary"
                    onClick={() => removeFaq(index)}
                    disabled={faqs.length <= 1}
                  >
                    <X size={14} />
                    Remove FAQ
                  </button>
                </div>
              ))}
              <button type="button" className="admin-btn admin-btn--secondary" onClick={addFaq}>
                <Plus size={16} />
                Add FAQ
              </button>
            </div>
          </div>

          <div className="admin-form-card">
            <div className="admin-form-footer admin-form-footer--split">
              <div className="admin-page__actions">
                {hasExistingDetail && (
                  <button
                    type="button"
                    className="admin-btn admin-btn--secondary"
                    onClick={handleDeleteDetail}
                  >
                    Delete Detail
                  </button>
                )}
              </div>
              <div className="admin-page__actions">
                <Link to="/manage-itinerary-details" className="admin-btn admin-btn--secondary">
                  Cancel
                </Link>
                <button type="submit" className="admin-btn admin-btn--primary" disabled={submitting}>
                  <Save size={18} />
                  {submitting ? "Saving…" : hasExistingDetail ? "Update Detail" : "Save Detail"}
                </button>
              </div>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
};

export default AddItineraryDetail;

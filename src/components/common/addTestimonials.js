import React, { useState, useEffect } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import axiosInstance from "../../utils/axiosInstnace";
import {
  ArrowLeft,
  Save,
  MessageSquareQuote,
  Layers,
  User,
  FileText,
} from "lucide-react";
import "../../styles/admin-page.css";

const Testimonials = () => {
  const { id } = useParams();
  const isEdit = Boolean(id);
  const navigate = useNavigate();

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [author, setAuthor] = useState("");
  const [categories, setCategories] = useState([]);
  const [selectedCategoryId, setSelectedCategoryId] = useState("");
  const [loading, setLoading] = useState(isEdit);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    axiosInstance.get("/categories").then((res) => {
      setCategories(res.data || []);
    });

    if (!id) return;

    setLoading(true);
    axiosInstance
      .get(`/testimonials/${id}`)
      .then((response) => {
        const data = response.data;
        setTitle(data.title || "");
        setDescription(data.description || "");
        setAuthor(data.author || "");
        setSelectedCategoryId(data.category?._id || data.category || "");
      })
      .catch((err) => console.error("Error fetching testimonial details:", err))
      .finally(() => setLoading(false));
  }, [id]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (submitting) return;
    setSubmitting(true);

    try {
      const formData = new FormData();
      formData.append("title", title);
      formData.append("description", description);
      formData.append("author", author);
      formData.append("category", selectedCategoryId);

      if (id) {
        await axiosInstance.post(`/testimonials/update/${id}`, formData);
      } else {
        await axiosInstance.post("/testimonials", formData);
      }

      navigate("/manage-testimonials");
    } catch (err) {
      console.error("Error submitting testimonial:", err);
      alert("Failed to save testimonial. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="admin-page">
        <div className="admin-page__loading">Loading testimonial details…</div>
      </div>
    );
  }

  return (
    <div className="admin-page">
      <div className="admin-page__header">
        <div>
          <h1 className="admin-page__title">
            {isEdit ? "Edit Testimonial" : "Add Testimonial"}
          </h1>
          <p className="admin-page__subtitle">
            {isEdit
              ? "Update the testimonial title, author, description, and category."
              : "Create a new customer testimonial for a tour category page."}
          </p>
        </div>
        <Link to="/manage-testimonials" className="admin-btn admin-btn--ghost">
          <ArrowLeft size={18} />
          Back to Testimonials
        </Link>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="admin-form-stack">
          <div className="admin-form-card">
            <div className="admin-form-section">
              <h2 className="admin-form-section__title">
                <MessageSquareQuote
                  size={16}
                  style={{ verticalAlign: "middle", marginRight: 6 }}
                />
                Testimonial Details
              </h2>
              <div className="admin-form-grid">
                <div className="admin-form-group">
                  <label className="admin-form-label" htmlFor="title">
                    Title <span>*</span>
                  </label>
                  <input
                    id="title"
                    type="text"
                    className="admin-form-input"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="e.g. Amazing city tour experience"
                    required
                  />
                </div>
                <div className="admin-form-group">
                  <label className="admin-form-label" htmlFor="author">
                    <User size={14} style={{ verticalAlign: "middle", marginRight: 4 }} />
                    Author <span>*</span>
                  </label>
                  <input
                    id="author"
                    type="text"
                    className="admin-form-input"
                    value={author}
                    onChange={(e) => setAuthor(e.target.value)}
                    placeholder="Customer name"
                    required
                  />
                </div>
                <div className="admin-form-group admin-form-group--full">
                  <label className="admin-form-label" htmlFor="category">
                    <Layers size={14} style={{ verticalAlign: "middle", marginRight: 4 }} />
                    Show In Category <span>*</span>
                  </label>
                  <select
                    id="category"
                    className="admin-form-select"
                    value={selectedCategoryId}
                    onChange={(e) => setSelectedCategoryId(e.target.value)}
                    required
                  >
                    <option value="">Select category</option>
                    {categories.map((cat) => (
                      <option key={cat._id} value={cat._id}>
                        {cat.category}
                      </option>
                    ))}
                  </select>
                  <p className="admin-form-hint">
                    The category page where this testimonial will appear.
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="admin-form-card">
            <div className="admin-form-section">
              <h2 className="admin-form-section__title">
                <FileText size={16} style={{ verticalAlign: "middle", marginRight: 6 }} />
                Description
              </h2>
              <div className="admin-form-group admin-form-group--full">
                <label className="admin-form-label" htmlFor="description">
                  Testimonial Text <span>*</span>
                </label>
                <textarea
                  id="description"
                  className="admin-form-textarea"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Write the customer's review or quote…"
                  rows={6}
                  required
                />
              </div>
            </div>

            <div className="admin-form-footer admin-form-footer--split">
              <span className="admin-form-footer__note">
                Fields marked with <span style={{ color: "#ef4444" }}>*</span> are required.
              </span>
              <div className="admin-page__actions">
                <Link to="/manage-testimonials" className="admin-btn admin-btn--secondary">
                  Cancel
                </Link>
                <button
                  type="submit"
                  className="admin-btn admin-btn--primary"
                  disabled={submitting}
                >
                  <Save size={18} />
                  {submitting
                    ? "Saving…"
                    : isEdit
                      ? "Update Testimonial"
                      : "Create Testimonial"}
                </button>
              </div>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
};

export default Testimonials;

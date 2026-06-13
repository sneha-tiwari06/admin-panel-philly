import React, { useState, useEffect } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import axiosInstance from "../../utils/axiosInstnace";
import { ArrowLeft, Save, Plus, X, HelpCircle, Layers } from "lucide-react";
import "../../styles/admin-page.css";

const initialFaqItem = () => ({ question: "", answer: "", category: "" });

const AddFAQ = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEdit = Boolean(id);

  const [categories, setCategories] = useState([]);
  const [faqFields, setFaqFields] = useState([initialFaqItem()]);
  const [loading, setLoading] = useState(isEdit);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    axiosInstance.get("/categories").then((res) => {
      setCategories(res.data || []);
    });

    if (!id) return;

    setLoading(true);
    axiosInstance
      .get(`/faqs/${id}`)
      .then((response) => {
        const data = response.data;
        setFaqFields([
          {
            question: data.question || "",
            answer: data.answer || "",
            category: data.category?._id || "",
          },
        ]);
      })
      .catch((err) => console.error("Error fetching FAQ details:", err))
      .finally(() => setLoading(false));
  }, [id]);

  const updateFaqItem = (index, field, value) => {
    setFaqFields((prev) => {
      const next = [...prev];
      next[index] = { ...next[index], [field]: value };
      return next;
    });
  };

  const handleAddField = () => {
    setFaqFields((prev) => [...prev, initialFaqItem()]);
  };

  const handleRemoveField = (index) => {
    if (faqFields.length <= 1) return;
    setFaqFields((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (submitting) return;
    setSubmitting(true);

    try {
      if (isEdit) {
        const { question, answer, category } = faqFields[0];
        await axiosInstance.post(`/faqs/update/${id}`, {
          question,
          answer,
          category,
        });
      } else {
        const validFaqs = faqFields.filter(
          (f) => f.question.trim() && f.answer.trim() && f.category
        );
        if (validFaqs.length === 0) {
          alert("Please fill at least one FAQ with question, answer, and category.");
          setSubmitting(false);
          return;
        }
        await axiosInstance.post("/faqs", { faqs: validFaqs });
      }

      navigate("/manage-faqs");
    } catch (err) {
      console.error("Error submitting FAQs:", err);
      alert("Failed to save FAQs. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="admin-page">
        <div className="admin-page__loading">Loading FAQ details…</div>
      </div>
    );
  }

  return (
    <div className="admin-page">
      <div className="admin-page__header">
        <div>
          <h1 className="admin-page__title">{isEdit ? "Edit FAQ" : "Add FAQs"}</h1>
          <p className="admin-page__subtitle">
            {isEdit
              ? "Update this FAQ question, answer, and category."
              : "Add multiple FAQs at once, each linked to a tour category."}
          </p>
        </div>
        <Link to="/manage-faqs" className="admin-btn admin-btn--ghost">
          <ArrowLeft size={18} />
          Back to FAQs
        </Link>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="admin-form-stack">
          {isEdit ? (
            <div className="admin-form-card" style={{ maxWidth: 720 }}>
              <div className="admin-form-section">
                <h2 className="admin-form-section__title">
                  <HelpCircle size={16} style={{ verticalAlign: "middle", marginRight: 6 }} />
                  FAQ Details
                </h2>
                <div className="admin-form-grid">
                  <div className="admin-form-group admin-form-group--full">
                    <label className="admin-form-label" htmlFor="question">
                      Question <span>*</span>
                    </label>
                    <input
                      id="question"
                      type="text"
                      className="admin-form-input"
                      value={faqFields[0].question}
                      onChange={(e) => updateFaqItem(0, "question", e.target.value)}
                      required
                    />
                  </div>
                  <div className="admin-form-group admin-form-group--full">
                    <label className="admin-form-label" htmlFor="answer">
                      Answer <span>*</span>
                    </label>
                    <textarea
                      id="answer"
                      className="admin-form-textarea"
                      value={faqFields[0].answer}
                      onChange={(e) => updateFaqItem(0, "answer", e.target.value)}
                      required
                    />
                  </div>
                  <div className="admin-form-group admin-form-group--full">
                    <label className="admin-form-label" htmlFor="category">
                      Category <span>*</span>
                    </label>
                    <select
                      id="category"
                      className="admin-form-select"
                      value={faqFields[0].category}
                      onChange={(e) => updateFaqItem(0, "category", e.target.value)}
                      required
                    >
                      <option value="">Select category</option>
                      {categories.map((cat) => (
                        <option key={cat._id} value={cat._id}>
                          {cat.category}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            faqFields.map((faq, index) => (
              <div key={index} className="admin-form-card admin-gallery-item-card">
                <div className="admin-gallery-item-card__header">
                  <h2 className="admin-gallery-item-card__title">FAQ {index + 1}</h2>
                  {faqFields.length > 1 && (
                    <button
                      type="button"
                      className="admin-btn admin-btn--icon admin-btn--delete"
                      onClick={() => handleRemoveField(index)}
                      aria-label="Remove FAQ"
                    >
                      <X size={15} />
                    </button>
                  )}
                </div>
                <div className="admin-form-grid">
                  <div className="admin-form-group admin-form-group--full">
                    <label className="admin-form-label">Question</label>
                    <input
                      type="text"
                      className="admin-form-input"
                      value={faq.question}
                      onChange={(e) => updateFaqItem(index, "question", e.target.value)}
                      placeholder="Enter question"
                    />
                  </div>
                  <div className="admin-form-group admin-form-group--full">
                    <label className="admin-form-label">Answer</label>
                    <textarea
                      className="admin-form-textarea"
                      value={faq.answer}
                      onChange={(e) => updateFaqItem(index, "answer", e.target.value)}
                      placeholder="Enter answer"
                      rows={4}
                    />
                  </div>
                  <div className="admin-form-group admin-form-group--full">
                    <label className="admin-form-label">
                      <Layers size={14} style={{ verticalAlign: "middle", marginRight: 4 }} />
                      Category
                    </label>
                    <select
                      className="admin-form-select"
                      value={faq.category}
                      onChange={(e) => updateFaqItem(index, "category", e.target.value)}
                    >
                      <option value="">Select category</option>
                      {categories.map((cat) => (
                        <option key={cat._id} value={cat._id}>
                          {cat.category}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>
            ))
          )}

          {!isEdit && (
            <button type="button" className="admin-btn admin-btn--secondary" onClick={handleAddField}>
              <Plus size={16} />
              Add Another FAQ
            </button>
          )}

          <div className="admin-form-card">
            <div
              className="admin-form-footer admin-form-footer--split"
              style={{ marginTop: 0, paddingTop: 0, borderTop: "none" }}
            >
              <span className="admin-form-footer__note">
                {isEdit ? "Update the FAQ entry below." : "Add multiple FAQs at once."}
              </span>
              <div className="admin-page__actions">
                <Link to="/manage-faqs" className="admin-btn admin-btn--secondary">
                  Cancel
                </Link>
                <button
                  type="submit"
                  className="admin-btn admin-btn--primary"
                  disabled={submitting}
                >
                  <Save size={18} />
                  {submitting ? "Saving…" : isEdit ? "Update FAQ" : "Create FAQ(s)"}
                </button>
              </div>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
};

export default AddFAQ;

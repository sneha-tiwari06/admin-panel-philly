import React, { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import axiosInstance from "../../utils/axiosInstnace";
import { ArrowLeft, Save, Plus, X, HelpCircle } from "lucide-react";
import "../../styles/admin-page.css";

const initialFaqItem = () => ({ question: "", answer: "" });

const AddBlogFaq = () => {
  const { slug, id } = useParams();
  const navigate = useNavigate();
  const isEdit = Boolean(id);

  const [question, setQuestion] = useState("");
  const [answer, setAnswer] = useState("");
  const [faqList, setFaqList] = useState([initialFaqItem()]);
  const [loading, setLoading] = useState(isEdit);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!id) return;

    axiosInstance
      .get(`/blog-faqs/${id}`)
      .then((response) => {
        const data = response.data;
        setQuestion(data.question || "");
        setAnswer(data.answer || "");
      })
      .catch((err) => console.error("Error fetching FAQ details:", err))
      .finally(() => setLoading(false));
  }, [id]);

  const addMoreFaq = () => setFaqList((prev) => [...prev, initialFaqItem()]);

  const removeFaq = (index) => {
    if (faqList.length <= 1) return;
    setFaqList((prev) => prev.filter((_, i) => i !== index));
  };

  const updateFaqItem = (index, field, value) => {
    setFaqList((prev) => {
      const next = [...prev];
      next[index] = { ...next[index], [field]: value };
      return next;
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      if (isEdit) {
        await axiosInstance.post(`/blog-faqs/update/${id}`, { question, answer });
      } else {
        const validFaqs = faqList.filter((f) => f.question.trim() && f.answer.trim());
        if (validFaqs.length === 0) {
          alert("Please fill at least one FAQ with both question and answer.");
          setSubmitting(false);
          return;
        }
        await axiosInstance.post("/blog-faqs/add-bulk", {
          blogSlug: slug,
          faqs: validFaqs,
        });
      }
      navigate(`/manage-blog-faq/${slug}`);
    } catch (err) {
      console.error("Error submitting FAQ:", err);
      alert("Error: " + (err.response?.data?.message || err.message));
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
          <h1 className="admin-page__title">{isEdit ? "Edit FAQ" : "Add Blog FAQs"}</h1>
          <p className="admin-page__subtitle">
            {isEdit
              ? "Update this FAQ entry."
              : <>Add FAQs for blog: <span className="admin-slug">{slug}</span></>}
          </p>
        </div>
        <Link
          to={slug ? `/manage-blog-faq/${slug}` : "/manage-blogs"}
          className="admin-btn admin-btn--ghost"
        >
          <ArrowLeft size={18} />
          Back
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
                      value={question}
                      onChange={(e) => setQuestion(e.target.value)}
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
                      value={answer}
                      onChange={(e) => setAnswer(e.target.value)}
                      required
                    />
                  </div>
                </div>
              </div>
            </div>
          ) : (
            faqList.map((faq, index) => (
              <div key={index} className="admin-form-card admin-gallery-item-card">
                <div className="admin-gallery-item-card__header">
                  <h2 className="admin-gallery-item-card__title">FAQ {index + 1}</h2>
                  {faqList.length > 1 && (
                    <button
                      type="button"
                      className="admin-btn admin-btn--icon admin-btn--delete"
                      onClick={() => removeFaq(index)}
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
                </div>
              </div>
            ))
          )}

          {!isEdit && (
            <button type="button" className="admin-btn admin-btn--secondary" onClick={addMoreFaq}>
              <Plus size={16} />
              Add Another FAQ
            </button>
          )}

          <div className="admin-form-card">
            <div className="admin-form-footer admin-form-footer--split" style={{ marginTop: 0, paddingTop: 0, borderTop: "none" }}>
              <span className="admin-form-footer__note">
                {isEdit ? "Update the question and answer below." : "Add multiple FAQs at once."}
              </span>
              <div className="admin-page__actions">
                <Link
                  to={slug ? `/manage-blog-faq/${slug}` : "/manage-blogs"}
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

export default AddBlogFaq;

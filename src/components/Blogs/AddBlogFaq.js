import React, { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import axiosInstance from "../../utils/axiosInstnace";

const initialFaqItem = () => ({ question: "", answer: "" });

const AddBlogFaq = () => {
  const { slug, id } = useParams();
  const navigate = useNavigate();
  const [question, setQuestion] = useState("");
  const [answer, setAnswer] = useState("");
  const [faqList, setFaqList] = useState([initialFaqItem()]);
  const [loading, setLoading] = useState(false);
  const isEdit = Boolean(id);

  useEffect(() => {
    if (id) {
      axiosInstance
        .get(`/blog-faqs/${id}`)
        .then((response) => {
          const data = response.data;
          setQuestion(data.question || "");
          setAnswer(data.answer || "");
        })
        .catch((err) => console.error("Error fetching FAQ details:", err));
    }
  }, [id]);

  const addMoreFaq = () => {
    setFaqList((prev) => [...prev, initialFaqItem()]);
  };

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
    setLoading(true);
    try {
      if (isEdit) {
        await axiosInstance.post(`/blog-faqs/update/${id}`, {
          question,
          answer,
        });
      } else {
        const validFaqs = faqList.filter((f) => f.question.trim() && f.answer.trim());
        if (validFaqs.length === 0) {
          alert("Please fill at least one FAQ with both question and answer.");
          setLoading(false);
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
      setLoading(false);
    }
  };

  return (
    <div className="bg-light">
      <div className="container-lg">
        <div className="py-5 px-4 bg-white mvh-100">
          <div className="d-flex justify-content-between align-items-center mb-3">
            <h2>{isEdit ? "Edit FAQ" : "Add New FAQ(s)"}</h2>
            <Link to={slug ? `/manage-blog-faq/${slug}` : "/manage-blogs"}>
              <button type="button" className="btn btn-primary">Back</button>
            </Link>
          </div>

          <form onSubmit={handleSubmit}>
            {isEdit ? (
              <div className="row gx-3 gy-4">
                <div className="col-md-12">
                  <label>Question</label>
                  <input
                    type="text"
                    className="form-control"
                    value={question}
                    onChange={(e) => setQuestion(e.target.value)}
                    required
                  />
                </div>
                <div className="col-md-12">
                  <label>Answer</label>
                  <textarea
                    className="form-control"
                    value={answer}
                    onChange={(e) => setAnswer(e.target.value)}
                    required
                  />
                </div>
              </div>
            ) : (
              <>
                {faqList.map((faq, index) => (
                  <div key={index} className="border rounded p-3 mb-3 bg-light">
                    <div className="d-flex justify-content-between align-items-center mb-2">
                      <span className="text-muted fw-medium">FAQ #{index + 1}</span>
                      {faqList.length > 1 && (
                        <button
                          type="button"
                          className="btn btn-sm btn-outline-danger"
                          onClick={() => removeFaq(index)}
                        >
                          Remove
                        </button>
                      )}
                    </div>
                    <div className="row gx-3 gy-3">
                      <div className="col-md-12">
                        <label className="form-label">Question</label>
                        <input
                          type="text"
                          className="form-control"
                          value={faq.question}
                          onChange={(e) => updateFaqItem(index, "question", e.target.value)}
                          placeholder="Enter question"
                        />
                      </div>
                      <div className="col-md-12">
                        <label className="form-label">Answer</label>
                        <textarea
                          className="form-control"
                          value={faq.answer}
                          onChange={(e) => updateFaqItem(index, "answer", e.target.value)}
                          placeholder="Enter answer"
                          rows={3}
                        />
                      </div>
                    </div>
                  </div>
                ))}
                <button
                  type="button"
                  className="btn btn-outline-primary mt-4"
                  onClick={addMoreFaq}
                >
                  + Add more FAQ
                </button>
              </>
            )}
            <button type="submit" className="btn btn-primary mt-4" disabled={loading} style={{marginLeft: '12px'}}>
              {isEdit ? "Update FAQ" : "Create FAQ(s)"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default AddBlogFaq;

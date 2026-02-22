import React, { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import axiosInstance from "../../utils/axiosInstnace";

const AddBlogFaq = () => {
  const { slug, id } = useParams();
  const navigate = useNavigate();
  const [question, setQuestion] = useState("");
  const [answer, setAnswer] = useState("");
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
        await axiosInstance.post("/blog-faqs/add", {
          blogSlug: slug,
          question,
          answer,
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
            <h2>{isEdit ? "Edit FAQ" : "Add New FAQ"}</h2>
            <Link to={slug ? `/manage-blog-faq/${slug}` : "/manage-blogs"}>
              <button className="btn btn-primary">Back</button>
            </Link>
          </div>

          <form onSubmit={handleSubmit}>
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
            <button type="submit" className="btn btn-primary mt-4" disabled={loading}>
              {isEdit ? "Update FAQ" : "Create FAQ"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default AddBlogFaq;

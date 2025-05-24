import React, { useState, useEffect } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import axiosInstance from "../../utils/axiosInstnace";

const AddFAQ = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [categories, setCategories] = useState([]);
  const [faqFields, setFaqFields] = useState([
    { question: "", answer: "", category: "" },
  ]);

  useEffect(() => {
    axiosInstance.get("/categories").then((res) => {
      setCategories(res.data);
    });
    if (id) {
      axiosInstance.get(`/faqs/${id}`).then((response) => {
        const data = response.data;
        setFaqFields([
          {
            question: data.question || "",
            answer: data.answer || "",
            category: data.category?._id || "",
          },
        ]);
      });
    }
  }, [id]);

  const handleInputChange = (index, e) => {
    const { name, value } = e.target;
    const updatedFields = [...faqFields];
    updatedFields[index][name] = value;
    setFaqFields(updatedFields);
  };

  const handleAddField = () => {
    setFaqFields([...faqFields, { question: "", answer: "", category: "" }]);
  };

  const handleRemoveField = (index) => {
    const updatedFields = faqFields.filter((_, i) => i !== index);
    setFaqFields(updatedFields);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      if (id) {
        const { question, answer, category } = faqFields[0];
        await axiosInstance.post(`/faqs/update/${id}`, {
          question,
          answer,
          category,
        });
      } else {
        await axiosInstance.post("/faqs", {
          faqs: faqFields,
        });
      }

      navigate("/manage-faqs");
    } catch (err) {
      console.error("Error submitting FAQs:", err);
    }
  };

  return (
    <div className="bg-light">
      <div className="container-lg">
        <div className="py-5 px-4 bg-white mvh-100">
          <div className="d-flex justify-content-between align-items-center mb-3">
            <h2>{id ? "Edit FAQ" : "Add FAQs"}</h2>
            <Link to="/manage-faqs">
              <button className="btn btn-primary">Back</button>
            </Link>
          </div>

          <form onSubmit={handleSubmit}>
            {faqFields.map((faq, index) => (
              <div className="row gx-3 gy-4 mb-3" key={index}>
                <div className="col-md-4">
                  <label>Question</label>
                  <input
                    type="text"
                    className="form-control"
                    name="question"
                    value={faq.question}
                    onChange={(e) => handleInputChange(index, e)}
                    required
                  />
                </div>
                <div className="col-md-4">
                  <label>Answer</label>
                  <input
                    type="text"
                    className="form-control"
                    name="answer"
                    value={faq.answer}
                    onChange={(e) => handleInputChange(index, e)}
                    required
                  />
                </div>
                <div className="col-md-3">
                  <label>Category</label>
                  <select
                    className="form-control"
                    name="category"
                    value={faq.category}
                    onChange={(e) => handleInputChange(index, e)}
                    required
                  >
                    <option value="">Select Category</option>
                    {categories.map((cat) => (
                      <option key={cat._id} value={cat._id}>
                        {cat.category}
                      </option>
                    ))}
                  </select>
                </div>
                {!id && (
                  <div className="col-md-1 d-flex align-items-end">
                    <button
                      type="button"
                      className="btn btn-danger"
                      onClick={() => handleRemoveField(index)}
                    >
                      &times;
                    </button>
                  </div>
                )}
              </div>
            ))}
            <div>
              {!id && (
                <button
                  type="button"
                  className="btn btn-secondary mb-3"
                  onClick={handleAddField}
                >
                  + Add More
                </button>
              )}
            </div>

            <button type="submit" className="btn btn-primary">
              {id ? "Update FAQ" : "Create FAQs"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default AddFAQ;

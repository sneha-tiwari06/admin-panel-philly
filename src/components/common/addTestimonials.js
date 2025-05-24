import React, { useState, useEffect } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import axiosInstance from "../../utils/axiosInstnace";
import TextEditor from "../../common/ckEditor";

const Testimonials = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [author, setAuthor] = useState("");
  const [categories, setCategories] = useState([]);

  const [selectedCategory, setSelectedCategory] = useState(null);

  // Fetch categories and tour (if editing)
  useEffect(() => {
    axiosInstance.get("/categories").then((res) => {
      setCategories(res.data);
    });
    if (id) {
      axiosInstance.get(`/testimonials/${id}`).then((response) => {
        const data = response.data;

        setTitle(data.title || "");
        setDescription(data.description || "");
        setAuthor(data.author || "");
        setSelectedCategory(data.category || null);
      });
    }
  }, [id]);
  const handleCategoryChange = (e) => {
    const selectedId = e.target.value;
    const categoryObj = categories.find((cat) => cat._id === selectedId);
    setSelectedCategory(categoryObj || null);
  };
  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const formData = new FormData();
      formData.append("title", title);
      formData.append("description", description);
      formData.append("author", author);
      formData.append("category", selectedCategory?._id || "");

      if (id) {
        await axiosInstance.post(`/testimonials/update/${id}`, formData);
      } else {
        await axiosInstance.post("/testimonials", formData);
      }

      navigate("/manage-testimonials");
    } catch (err) {
      console.error("Error submitting tour:", err);
    }
  };

  return (
    <div className="bg-light">
      <div className="container-lg">
        <div className="py-5 px-4 bg-white mvh-100">
          <div className="d-flex justify-content-between align-items-center mb-3">
            <h2>{id ? "Edit Tour" : "Add Tour"}</h2>
            <Link to="/manage-testimonials">
              <button className="btn btn-primary">Back</button>
            </Link>
          </div>

          <form onSubmit={handleSubmit}>
            <div className="row gx-3 gy-4">
              <div className="col-md-6">
                <label>Title</label>
                <input
                  type="text"
                  className="form-control"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  required
                />
              </div>

              <div className="col-md-6">
                <label>Author</label>
                <input
                  type="text"
                  className="form-control"
                  value={author}
                  onChange={(e) => setAuthor(e.target.value)}
                  required
                />
              </div>
              <div className="col-md-12">
                <label>Description</label>
                <textarea
                  className="form-control"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  required
                />
              </div>
            </div>
            <div className="col-md-12">
              <label>Category</label>
              <select
                className="form-control"
                value={selectedCategory?._id || ""}
                onChange={handleCategoryChange}
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
            <button type="submit" className="btn btn-primary mt-4">
              {id ? "Update Tour" : "Create Tour"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Testimonials;

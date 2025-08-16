import React, { useState, useEffect } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import axiosInstance from "../../utils/axiosInstnace";
import TextEditor from "../../common/ckEditor";

const AddTours = () => {
  const { id } = useParams();
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

  // Fetch categories and tour (if editing)
  useEffect(() => {
    axiosInstance.get("/categories").then((res) => {
      setCategories(res.data);
    });

    if (id) {
      axiosInstance.get(`/tours/${id}`).then((response) => {
        const data = response.data.data;

        setMetaTitle(data.metaTitle || "");
        setMetaKeywords(data.metaKeywords || "");
        setMetaDescription(data.metaDescription || "");
        setMetaTags(data.metaTags || [""]);
        setSlugURL(data.slugURL || "");
        setContent(data.content || "");
        setSelectedCategory(data.selectedCategory || null);
        setTourPrice(data.tourPrice || "");
        setAdultPrice(data.adultPrice || "");
        setKidsPrice(data.kidsPrice || "");
        setShowOnHomepage(data.showOnHome || false);
        setTourSchema(data.tourSchema || "");
      });
    }
  }, [id]);

  const handleCategoryChange = (e) => {
    const selectedId = e.target.value;
    const categoryObj = categories.find((cat) => cat._id === selectedId);
    setSelectedCategory(categoryObj || null);
    if (categoryObj?.slugURL) {
      setSlugURL(categoryObj.slugURL);
    } else {
      setSlugURL("");
    }
  };

  const isPrivateTour =
    selectedCategory?.category === "4 Seater Private Tours (2hr)" ||
    selectedCategory?.category === "7 Seater Private Tours (2hr)" ||
    selectedCategory?.category === "4 Seater Private Tours (1hr)" ||
    selectedCategory?.category === "7 Seater Private Tours (1hr)";

  const handleSubmit = async (e) => {
    e.preventDefault();

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

  return (
    <div className="bg-light">
      <div className="container-lg">
        <div className="py-5 px-4 bg-white mvh-100">
          <div className="d-flex justify-content-between align-items-center mb-3">
            <h2>{id ? "Edit Tour" : "Add Tour"}</h2>
            <Link to="/manage-tours">
              <button className="btn btn-primary">Back</button>
            </Link>
          </div>

          <form onSubmit={handleSubmit}>
            <div className="row gx-3 gy-4">
              <div className="col-md-6">
                <label>Meta Title</label>
                <input
                  type="text"
                  className="form-control"
                  value={metaTitle}
                  onChange={(e) => setMetaTitle(e.target.value)}
                  required
                />
              </div>

              <div className="col-md-6">
                <label>Meta Keywords</label>
                <input
                  type="text"
                  className="form-control"
                  value={metaKeywords}
                  onChange={(e) => setMetaKeywords(e.target.value)}
                  required
                />
              </div>

              <div className="col-md-12">
                <label>Meta Description</label>
                <textarea
                  className="form-control"
                  value={metaDescription}
                  onChange={(e) => setMetaDescription(e.target.value)}
                  required
                />
              </div>

              <div className="col-md-12">
                <label>Additional Meta Tags</label>
                {metaTags.map((tag, idx) => (
                  <div className="d-flex mb-2" key={idx}>
                    <input
                      type="text"
                      className="form-control"
                      value={tag}
                      onChange={(e) => handleMetaChange(idx, e.target.value)}
                    />
                    {idx > 0 && (
                      <button
                        type="button"
                        className="btn btn-danger ms-2"
                        onClick={() => removeMetaTag(idx)}
                      >
                        ×
                      </button>
                    )}
                  </div>
                ))}
                <button
                  type="button"
                  className="btn btn-secondary mt-2"
                  onClick={addMetaTag}
                >
                  Add Meta Tag
                </button>
              </div>

              <div className="col-md-12">
                <label>Category</label>
                <select
                  className="form-control form-select"
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

              {isPrivateTour ? (
                <div className="col-md-12">
                  <label>Tour Price</label>
                  <input
                    type="text"
                    className="form-control"
                    value={tourPrice}
                    onChange={(e) => setTourPrice(e.target.value)}
                  />
                </div>
              ) : (
                <>
                  <div className="col-md-6">
                    <label>Adult Price</label>
                    <input
                      type="text"
                      className="form-control"
                      value={adultPrice}
                      onChange={(e) => setAdultPrice(e.target.value)}
                    />
                  </div>
                  <div className="col-md-6">
                    <label>Kids Price</label>
                    <input
                      type="text"
                      className="form-control"
                      value={kidsPrice}
                      onChange={(e) => setKidsPrice(e.target.value)}
                    />
                  </div>
                </>
              )}

              <div className="col-md-12">
                <label>Tour Slug URL</label>
                <input
                  type="text"
                  className="form-control"
                  value={slugURL}
                  readOnly
                  style={{ color: "#6c757d", backgroundColor: "#f8f9fa" }}
                />
              </div>

              <div className="col-md-12">
                <label>Tour Description</label>
                <TextEditor value={content} onChange={setContent} />
              </div>

              <div className="form-check mt-3">
                <input
                  type="checkbox"
                  className="form-check-input"
                  id="showOnHomepage"
                  checked={showOnHomepage}
                  onChange={(e) => setShowOnHomepage(e.target.checked)}
                />
                <label className="form-check-label" htmlFor="showOnHomepage">
                  Show on Homepage
                </label>
              </div>
               <div className="col-md-12">
                <label>Tour Schema</label>
                <textarea
                  className="form-control"
                  value={tourSchema}
                  onChange={(e) => setTourSchema(e.target.value)}
                  required
                />
              </div>
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

export default AddTours;

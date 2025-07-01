import React, { useState, useRef, useEffect } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import axiosInstance, { BASE_IMAGE_URL } from "../../utils/axiosInstnace";

const ManageCategory = () => {
  const { id } = useParams();
  const [category, setCategory] = useState("");
  const [slugURL, setSlugURL] = useState("");
  const [file, setFile] = useState(null);
  const [previewURL, setPreviewURL] = useState("");
  const fileInputRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    if (id) {
      axiosInstance
        .get(`/categories/${id}`)
        .then((response) => {
          const { category, slugURL, attached_document } = response.data;

          setCategory(category);
          setSlugURL(slugURL);

          if (attached_document) {
            setPreviewURL(`${BASE_IMAGE_URL}${attached_document}`);
          }
        })
        .catch((err) => console.error("Error fetching category details:", err));
    }
  }, [id]);

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      setFile(selectedFile);
      setPreviewURL(URL.createObjectURL(selectedFile));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const formData = new FormData();
      formData.append("category", category);
      formData.append("slugURL", slugURL);

      if (file) {
        formData.append("attached_document", file);
      }

      if (id) {
        await axiosInstance.post(`/categories/update/${id}`, formData, {
          headers: { "Content-Type": "multipart/form-data" },
        });
      } else {
        await axiosInstance.post("/categories/add", formData, {
          headers: { "Content-Type": "multipart/form-data" },
        });
      }

      setCategory("");
      setSlugURL("");
      setFile(null);
      setPreviewURL("");
      if (fileInputRef.current) fileInputRef.current.value = "";

      navigate("/manage-category");
    } catch (err) {
      console.error("Error submitting category:", err);
    }
  };

  return (
    <div className="bg-light">
      <div className="container-lg">
        <div className="py-5 px-4 bg-white mvh-100">
          <div className="action-btn d-grid gap-2 d-md-flex justify-content-md-end">
            <div className="back-btn">
              <Link to="/manage-category">
                <button type="button" className="w-auto btn btn-primary">
                  Back
                </button>
              </Link>
            </div>
          </div>
          <h2 className="title">{id ? "Edit Category" : "Add Category"}</h2>
          <form onSubmit={handleSubmit} className="mb-3">
            <div className="row gx-3 gy-4">
              <div className="col-md-4">
                <label>Category</label>
                <input
                  className="form-control"
                  type="text"
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  required
                />
              </div>
              <div className="col-md-4">
                <label>Slug URL</label>
                <input
                  className="form-control"
                  type="text"
                  value={slugURL}
                  onChange={(e) => setSlugURL(e.target.value)}
                  required
                />
              </div>
              <div className="col-md-4">
                <label>Category File</label>
                <input
                  type="file"
                  className="form-control"
                  accept=".jpg,.png,.pdf"
                  onChange={handleFileChange}
                  ref={fileInputRef}
                />
                {previewURL && (
                  <div className="mt-2">
                    <img
                      src={previewURL}
                      alt="Category Preview"
                      style={{
                        maxWidth: "100%",
                        maxHeight: "150px",
                        borderRadius: "5px",
                      }}
                    />
                  </div>
                )}
              </div>
            </div>
            <button className="btn btn-primary w-auto mt-2" type="submit">
              {id ? "Update" : "Submit"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ManageCategory;

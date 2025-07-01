import React, { useState, useEffect, useRef } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import axiosInstance, { BASE_IMAGE_URL } from "../../utils/axiosInstnace";
import TextEditor from "../../common/ckEditor";

const AddBlog = () => {
  const { slug } = useParams();
  const navigate = useNavigate();
  const [metaTitle, setMetaTitle] = useState("");
  const [metaKeywords, setMetaKeywords] = useState("");
  const [metaDescription, setMetaDescription] = useState("");
  const [blogName, setBlogName] = useState("");
  const [imgName, setImgName] = useState("");
  const [blogDate, setBlogDate] = useState("");
  const [blogLink, setBlogLink] = useState("");
  const [blogDesc, setBlogDesc] = useState("");
  const [blogSchema, setBlogSchema] = useState("");
  const [file, setFile] = useState(null);
  const [previewURL, setPreviewURL] = useState("");
  const fileInputRef = useRef(null);
  const [showOnHomepage, setShowOnHomepage] = useState(false);
  useEffect(() => {
    if (slug) {
      axiosInstance
        .get(`/blogs/${slug}`)
        .then((response) => {
          const data = response.data;
          setMetaTitle(data.metaTitle || "");
          setMetaKeywords(data.metaKeywords || "");
          setMetaDescription(data.metaDescription || "");
          setBlogName(data.blogName || "");
          setBlogDate(data?.blogDate ? data.blogDate.slice(0, 10) : "");
          setBlogLink(data.blogLink || "");
          setBlogDesc(data.blogDesc || "");
          setBlogSchema(data.blogSchema || "");
          setImgName(data.imgName || "");
          setShowOnHomepage(data.showOnHomepage || false);
          if (data.attached_document) {
            setPreviewURL(`${BASE_IMAGE_URL}${data.attached_document}`);
          }
        })
        .catch((err) => console.error("Error fetching category details:", err));
    }
  }, [slug]);

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      console.log(selectedFile, "file");
      setFile(selectedFile);
      setPreviewURL(URL.createObjectURL(selectedFile));
    }
  };
  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const formData = new FormData();
      formData.append("metaTitle", metaTitle);
      formData.append("metaKeywords", metaKeywords);
      formData.append("metaDescription", metaDescription);
      formData.append("blogName", blogName);
      formData.append("blogDate", blogDate);
      formData.append("blogLink", blogLink);
      formData.append("blogDesc", blogDesc);
      formData.append("imgName", imgName);
      formData.append("blogSchema", blogSchema);
      formData.append("showOnHomepage", showOnHomepage);

      if (file) {
        formData.append("attached_document", file);
      }
      if (slug) {
        await axiosInstance.post(`/blogs/update/${slug}`, formData, {
          headers: { "Content-Type": "multipart/form-data" },
        });
      } else {
        await axiosInstance.post("/blogs/add", formData, {
          headers: { "Content-Type": "multipart/form-data" },
        });
      }

      navigate("/manage-blogs");
    } catch (err) {
      console.error("Error submitting tour:", err);
    }
  };

  return (
    <div className="bg-light">
      <div className="container-lg">
        <div className="py-5 px-4 bg-white mvh-100">
          <div className="d-flex justify-content-between align-items-center mb-3">
            <h2>{slug ? "Edit Blog" : "Add Blog"}</h2>
            <Link to="/manage-blogs">
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
                <label>Blog Name</label>
                <input
                  type="text"
                  className="form-control"
                  value={blogName}
                  onChange={(e) => setBlogName(e.target.value)}
                />
              </div>
              <div className="col-md-6">
                <label>Blog Date</label>
                <input
                  type="date"
                  className="form-control"
                  value={blogDate}
                  onChange={(e) => setBlogDate(e.target.value)}
                />
              </div>
              <div className="col-md-6">
                <label>Blog Link</label>
                <input
                  type="text"
                  className="form-control"
                  value={blogLink}
                  onChange={(e) => setBlogLink(e.target.value)}
                />
              </div>
              <div className="col-md-6">
                <label>Image Name</label>
                <input
                  type="text"
                  className="form-control"
                  value={imgName}
                  onChange={(e) => setImgName(e.target.value)}
                />
              </div>
              <div className="col-md-6">
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

              <div className="col-md-12">
                <label>Blog Description</label>
                <TextEditor value={blogDesc} onChange={setBlogDesc} />
              </div>
              <div className="col-md-12">
                <label>Schema</label>
                <textarea
                  type="text"
                  className="form-control"
                  value={blogSchema}
                  onChange={(e) => setBlogSchema(e.target.value)}
                />
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

            </div>

            <button type="submit" className="btn btn-primary mt-4">
              {slug ? "Update Blog" : "Create Blog"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default AddBlog;

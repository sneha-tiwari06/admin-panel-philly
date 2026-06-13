import React, { useState, useEffect, useRef } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import axiosInstance, { getImageUrl, getBlogPageUrl } from "../../utils/axiosInstnace";
import TextEditor from "../../common/ckEditor";
import Toast from "react-bootstrap/Toast";
import ToastContainer from "react-bootstrap/ToastContainer";
import {
  ArrowLeft,
  Save,
  Search,
  FileText,
  Upload,
  Image,
  X,
  Link2,
  Home,
  Code,
} from "lucide-react";
import "../../styles/admin-page.css";

const AddBlog = () => {
  const { slug } = useParams();
  const isEdit = Boolean(slug);
  const navigate = useNavigate();

  const [metaTitle, setMetaTitle] = useState("");
  const [metaKeywords, setMetaKeywords] = useState("");
  const [metaDescription, setMetaDescription] = useState("");
  const [blogName, setBlogName] = useState("");
  const [imgName, setImgName] = useState("");
  const [blogDate, setBlogDate] = useState("");
  const [blogLink, setBlogLink] = useState("");
  const [shortOverview, setShortOverview] = useState("");
  const [blogDesc, setBlogDesc] = useState("");
  const [blogSchema, setBlogSchema] = useState("");
  const [tableContent, setTableContent] = useState("");
  const [file, setFile] = useState(null);
  const [previewURL, setPreviewURL] = useState("");
  const fileInputRef = useRef(null);
  const [showOnHomepage, setShowOnHomepage] = useState(false);
  const [loading, setLoading] = useState(isEdit);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [toast, setToast] = useState({
    show: false,
    title: "",
    message: "",
    bg: "danger",
  });

  const notify = ({ title, message, bg = "danger", withAlert = false }) => {
    if (withAlert) alert(`${title}: ${message}`);
    setToast({ show: true, title, message, bg });
  };

  useEffect(() => {
    if (!slug) return;

    setLoading(true);
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
        setShortOverview(data.shortOverview || "");
        setBlogDesc(data.blogDesc || "");
        setTableContent(data.tableContent || "");
        setBlogSchema(data.blogSchema || "");
        setImgName(data.imgName || "");
        setShowOnHomepage(data.showOnHomepage || false);
        if (data.attached_document) {
          setPreviewURL(getImageUrl(data.attached_document));
        }
      })
      .catch((err) => {
        notify({
          title: "Load Failed",
          message: err.response?.data?.message || err.message || "Failed to load blog.",
          bg: "danger",
          withAlert: true,
        });
      })
      .finally(() => setLoading(false));
  }, [slug]);

  const handleFileInput = (e) => {
    const selectedFile = e.target.files[0];
    if (!selectedFile) return;
    setFile(selectedFile);
    setPreviewURL(URL.createObjectURL(selectedFile));
  };

  const handleRemoveFile = () => {
    setFile(null);
    setPreviewURL("");
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (isSubmitting) return;
    setIsSubmitting(true);

    try {
      const formData = new FormData();
      formData.append("metaTitle", metaTitle);
      formData.append("metaKeywords", metaKeywords);
      formData.append("metaDescription", metaDescription);
      formData.append("blogName", blogName);
      formData.append("blogDate", blogDate);
      formData.append("blogLink", blogLink);
      formData.append("shortOverview", shortOverview);
      formData.append("blogDesc", blogDesc);
      formData.append("tableContent", tableContent);
      formData.append("imgName", imgName);
      formData.append("blogSchema", blogSchema);
      formData.append("showOnHomepage", showOnHomepage);

      if (file) {
        formData.append("attached_document_filename", file.name);
        formData.append("attached_document", file, file.name);
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

      notify({
        title: slug ? "Update Success" : "Save Success",
        message: slug ? "Blog updated successfully." : "Blog created successfully.",
        bg: "success",
      });
      navigate("/manage-blogs");
    } catch (err) {
      notify({
        title: "Save Failed",
        message: err.response?.data?.message || err.message || "Something went wrong.",
        bg: "danger",
        withAlert: true,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="admin-page">
        <div className="admin-page__loading">Loading blog details…</div>
      </div>
    );
  }

  return (
    <div className="admin-page">
      <ToastContainer position="top-end" className="p-3" style={{ zIndex: 9999 }}>
        <Toast
          bg={toast.bg}
          onClose={() => setToast((prev) => ({ ...prev, show: false }))}
          show={toast.show}
          delay={3500}
          autohide
        >
          <Toast.Header closeButton>
            <strong className="me-auto">{toast.title || "Notification"}</strong>
          </Toast.Header>
          <Toast.Body className="text-white">{toast.message}</Toast.Body>
        </Toast>
      </ToastContainer>

      <div className="admin-page__header">
        <div>
          <h1 className="admin-page__title">{isEdit ? "Edit Blog" : "Add Blog"}</h1>
          <p className="admin-page__subtitle">
            {isEdit
              ? "Update blog content, SEO settings, and featured image."
              : "Create a new blog post with SEO metadata and rich content."}
          </p>
        </div>
        <Link to="/manage-blogs" className="admin-btn admin-btn--ghost">
          <ArrowLeft size={18} />
          Back to Blogs
        </Link>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="admin-form-stack">
          <div className="admin-form-card">
            <div className="admin-form-section">
              <h2 className="admin-form-section__title">
                <Search size={16} style={{ verticalAlign: "middle", marginRight: 6 }} />
                SEO Information
              </h2>
              <div className="admin-form-grid">
                <div className="admin-form-group">
                  <label className="admin-form-label" htmlFor="metaTitle">Meta Title <span>*</span></label>
                  <input id="metaTitle" className="admin-form-input" value={metaTitle} onChange={(e) => setMetaTitle(e.target.value)} required />
                </div>
                <div className="admin-form-group">
                  <label className="admin-form-label" htmlFor="metaKeywords">Meta Keywords <span>*</span></label>
                  <input id="metaKeywords" className="admin-form-input" value={metaKeywords} onChange={(e) => setMetaKeywords(e.target.value)} required />
                </div>
                <div className="admin-form-group admin-form-group--full">
                  <label className="admin-form-label" htmlFor="metaDescription">Meta Description <span>*</span></label>
                  <textarea id="metaDescription" className="admin-form-textarea" value={metaDescription} onChange={(e) => setMetaDescription(e.target.value)} required />
                </div>
              </div>
            </div>
          </div>

          <div className="admin-form-layout">
            <div className="admin-form-card">
              <div className="admin-form-section">
                <h2 className="admin-form-section__title">
                  <FileText size={16} style={{ verticalAlign: "middle", marginRight: 6 }} />
                  Blog Details
                </h2>
                <div className="admin-form-grid">
                  <div className="admin-form-group admin-form-group--full">
                    <label className="admin-form-label" htmlFor="blogName">Blog Name</label>
                    <input id="blogName" className="admin-form-input" value={blogName} onChange={(e) => setBlogName(e.target.value)} />
                  </div>
                  <div className="admin-form-group">
                    <label className="admin-form-label" htmlFor="blogDate">Blog Date</label>
                    <input id="blogDate" type="date" className="admin-form-input" value={blogDate} onChange={(e) => setBlogDate(e.target.value)} />
                  </div>
                  <div className="admin-form-group">
                    <label className="admin-form-label" htmlFor="blogLink">Blog Slug</label>
                    <input id="blogLink" className="admin-form-input" value={blogLink} onChange={(e) => setBlogLink(e.target.value)} placeholder="my-blog-post" />
                  </div>
                  <div className="admin-form-group">
                    <label className="admin-form-label" htmlFor="imgName">Image Name</label>
                    <input id="imgName" className="admin-form-input" value={imgName} onChange={(e) => setImgName(e.target.value)} />
                  </div>
                  {blogLink && (
                    <div className="admin-form-group admin-form-group--full">
                      <div className="admin-slug-preview">
                        <Link2 size={15} />
                        Live page:{" "}
                        <a href={getBlogPageUrl(blogLink)} target="_blank" rel="noopener noreferrer">
                          {getBlogPageUrl(blogLink)}
                        </a>
                      </div>
                    </div>
                  )}
                  <div className="admin-form-group admin-form-group--full">
                    <label className="admin-form-checkbox" htmlFor="showOnHomepage">
                      <input type="checkbox" id="showOnHomepage" checked={showOnHomepage} onChange={(e) => setShowOnHomepage(e.target.checked)} />
                      <Home size={16} />
                      <span>Show on Homepage</span>
                    </label>
                  </div>
                </div>
              </div>
            </div>

            <div className="admin-form-card">
              <div className="admin-form-section">
                <h2 className="admin-form-section__title">
                  <Image size={16} style={{ verticalAlign: "middle", marginRight: 6 }} />
                  Featured Image
                </h2>
                <input
                  id="blog-file-upload"
                  ref={fileInputRef}
                  type="file"
                  className="admin-upload__input"
                  accept=".jpg,.jpeg,.png,.webp,.pdf"
                  onChange={handleFileInput}
                />
                {!previewURL ? (
                  <label htmlFor="blog-file-upload" className="admin-upload">
                    <div className="admin-upload__icon"><Upload size={22} /></div>
                    <p className="admin-upload__title">Drop image here or browse</p>
                    <p className="admin-upload__text">Supports JPG, PNG, WEBP</p>
                    <span className="admin-upload__browse"><Image size={14} /> Choose Image</span>
                  </label>
                ) : (
                  <div className="admin-gallery-preview">
                    <div className="admin-preview__header">
                      <span>Preview</span>
                      <div className="admin-action-group">
                        <button type="button" className="admin-btn admin-btn--secondary" style={{ padding: "6px 12px", fontSize: "0.75rem" }} onClick={() => fileInputRef.current?.click()}>Change</button>
                        <button type="button" className="admin-preview__remove" onClick={handleRemoveFile} aria-label="Remove"><X size={16} /></button>
                      </div>
                    </div>
                    <img src={previewURL} alt="Blog preview" />
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="admin-form-card">
            <div className="admin-form-section">
              <h2 className="admin-form-section__title">Short Overview</h2>
              <div className="admin-form-editor">
                <TextEditor value={shortOverview} onChange={setShortOverview} height={120} />
              </div>
            </div>
          </div>

          <div className="admin-form-card">
            <div className="admin-form-section">
              <h2 className="admin-form-section__title">Table of Contents</h2>
              <div className="admin-form-editor">
                <TextEditor value={tableContent} onChange={setTableContent} height={150} />
              </div>
            </div>
          </div>

          <div className="admin-form-card">
            <div className="admin-form-section">
              <h2 className="admin-form-section__title">Blog Description</h2>
              <div className="admin-form-editor">
                <TextEditor value={blogDesc} onChange={setBlogDesc} />
              </div>
            </div>
          </div>

          <div className="admin-form-card">
            <div className="admin-form-section">
              <h2 className="admin-form-section__title">
                <Code size={16} style={{ verticalAlign: "middle", marginRight: 6 }} />
                Schema Markup
              </h2>
              <textarea className="admin-form-textarea admin-form-textarea--code" value={blogSchema} onChange={(e) => setBlogSchema(e.target.value)} placeholder='{"@context": "https://schema.org", ...}' />
            </div>

            <div className="admin-form-footer admin-form-footer--split">
              <span className="admin-form-footer__note">Save blog content and metadata.</span>
              <div className="admin-page__actions">
                <Link to="/manage-blogs" className="admin-btn admin-btn--secondary">Cancel</Link>
                <button type="submit" className="admin-btn admin-btn--primary" disabled={isSubmitting}>
                  <Save size={18} />
                  {isSubmitting ? "Saving…" : isEdit ? "Update Blog" : "Create Blog"}
                </button>
              </div>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
};

export default AddBlog;

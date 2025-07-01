import React, { useState, useEffect, useRef } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import axiosInstance, { BASE_IMAGE_URL } from "../../utils/axiosInstnace";
import TextEditor from "../../common/ckEditor";

const AddEvent = () => {
  const { slug } = useParams();
  const navigate = useNavigate();

  const [metaTitle, setMetaTitle] = useState("");
  const [metaKeywords, setMetaKeywords] = useState("");
  const [metaDescription, setMetaDescription] = useState("");
  const [eventName, setEventName] = useState("");
  const [eventURL, setEventURL] = useState("");
  const [eventDesc, setEventDesc] = useState("");
  const [schema, setSchema] = useState("");
  const [file, setFile] = useState(null);
  const [previewURL, setPreviewURL] = useState("");
  const fileInputRef = useRef(null);

  // Fetch categories and tour (if editing)
  useEffect(() => {
    if (slug) {
      axiosInstance
        .get(`/events/${slug}`)
        .then((response) => {
          const data = response.data;

          setMetaTitle(data.metaTitle || "");
          setMetaKeywords(data.metaKeywords || "");
          setMetaDescription(data.metaDescription || "");
          setEventName(data.eventName || "");
          setEventDesc(data?.eventDesc || "");
          setSchema(data.schema || "");
          setEventURL(data.eventURL || "");
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
      //   console.log(selectedFile, "file");
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
      formData.append("eventName", eventName);
      formData.append("eventDesc", eventDesc);
      formData.append("schema", schema);
      formData.append("eventURL", eventURL);

      if (file) {
        formData.append("attached_document", file);
      }
      if (slug) {
        await axiosInstance.post(`/events/update/${slug}`, formData, {
          headers: { "Content-Type": "multipart/form-data" },
        });
      } else {
        await axiosInstance.post("/events/add", formData, {
          headers: { "Content-Type": "multipart/form-data" },
        });
      }

      navigate("/manage-events");
    } catch (err) {
      console.error("Error submitting tour:", err);
    }
  };

  return (
    <div className="bg-light">
      <div className="container-lg">
        <div className="py-5 px-4 bg-white mvh-100">
          <div className="d-flex justify-content-between align-items-center mb-3">
            <h2>{slug ? "Edit Event" : "Add Event"}</h2>
            <Link to="/manage-events">
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
                <label>Event Name</label>
                <input
                  type="text"
                  className="form-control"
                  value={eventName}
                  onChange={(e) => setEventName(e.target.value)}
                />
              </div>
              <div className="col-md-12">
                <label>Event Description</label>
                <TextEditor value={eventDesc} onChange={setEventDesc} />
              </div>

               <div className="col-md-12">
                <label>Schema</label>
                <textarea
                  type="text"
                  className="form-control"
                  value={schema}
                  onChange={(e) => setSchema(e.target.value)}
                />
              </div>
              <div className="col-md-6">
                <label>Event File</label>
                <input
                  type="file"
                  className="form-control"
                  accept=".jpg,.png,.pdf,.webp"
                  onChange={handleFileChange}
                  ref={fileInputRef}
                />
                {previewURL && (
                  <div className="mt-2">
                    <img
                      src={previewURL}
                      alt="Event Preview"
                      style={{
                        maxWidth: "100%",
                        maxHeight: "150px",
                        borderRadius: "5px",
                      }}
                    />
                  </div>
                )}
              </div>
              <div className="col-md-6">
                <label>Event URL</label>
                <input
                  type="text"
                  className="form-control"
                  value={eventURL}
                  onChange={(e) => setEventURL(e.target.value)}
                />
              </div>
            </div>

            <button type="submit" className="btn btn-primary mt-4">
              {slug ? "Update Event" : "Create Event"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default AddEvent;

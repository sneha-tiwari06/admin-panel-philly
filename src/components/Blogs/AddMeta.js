import React, { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import axiosInstance from "../../utils/axiosInstnace";

const AddMeta = () => {
  const { slug, id } = useParams();
  const navigate = useNavigate();
  const [metaName, setMetaName] = useState("");
  const [metaValue, setMetaValue] = useState("");
  const [loading, setLoading] = useState(false);
  const isEdit = Boolean(id);

  useEffect(() => {
    if (id) {
      axiosInstance
        .get(`/meta/${id}`)
        .then((response) => {
          const data = response.data;
          setMetaName(data.metaName || "");
          setMetaValue(data.metaValue || "");
        })
        .catch((err) => console.error("Error fetching meta details:", err));
    }
  }, [id]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (isEdit) {
        await axiosInstance.post(`/meta/update/${id}`, {
          metaName,
          metaValue,
        });
      } else {
        await axiosInstance.post("/meta/add", {
          blogSlug: slug,
          metaName,
          metaValue,
        });
      }
      navigate(`/manage-meta/${slug}`);
    } catch (err) {
      console.error("Error submitting meta:", err);
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
            <h2>{isEdit ? "Edit Meta" : "Add New Meta"}</h2>
            <Link to={slug ? `/manage-meta/${slug}` : "/manage-blogs"}>
              <button className="btn btn-primary">Back</button>
            </Link>
          </div>

          <form onSubmit={handleSubmit}>
            <div className="row gx-3 gy-4">
              <div className="col-md-6">
                <label>Meta/Schema Name</label>
                <input
                  type="text"
                  className="form-control"
                  value={metaName}
                  onChange={(e) => setMetaName(e.target.value)}
                  required
                />
              </div>

              <div className="col-md-12">
                <label>Meta/Schema</label>
                <textarea
                  className="form-control"
                  value={metaValue}
                  onChange={(e) => setMetaValue(e.target.value)}
                  required
                />
              </div>
            </div>
            <button type="submit" className="btn btn-primary mt-4" disabled={loading}>
              {isEdit ? "Update Meta" : "Create Meta"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default AddMeta
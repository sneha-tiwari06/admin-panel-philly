import React, { useState, useEffect, useRef } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import axiosInstance, { BASE_IMAGE_URL } from "../../utils/axiosInstnace";

const BlockDate = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [blockDate, setBlockDate] = useState("");
  const [isActive, setIsActive] = useState(true);

  useEffect(() => {
    if (id) {
      axiosInstance
        .get(`/block-date/${id}`)
        .then((response) => {
          const data = response.data;
          setBlockDate(data?.blockDate ? data.blockDate.slice(0, 10) : "");
          setIsActive(data?.isActive ?? true);
        })
        .catch((err) => console.error("Error fetching category details:", err));
    }
  }, [id]);
  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const payload = { blockDate }; // no FormData needed

      if (id) {
        await axiosInstance.post(`/block-date/update/${id}`, payload);
      } else {
        await axiosInstance.post("/block-date/add", payload);
      }

      navigate("/manage-block-dates");
    } catch (err) {
      console.error("Error submitting date:", err);
    }
  };

  return (
    <div className="bg-light">
      <div className="container-lg">
        <div className="py-5 px-4 bg-white mvh-100">
          <div className="d-flex justify-content-between align-items-center mb-3">
            <h2>{id ? "Edit Date" : "Add Date"}</h2>
            <Link to="/manage-block-dates">
              <button className="btn btn-primary">Back</button>
            </Link>
          </div>

          <form onSubmit={handleSubmit}>
            <div className="row gx-3 gy-4">
              <div className="col-md-12">
                <label>Block Date</label>
                <input
                  type="date"
                  className="form-control"
                  value={blockDate}
                  onChange={(e) => setBlockDate(e.target.value)}
                />
              </div>
            </div>
            <button type="submit" className="btn btn-primary mt-4">
              {id ? "Update Block Date" : "Create Block Date"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default BlockDate;

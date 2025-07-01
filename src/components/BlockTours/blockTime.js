import React, { useState, useEffect, useRef } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import axiosInstance, { BASE_IMAGE_URL } from "../../utils/axiosInstnace";

const BlockTime = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [blockDate, setBlockDate] = useState("");
  const [blockTime, setBlockTime] = useState("");

  useEffect(() => {
    if (id) {
      axiosInstance
        .get(`/block-time/${id}`)
        .then((response) => {
          const data = response.data;
          setBlockDate(data?.blockDate ? data.blockDate.slice(0, 10) : "");
          setBlockTime(data?.blockTime || "");
        })
        .catch((err) => console.error("Error fetching Block times:", err));
    }
  }, [id]);
  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const payload = { blockDate, blockTime }; // no FormData needed

      if (id) {
        await axiosInstance.post(`/block-time/update/${id}`, payload);
      } else {
        await axiosInstance.post("/block-time/add", payload);
      }

      navigate("/manage-block-times");
    } catch (err) {
      console.error("Error submitting time slot:", err);
    }
  };

  return (
    <div className="bg-light">
      <div className="container-lg">
        <div className="py-5 px-4 bg-white mvh-100">
          <div className="d-flex justify-content-between align-items-center mb-3">
            <h2>{id ? "Edit Time" : "Add Time"}</h2>
            <Link to="/manage-block-times">
              <button className="btn btn-primary">Back</button>
            </Link>
          </div>

          <form onSubmit={handleSubmit}>
            <div className="row gx-3 gy-4">
              <div className="col-md-12">
                <label>Blog Date</label>
                <input
                  type="date"
                  className="form-control"
                  value={blockDate}
                  onChange={(e) => setBlockDate(e.target.value)}
                />
              </div>
              <div className="col-md-12">
                <label>Block Time</label>
                <select
                  className="form-control"
                  value={blockTime}
                  onChange={(e) => setBlockTime(e.target.value)}
                >
                  <option value="">Select Time</option>
                  <option value="10:00 AM">10:00 AM</option>
                  <option value="01:00 PM">01:00 PM</option>
                  <option value="04:00 PM">04:00 PM</option>
                  <option value="07:00 PM">07:00 PM</option>
                </select>
              </div>
            </div>
            <button type="submit" className="btn btn-primary mt-4">
              {id ? "Update Block Time" : "Create Block Time"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default BlockTime;

import React, { useEffect, useState } from "react";
import axiosInstance from "../../utils/axiosInstnace";
import { useNavigate, useParams } from "react-router-dom";

const ManageCars = () => {
  const { id } = useParams();
  const [car, setCar] = useState("");
  const [carName, setCarName] = useState("");
  const [noOfCars, setNoOfCars] = useState("");
  const [noOfSeats, setNoOfSeats] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    if (id) {
      axiosInstance
        .get(`/cars/${id}`)
        .then((response) => {
          const { carName, noOfCars, noOfSeats } = response.data;
          setCarName(carName);
          setNoOfCars(noOfCars);
          setNoOfSeats(noOfSeats);
        })
        .catch((err) => console.error("Error fetching cars details:", err));
    }
  }, [id]);
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const formData = {
        carName,
        noOfCars,
        noOfSeats,
      };

      if (id) {
        await axiosInstance.post(`/cars/${id}`, formData, {
          headers: { "Content-Type": "application/json" },
        });
      } else {
        await axiosInstance.post("/cars/add-cars", formData, {
          headers: { "Content-Type": "application/json" },
        });
      }

      setCarName("");
      setNoOfCars("");
      setNoOfSeats("");

      navigate("/manage-cars");
    } catch (err) {
      console.error("Error submitting car data:", err);
    }
  };

  return (
    <div className="bg-light">
      <div className="container-lg">
        <div className="py-5 px-4 bg-white mvh-100">
          <h2 className="title">{id ? "Edit Cars" : "Add Cars"}</h2>
          <form onSubmit={handleSubmit} className="mb-3">
            <div className="row gx-3 gy-4">
              <div className="col-md-4">
                <label htmlFor="carName">Car Name</label>
                <input
                  id="carName"
                  className="form-control mb-2"
                  type="text"
                  value={carName}
                  onChange={(e) => setCarName(e.target.value)}
                  required
                />
              </div>
              <div className="col-md-4">
                <label htmlFor="noOfCars">No. of Cars</label>
                <input
                  id="noOfCars"
                  className="form-control mb-2"
                  type="number"
                  value={noOfCars}
                  onChange={(e) => setNoOfCars(e.target.value)}
                  required
                />
              </div>
              <div className="col-md-4">
                <label htmlFor="noOfSeats">No. of Seats</label>
                <input
                  id="noOfSeats"
                  className="form-control mb-2"
                  type="number"
                  value={noOfSeats}
                  onChange={(e) => setNoOfSeats(e.target.value)}
                  required
                />
              </div>
            </div>

            <button className="btn btn-primary w-auto mt-2" type="submit">
              Submit
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ManageCars;

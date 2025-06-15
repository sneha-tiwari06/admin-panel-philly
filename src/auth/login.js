// src/auth/Login.js
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import axiosInstance from "../utils/axiosInstnace";

function Login() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();

    try {
      const response = await axiosInstance.post("/users/login", {
        username,
        password,
      });
      const data = response.data;
      if (response.status === 200) {
        localStorage.setItem("token", data.token);
        localStorage.setItem("role", data.role);
        sessionStorage.setItem("token", data.token);
        sessionStorage.setItem("role", data.role);
        if (data.role === "subadmin") {
          navigate("/dashboard-subadmin");
        } else {
          navigate("/dashboard");
        }
      }
    } catch (error) {
      if (error.response && error.response.data.error) {
        setErrorMessage(error.response.data.error);
      } else {
        setErrorMessage("Wrong Username or Password");
      }
    }
  };

  return (
    <div className="wrapper d-flex align-items-center justify-content-center p-4 p-md-5">
      <img
        src="../bg.jpg"
        className="position-absolute end-0 top-50 translate-middle-y abstract-bg"
        alt=""
        style={{ width: "256px" }}
      />
      <div className="container">
        <div className="row justify-content-center">
          <div className="col-12 col-xl-10">
            <div className="card border-0 rounded-0">
              <div className="row g-0">
                <div className="col-12 col-md-5 bg-purple-gradient position-relative">
                  <img
                    src="../loginPage.jpg"
                    alt="Blurred Background"
                    className="left-blurred-bg"
                  />
                  <img
                    src="../loginPage.jpg"
                    className="w-100 h-100 object-fit-cover left-image-foreground"
                    alt="Illustration"
                  />

                  {/* <div className="position-absolute top-0 start-0 p-4 left-image-foreground">
                    <h2 className="logo text-white fs-3 mb-0">logo</h2>
                  </div> */}
                </div>

                <div className="col-12 col-md-7 p-4 p-sm-5 position-relative">
                  <div className="mb-4 mt-2">
                    <h1 className="fs-3 fw-bold text-dark mb-2">
                      Philly City Tours
                    </h1>
                    <div
                      className="bg-primary"
                      style={{ width: "48px", height: "4px" }}
                    ></div>
                  </div>
                  <form onSubmit={handleLogin}>
                    <div className="row g-3">
                      <div className="col-12 col-md-6">
                        <label for="username" className="form-label mb-1">
                          User Name
                        </label>
                        <input
                          type="text"
                          id="username"
                          className="form-control"
                          placeholder="Enter user name"
                          value={username}
                          onChange={(e) => setUsername(e.target.value)}
                          required
                        />
                      </div>
                      <div className="col-12 col-md-6">
                        <label for="password" className="form-label mb-1">
                          Password
                        </label>
                        <input
                          type="password"
                          id="password"
                          className="form-control"
                          placeholder="Enter Password"
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          required
                        />
                      </div>
                      <div className="col-12">
                        <button
                          type="submit"
                          className="btn btn-primary w-100 btn-next d-flex align-items-center justify-content-between"
                        >
                          <span>Submit</span>
                          <i className="ri-arrow-right-line"></i>
                        </button>
                      </div>
                      {errorMessage && (
                        <p style={{ color: "red" }}>{errorMessage}</p>
                      )}{" "}
                    </div>
                  </form>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Login;

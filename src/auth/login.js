// src/auth/Login.js
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import axiosInstance from "../utils/axiosInstnace";

function Login() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [errorMessage, setErrorMessage] = useState(""); // State for error message
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
        navigate("/dashboard");
      }
    } catch (error) {
      if (error.response && error.response.data.error) {
        setErrorMessage(error.response.data.error); // Set error message based on backend response
      } else {
        setErrorMessage("Wrong Username or Password");
      }
    }
  };

  const handleRegister = async (e) => {
    e.preventDefault();

    try {
      const response = await axiosInstance.post("/users/register", {
        username,
        password,
      });
      if (response.status === 201) {
        alert("Registration successful!");
        navigate("/");
      } else {
        alert(response.data.message);
      }
    } catch (error) {
      console.error("Error registering:", error);
    }
  };

  return (
    <div className="body2">
      <div className="main2">
        <input className="input2" type="checkbox" id="chk" aria-hidden="true" />

        <div className="signup">
          <form onSubmit={handleLogin}>
            <label className="label2" htmlFor="chk" aria-hidden="true">
              Philly City Tours
            </label>
            {errorMessage && <p style={{ color: "red" }}>{errorMessage}</p>}{" "}
            {/* Display error message */}
            <input
              className="input2"
              type="text"
              placeholder="Username or Email"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
            />
            <input
              className="input2"
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
            <button  className="button2 button-save log-out-btn" type="submit">Login</button>
          </form>
        </div>

        <div className="login">
          <form onSubmit={handleRegister}>
            <label className="label2" htmlFor="chk" aria-hidden="true">
              Sign up
            </label>
            <input
              className="input2"
              type="text"
              placeholder="Enter Username"
              id="username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
            />
            <input
              className="input2"
              type="password"
              placeholder="Enter Password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
            <button className="button2">Sign up</button>
          </form>
        </div>
      </div>
    </div>
  );
}

export default Login;

// src/auth/Register.js
import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import axiosInstance from "../utils/axiosInstnace";

function Register() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  const handleRegister = async (e) => {
    e.preventDefault();

    try {
      const response = await axiosInstance.post('/users/register', { username, password });
      if (response.status === 201) {
        alert("Registration successful!");
        navigate('/');
      } else {
        alert(response.data.message);
      }
    } catch (error) {
      console.error('Error registering:', error);
    }
  };

  return (
    <div>
        <div className="background">
        <div className="shape"></div>
        <div className="shape"></div>
      </div>
      <form className="login-form" onSubmit={handleRegister}>
        <h3>Register Here</h3>
        <label htmlFor="username">Username</label>
        <input
          type="text"
          placeholder="Enter Username"
          id="username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
        />
        <label htmlFor="password">Password</label>
        <input
          type="password"
          placeholder="Enter Password"
          id="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        <button type="submit">Register</button>
        <p className="mt-2">Already have an account? <Link to="/">Login</Link></p>
      </form>
    </div>
  );
}

export default Register;

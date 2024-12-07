import React, { useState } from "react";
import "./Register.css"; 
import { useNavigate } from "react-router-dom";

const Register = () => {
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
  });
  const [message, setMessage] = useState("");
  const navigate = useNavigate();

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault(); 
    try {
      const response = await fetch(
        `${import.meta.env.VITE_BACKEND_API_URL}/register`, //replace "VITE_API_BASE_URL" when deploy
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(formData), 
        }
      );
  
      if (response.ok) {
        const responseData = await response.json();
        setMessage(responseData.message || "Registration successful! You can now login.");
        setFormData({ username: "", email: "", password: "" }); //clear the form
        navigate("/login"); //direct to the login page
      } else {
        const errorData = await response.json();
        setMessage("Registration failed: " + (errorData.error || "Unknown error"));
      }
    } catch (error) {
      setMessage("An error occurred. Please try again later.");//error handling
    }
  };
  

  return (
    <div className="register-container">
      <h1>Register</h1>
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="username">Username</label>
          <input
            type="text"
            id="username"
            name="username"
            value={formData.username}
            onChange={handleInputChange}
            required
          />
        </div>
        <div className="form-group">
          <label htmlFor="email">Email</label>
          <input
            type="email"
            id="email"
            name="email"
            value={formData.email}
            onChange={handleInputChange}
            required
          />
        </div>
        <div className="form-group">
          <label htmlFor="password">Password</label>
          <input
            type="password"
            id="password"
            name="password"
            value={formData.password}
            onChange={handleInputChange}
            required
          />
        </div>
        <button type="submit" className="register-button">Register</button>
      </form>
      {message && <p className="message">{message}</p>}
    </div>
  );
};

export default Register;

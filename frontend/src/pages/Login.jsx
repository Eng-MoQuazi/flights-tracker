import React, { useState } from "react";
import "./Login.css"; 
import { useNavigate } from "react-router-dom";

const Login = () => {
  const [formData, setFormData] = useState({ username: "", password: "" });
  const [message, setMessage] = useState("");
  const navigate = useNavigate();

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault(); // 防止默認表單提交
  
    try {
      // 打印表單數據
      console.log("Form Data:", formData);
  
      const response = await fetch(`${import.meta.env.VITE_BACKEND_API_URL}/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData), // 傳遞表單數據
      });
  
      if (response.ok) {
        const data = await response.json();
        console.log("Token received:", data.token); // 打印接收到的 Token
        localStorage.setItem("token", data.token);
        setMessage("Login successful!");
        navigate("/");
      } else {
        const errorData = await response.json();
        console.error("Login failed:", errorData); // 打印錯誤數據
        setMessage(errorData || "Invalid credentials");
      }
    } catch (error) {
      console.error("An error occurred:", error.message);
      setMessage("An error occurred. Please try again later.");
    }
  };
  
  
  
  

  return (
    <div className="login-container">
      <h1>Login</h1>
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
        <button type="submit" className="login-button">Login</button>
      </form>
      {message && <p className="message">{message}</p>}
    </div>
  );
};

export default Login;

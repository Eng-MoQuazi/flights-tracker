import React from "react";
import { Link } from "react-router-dom";
import "./Dashboard.css";

const Dashboard = () => {
  return (
    <div className="dashboard-container">
      <h1>Welcome to Flight Tracker</h1>
      <p>Track your flights and manage your travel with ease!</p>
      <div className="dashboard-links">
        <Link to="/flight-list" className="dashboard-link">
          View Flight List
        </Link>
        <Link to="/add-flight" className="dashboard-link">
          Add a New Flight
        </Link>
      </div>
    </div>
  );
};

export default Dashboard;

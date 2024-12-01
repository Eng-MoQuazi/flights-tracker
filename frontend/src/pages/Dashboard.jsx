import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import "./Dashboard.css";

const Dashboard = () => {
  const [flightNumber, setFlightNumber] = useState(""); // state for the search input
  const [searchResult, setSearchResult] = useState(null); // state to store flight details
  const [error, setError] = useState("");

  const handleSearch = async () => {
    if (!flightNumber) {
      alert("Please enter a flight number!");
      return;
    }

    try {
      const token = localStorage.getItem("token"); // Check if user is logged in
      const isLoggedIn = !!token;

      const endpoint = isLoggedIn
        ? "http://localhost:3000/api/protected-flights" // Use Protected Route if logged in
        : "http://localhost:3000/api/public-flights";   // Use Public Route if not logged in

      const options = {
        method: "GET",
        headers: isLoggedIn
          ? {
              Authorization: `Bearer ${token}`, // Include token for protected route
            }
          : {},
      };

      const response = await fetch(`${endpoint}?flightNumber=${flightNumber}`, options);
      if (!response.ok) {
        throw new Error("Flight not found or unauthorized!");
      }

      const data = await response.json();
      setSearchResult(data);
      setError("");
    } catch (error) {
      setError(error.message);
      setSearchResult(null);
    }
  };

  return (
    <div className="dashboard-container">
      <h1>Welcome to Flight Tracker</h1>
      <p>Track your flights and manage your travel with ease!</p>

      {/* Search by Flight Number */}
      <div className="search-section">
        <h2>Search by Flight Number</h2>
        <input
          type="text"
          value={flightNumber}
          onChange={(e) => setFlightNumber(e.target.value)}
          placeholder="Enter flight number"
          className="search-input"
        />
        <button onClick={handleSearch} className="search-button">
          Search
        </button>
      </div>

      {/* Error Display */}
      {error && <p className="error-message">{error}</p>}

      {/* Display Search Results */}
      {searchResult && (
        <div className="search-result">
          <h3>Flight Details</h3>
          {Array.isArray(searchResult) ? (
            searchResult.map((flight, index) => (
              <div key={index}>
                <p><strong>Flight Number:</strong> {flight.flightNumber}</p>
                <p><strong>Status:</strong> {flight.status}</p>
                <p><strong>Departure:</strong> {flight.departure}</p>
                <p><strong>Arrival:</strong> {flight.arrival}</p>
                {flight.departureAirport && (
                  <p><strong>Departure Airport:</strong> {flight.departureAirport}</p>
                )}
                {flight.arrivalAirport && (
                  <p><strong>Arrival Airport:</strong> {flight.arrivalAirport}</p>
                )}
              </div>
            ))
          ) : (
            <p>No flight data available.</p>
          )}
        </div>
      )}

      {/* Other Links */}
      <div className="dashboard-links">
        <Link to="/add-flight" className="dashboard-link">
          Add a New Flight
        </Link>
      </div>
    </div>
  );
};

export default Dashboard;

import React, { useState } from "react";
import { Link } from "react-router-dom";
import "./Dashboard.css";

const API_BASE_URL = import.meta.env.VITE_BACKEND_API_URL;

const Dashboard = () => {
  const [flightNumber, setFlightNumber] = useState(""); // search field
  const [searchResult, setSearchResult] = useState(null); // search result
  const [error, setError] = useState(""); // err msg

  // search flight
  const handleSearch = async () => {
    if (!flightNumber) {
      alert("Please enter a flight number!");
      return;
    }

    try {
      const token = localStorage.getItem("token"); // get JWT token
      const isLoggedIn = !!token; // check if it is log in

      const endpoint = isLoggedIn
        ? `${API_BASE_URL}/api/protected-flights`
        : `${API_BASE_URL}/api/public-flights`;

      const options = {
        method: "GET",
        headers: isLoggedIn
          ? { Authorization: `Bearer ${token}` }
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

  // add flights to "My Flights"
  const addToMyFlights = async (flight) => {
    try {
      const token = localStorage.getItem("token");

      const response = await fetch(`${API_BASE_URL}/api/my-flights`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(flight),
      });

      if (!response.ok) {
        throw new Error("Failed to add flight to My Flights");
      }

      alert("Flight added to My Flights successfully!");
    } catch (error) {
      console.error(error.message);
      alert("Error adding flight: " + error.message);
    }
  };

  return (
    <div className="dashboard-container">
      <h1>Welcome to Flight Tracker</h1>
      <p>Track your flights and manage your travel with ease!</p>

      {}
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

      {/* show the err msg */}
      {error && <p className="error-message">{error}</p>}

      {/* show the search results */}
      {searchResult && (
        <div className="search-result">
          <h3>Flight Details</h3>
          {Array.isArray(searchResult) ? (
            searchResult.map((flight, index) => (
              <div key={index} className="flight-card">
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
                <button onClick={() => addToMyFlights(flight)} className="add-flight-button">
                  Add to My Flights
                </button>
              </div>
            ))
          ) : (
            <p>No flight data available.</p>
          )}
        </div>
      )}

      {}
      <div className="dashboard-links">
        <Link to="/my-flights" className="dashboard-link">
          View My Flights
        </Link>
      </div>
    </div>
  );
};

export default Dashboard;

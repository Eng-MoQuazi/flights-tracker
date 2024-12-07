import React, { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import "./Dashboard.css";

const Dashboard = () => {
  const [flightNumber, setFlightNumber] = useState(""); // state for the search input
  const [searchResult, setSearchResult] = useState(null); // state to store flight details
  const [error, setError] = useState("");
  

  const location = useLocation();

  useEffect(() => {
    if (location.pathname === "/dashboard") {
      setSearchResult(null); // clear search result
      setFlightNumber("");   // clear text field
      setError("");          // clear err msg
    }
  }, [location.pathname]);

  const handleSearch = async () => {
    if (!flightNumber) {
      alert("Please enter a flight number!");
      return;
    }

    try {
      const token = localStorage.getItem("token");
      const isLoggedIn = !!token;
      const BASE_URL = import.meta.env.VITE_BACKEND_API_URL; //replace api when deploy

      const endpoint = isLoggedIn
      ? `${BASE_URL}/api/protected-flights`
      : `${BASE_URL}/api/public-flights`;

      const options = {
        method: "GET",
        headers: isLoggedIn
          ? {
              Authorization: `Bearer ${token}`,
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

  const handleAddToMyFlights = async (flight) => {
    try {
      const token = localStorage.getItem("token");
      console.log("Token:", token); // 確認是否成功獲取 Token
  
      const BASE_URL = import.meta.env.VITE_API_BASE_URL;
  
      const response = await fetch(`${BASE_URL}/api/my-flights`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`, // 確保 Header 包含 Token
        },
        body: JSON.stringify(flight),
      });
  
      if (response.ok) {
        alert("Flight added successfully!");
      } else {
        throw new Error("Failed to add flight");
      }
    } catch (error) {
      console.error("Error adding flight:", error.message);
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
        <button
          onClick={() => {
            setSearchResult(null);
            setFlightNumber("");
            setError("");
          }}
          className="clear-button"
        >
          Clear
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
                <p><strong>Airline:</strong> {flight.airline}</p>
                <button onClick={() => handleAddToMyFlights(flight)}>Add to My Flights</button>
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
        <Link to="/my-flights" className="my-flights-link">
          View My Flights
        </Link>
      </div>
    </div>
  );
};



export default Dashboard;

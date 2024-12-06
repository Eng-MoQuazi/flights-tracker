import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import FlightMap from '../components/FlightMap';
import "./Dashboard.css";

const Dashboard = () => {
  const [flightNumber, setFlightNumber] = useState("");
  const [searchResult, setSearchResult] = useState(null);
  const [error, setError] = useState("");
  const [showMap, setShowMap] = useState(false);
  const [flightData, setFlightData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [username, setUsername] = useState("");

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      fetch('/api/dashboard', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })
      .then(res => res.json())
      .then(data => setUsername(data.username))
      .catch(err => setError('Error fetching user data'));
    }
  }, []);

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!flightNumber) {
      alert("Please enter a flight number!");
      return;
    }

    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`/api/flights?flightNumber=${flightNumber}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        throw new Error("Flight not found or unauthorized!");
      }

      const data = await response.json();
      setFlightData(data);
      setShowMap(true);
      setError("");
    } catch (error) {
      setError(error.message);
      setShowMap(false);
    }
  };

  const FlightInfo = ({ data }) => {
    if (!data) return null;
    
    return (
      <div className="flight-info-container">
        <h2 className="flight-info-heading">Flight Number: {flightNumber.toUpperCase()}</h2>
        
        <div className="flight-info-details">
          <p><strong>Status:</strong> {data.flight_status}</p>
          <p><strong>Departure:</strong> {data.departure?.scheduled}</p>
          <p><strong>Arrival:</strong> {data.arrival?.scheduled}</p>
          <p><strong>Departure Airport:</strong> {data.departure?.airport}</p>
          <p><strong>Arrival Airport:</strong> {data.arrival?.airport}</p>
          {data.airline && <p><strong>Airline:</strong> {data.airline.name}</p>}
          <p><strong>Flight Number:</strong> {flightNumber.toUpperCase()}</p>
        </div>
      </div>
    );
  };

  return (
    <div className="dashboard-container">
      <h1 className="dashboard-title">Track your flights and manage your travel with ease!</h1>
      
      <div className="search-section">
        <form onSubmit={handleSearch}>
          <input
            type="text"
            value={flightNumber}
            onChange={(e) => setFlightNumber(e.target.value)}
            placeholder="Enter flight number (e.g., AA123)"
            className="flight-input"
          />
          <button type="submit" className="search-button">
            Search
          </button>
        </form>
      </div>

      {error && <div className="error-message">{error}</div>}

      {showMap && flightData && (
        <>
          <FlightInfo data={flightData} />
          <div className="map-section">
            <FlightMap flightData={flightData} />
          </div>
        </>
      )}

      <div className="dashboard-links">
        <Link to="/flight-list" className="dashboard-link">View Flight List</Link>
        <Link to="/add-flight" className="dashboard-link">Add a New Flight</Link>
      </div>
    </div>
  );
};

export default Dashboard;
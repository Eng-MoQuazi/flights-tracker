import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import L from "leaflet";
import "./Dashboard.css";

const API_BASE_URL = import.meta.env.VITE_BACKEND_API_URL;

const Dashboard = () => {
  const [flightNumber, setFlightNumber] = useState(""); // search field
  const [searchResult, setSearchResult] = useState(null); // search result
  const [error, setError] = useState(""); // err msg
  const [map, setMap] = useState(null); // Map instance

  // search flight
  const handleSearch = async () => {
    console.log("Search initiated for flight:", flightNumber); // 確認函數被觸發
  
    if (!flightNumber) {
      alert("Please enter a flight number!");
      return;
    }
  
    try {
      const token = localStorage.getItem("token"); // 獲取 JWT token
      console.log("JWT Token:", token); // 確認是否獲取到 token
  
      const isLoggedIn = !!token; // 確認是否已登入
      console.log("Is Logged In:", isLoggedIn); // 打印登入狀態
  
      const endpoint = isLoggedIn
        ? `${API_BASE_URL}/api/protected-flights`
        : `${API_BASE_URL}/api/public-flights`;
      console.log("API Endpoint:", endpoint); // 確認正確的 API 路徑
  
      const options = {
        method: "GET",
        headers: isLoggedIn
          ? { Authorization: `Bearer ${token}` }
          : {},
      };
      console.log("Request Options:", options); // 打印請求選項
  
      const response = await fetch(`${endpoint}?flightNumber=${flightNumber}`, options);
      console.log("Response Status:", response.status); // 打印 API 響應狀態
  
      if (!response.ok) {
        console.error("API Error Response:", response); // 打印錯誤響應
        throw new Error("Flight not found or unauthorized!");
      }
  
      const data = await response.json();
      console.log("API Response Data:", data); // 打印 API 響應數據
  
      setSearchResult(data);
      setError("");
    } catch (error) {
      console.error("Error in handleSearch:", error.message); // 打印錯誤信息
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

  useEffect(() => {
    if (map) {
      map.remove(); // Clear the map before rendering a new one
      setMap(null);
    }

    // Initialize the map if the flight is active
    if (searchResult && searchResult[0]?.status === "active") {
      const { longitude, latitude } = searchResult[0];
      if (longitude && latitude) {
        const newMap = L.map("map").setView([latitude, longitude], 10);

        L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
          maxZoom: 19,
          attribution: "© OpenStreetMap contributors",
        }).addTo(newMap);

        L.marker([latitude, longitude]).addTo(newMap)
          .bindPopup("Flight Location")
          .openPopup();

        setMap(newMap); // Store the map instance
      }
    }
  }, [searchResult]);

  return (
    <div className="dashboard-container">
      <h1>Welcome to Flights Tracker</h1>
      <p>Keep an eye on your flights!</p>

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
                <p><strong>Airline:</strong> {flight.airline}</p>
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

      {/* Map Display */}
      {searchResult && searchResult[0]?.status === "active" && (
        <div id="map" style={{ height: "400px", width: "100%", marginTop: "20px" }}></div>
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

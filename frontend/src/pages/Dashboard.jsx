import React, { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import "./Dashboard.css";

const Dashboard = () => {
  const [flightNumber, setFlightNumber] = useState(""); // 搜索輸入框的狀態
  const [searchResult, setSearchResult] = useState(null); // 搜索結果的狀態
  const [error, setError] = useState(""); // 錯誤信息的狀態
  const [message, setMessage] = useState(""); // **新增的狀態，用於顯示反饋信息**

  const location = useLocation();

  useEffect(() => {
    if (location.pathname === "/dashboard") {
      setSearchResult(null); // 清空搜索結果
      setFlightNumber(""); // 清空搜索框
      setError(""); // 清空錯誤信息
      setMessage(""); // **清空消息狀態**
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
      const BASE_URL = import.meta.env.VITE_BACKEND_API_URL;

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

      const response = await fetch(
        `${endpoint}?flightNumber=${flightNumber}`,
        options
      );

      if (!response.ok) {
        throw new Error("Flight not found or unauthorized!");
      }

      const data = await response.json();
      setSearchResult(data);
      setError(""); // 清空錯誤
    } catch (error) {
      setError(error.message);
      setSearchResult(null);
    }
  };

  const handleAddToMyFlights = async (flight) => {
    try {
      const token = localStorage.getItem("token");
      const BASE_URL = import.meta.env.VITE_API_BASE_URL;

      const response = await fetch(`${BASE_URL}/api/my-flights`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(flight),
      });

      if (response.ok) {
        setMessage("Flight added successfully!"); // **成功時更新消息狀態**
      } else {
        throw new Error("Failed to add flight");
      }
    } catch (error) {
      setMessage(error.message); // **出錯時更新消息狀態**
    }
  };

  return (
    <div className="dashboard-container">
      <h1>Welcome to Flight Tracker</h1>
      <p>Track your flights and manage your travel with ease!</p>

      {/* 顯示反饋消息 */}
      {message && <p className="feedback-message">{message}</p>}

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
            setMessage(""); // **清空消息狀態**
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
                <p>
                  <strong>Flight Number:</strong> {flight.flightNumber}
                </p>
                <p>
                  <strong>Status:</strong> {flight.status}
                </p>
                <p>
                  <strong>Departure:</strong> {flight.departure}
                </p>
                <p>
                  <strong>Arrival:</strong> {flight.arrival}
                </p>
                <button
                  onClick={() => handleAddToMyFlights(flight)}
                  className="add-flight-button"
                >
                  Add to My Flights
                </button>
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

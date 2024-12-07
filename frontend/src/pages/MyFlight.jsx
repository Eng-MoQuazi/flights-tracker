import React, { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import "./MyFlight.css";

const MyFlights = () => {
  const [myFlights, setMyFlights] = useState([]); // FOR SAVED FLIGHT
  const [error, setError] = useState(""); // FOR ERR MSG

  // GET "MY FLIGHT" LIST
  const fetchMyFlights = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/my-flights`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.ok) {
        const data = await response.json();
        setMyFlights(data); 
      } else {
        throw new Error("Failed to fetch My Flights");
      }
    } catch (error) {
      setError(error.message);
    }
  };

  // DELETE FLIGHT FROM "MY FLIGHT"
  const handleRemoveFlight = async (flightNumber) => {
    try {
      const token = localStorage.getItem("token");
      const BASE_URL = import.meta.env.VITE_API_BASE_URL;
      const response = await fetch(`${BASE_URL}/api/my-flights`, { ////replace "VITE_API_BASE_URL" when deploy
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ flightNumber }),
      });

      if (response.ok) {
        alert("Flight removed successfully");
        setMyFlights((prev) => prev.filter(flight => flight.flightNumber !== flightNumber));
      } else {
        throw new Error("Failed to remove flight");
      }
    } catch (error) {
      setError(error.message);
    }
  };

  
  useEffect(() => {
    fetchMyFlights();
  }, []);

  return (
    <div className="my-flights-container">
      <h1>My Flights</h1>
      {error && <p className="error">{error}</p>}
      {myFlights.length === 0 ? (
        <p>No flights added to your list yet.</p>
      ) : (
        <ul>
          {myFlights.map((flight, index) => (
            <li key={index} className="flight-item">
              <p><strong>Flight Number:</strong> {flight.flightNumber}</p>
              <p><strong>Status:</strong> {flight.status}</p>
              <p><strong>Departure:</strong> {flight.departure}</p>
              <p><strong>Arrival:</strong> {flight.arrival}</p>
              <p><strong>Airline:</strong> {flight.airline}</p>
              <button onClick={() => handleRemoveFlight(flight.flightNumber)}>
                Remove
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default MyFlights;

  
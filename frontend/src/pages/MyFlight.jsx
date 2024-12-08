import React, { useState, useEffect } from "react";
import "./MyFlight.css";

const API_BASE_URL = import.meta.env.VITE_BACKEND_API_URL;

const MyFlight = () => {
  const [flights, setFlights] = useState([]);
  const [message, setMessage] = useState("");

  // fetch user's flight
  useEffect(() => {
    const fetchFlights = async () => {
      try {
        const token = localStorage.getItem("token");
        const response = await fetch(`${API_BASE_URL}/api/my-flights`, {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (!response.ok) {
          throw new Error("Failed to fetch flights");
        }

        const data = await response.json();
        console.log("Fetched Flights:", data); 
        setFlights(data.flights || []); 
      } catch (error) {
        console.error("Error fetching flights:", error.message);
        setMessage("Error: " + error.message);
      }
    };

    fetchFlights();
  }, []);

  // remove flight
  const removeFlight = async (flightNumber) => {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`${API_BASE_URL}/api/my-flights`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ flightNumber }), 
      });

      if (!response.ok) {
        throw new Error("Failed to remove flight");
      }

      const data = await response.json();
      alert(data.message); // show success msg

      setFlights(flights.filter((flight) => flight.flightNumber !== flightNumber));
    } catch (error) {
      console.error("Error removing flight:", error.message);
      setMessage("Error: " + error.message);
    }
  };

  return (
    <div className="my-flights-container">
      <h1>My Flights</h1>
      {message && <p className="error-message">{message}</p>}
      {flights.length === 0 ? (
        <p>You have no flights in your list.</p>
      ) : (
        <ul className="flight-list">
          {flights.map((flight, index) => (
            <li key={index} className="flight-card">
              <p><strong>Flight Number:</strong> {flight.flightNumber}</p>
              <p><strong>Status:</strong> {flight.status}</p>
              <p><strong>Departure:</strong> {flight.departure}</p>
              <p><strong>Arrival:</strong> {flight.arrival}</p>
              <p><strong>Airline:</strong> {flight.airline}</p>
              <button
                onClick={() => removeFlight(flight.flightNumber)}
                className="remove-flight-button"
              >
                Remove
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default MyFlight;

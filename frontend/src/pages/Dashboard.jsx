import React, { useState, useEffect } from 'react';
import FlightMap from '../components/FlightMap';

const Dashboard = () => {
  const [flightNumber, setFlightNumber] = useState('');
  const [flightData, setFlightData] = useState(null);
  const [showMap, setShowMap] = useState(false);
  const [username, setUsername] = useState('');
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

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
    setError(null);
    setLoading(true);
    
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/flights?flightNumber=${flightNumber}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (!response.ok) {
        throw new Error(response.status === 404 ? 'Flight not found' : 'Failed to fetch flight data');
      }
      
      const data = await response.json();
      setFlightData(data);
      setShowMap(true);
    } catch (err) {
      setError(err.message);
      setShowMap(false);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="dashboard-container">
      <div className="welcome-section">
        <h1>Welcome, {username}</h1>
      </div>
      
      <div className="search-section">
        <form onSubmit={handleSearch}>
          <input
            type="text"
            value={flightNumber}
            onChange={(e) => setFlightNumber(e.target.value)}
            placeholder="Enter flight number (e.g., AA123)"
            className="flight-input"
          />
          <button type="submit" className="search-button" disabled={loading}>
            {loading ? 'Loading...' : 'Track Flight'}
          </button>
        </form>
        {error && <div className="error-message">{error}</div>}
      </div>

      {showMap && flightData && (
        <div className="map-section">
          <FlightMap flightData={flightData} />
        </div>
      )}
    </div>
  );
};

export default Dashboard;
import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import "./LocationSearch.css";

const API_BASE_URL =
process.env.REACT_APP_API_BASE_URL || "https://webapp-zemg.onrender.com";


const LocationSearch = () => {
  const [lat, setLatitude] = useState("");
  const [lng, setLongitude] = useState("");
  const [dist, setDistance] = useState("3"); 
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const getCurrentLocation = () => {
    if (!navigator.geolocation) {
      alert("Geolocation is not supported by your browser");
      return;
    }

    setLoading(true);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setLatitude(position.coords.latitude.toFixed(6));
        setLongitude(position.coords.longitude.toFixed(6));
        setLoading(false);
      },
      (error) => {
        alert("Unable to retrieve location. Please allow location access.");
        setLoading(false);
      }
    );
  };


  const handleSearch = async (e) => {
    e.preventDefault(); // Prevent form submission
    if (!lat || !lng) {
      setError("Please enter valid latitude and longitude!");
      return;
    }

    try {
      setLoading(true);
      setError("");
      const response = await axios.get(`${API_BASE_URL}/api/restaurants/location`, {
        params: { lat, lng, dist },
      });

      const { restaurants } = response.data;
      navigate(`/all-restaurants`, { state: { restaurants } });
    } catch (error) {
      console.error("❌ Error fetching nearby restaurants:", error);
      setError("Failed to fetch restaurants. Try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="location-search">
      <h3 className="location-search-title">Search by Location</h3>

      <div className="input-group">
        <input
          type="number"
          placeholder="Enter Latitude"
          value={lat}
          onChange={(e) => setLatitude(e.target.value)}
          className="input"
        />
        <input
          type="number"
          placeholder="Enter Longitude"
          value={lng}
          onChange={(e) => setLongitude(e.target.value)}
          className="input"
        />
      </div>

      <button onClick={getCurrentLocation} className="location-btn" disabled={loading}>
        📍 {loading ? "Getting Location..." : "Use Current Location"}
      </button>

      <select value={dist} onChange={(e) => setDistance(e.target.value)} className="dropdown">
        <option value="1">1 km</option>
        <option value="3">3 km</option>
        <option value="5">5 km</option>
        <option value="10">10 km</option>
      </select>

      <button onClick={handleSearch} className="search-btn" disabled={loading}>
        {loading ? "Searching..." : "🔍 Search"}
      </button>

      {error && <p className="error-message">{error}</p>}
    </div>
  );
};

export default LocationSearch;

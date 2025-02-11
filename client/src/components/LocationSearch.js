import React, { useState } from "react";
import "./LocationSearch.css"; // Import CSS for styling

const LocationSearch = ({ onSearch }) => {
  const [lat, setLatitude] = useState("");
  const [lng, setLongitude] = useState("");
  const [dist, setDistance] = useState("3"); // Default to 3km
  const [loading, setLoading] = useState(false); // Loading state for geolocation

  // Function to get user's current location
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

  // Handle Search Button Click
  const handleSearch = () => {
    if (!lat || !lng) {
      alert("Please enter valid latitude and longitude!");
      return;
    }

    console.log(
      `📍 Searching restaurants near (${lat}, ${lng}) within ${dist} km`
    );
    onSearch(lat, lng, dist);
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

      <button
        onClick={getCurrentLocation}
        className="location-btn"
        disabled={loading}
      >
        📍 {loading ? "Getting Location..." : "Use Current Location"}
      </button>

      <select
        value={dist}
        onChange={(e) => setDistance(e.target.value)}
        className="dropdown"
      >
        <option value="1">1 km</option>
        <option value="3">3 km</option>
        <option value="5">5 km</option>
        <option value="10">10 km</option>
      </select>

      <button onClick={handleSearch} className="search-btn">
        🔍 Search
      </button>
    </div>
  );
};

export default LocationSearch;

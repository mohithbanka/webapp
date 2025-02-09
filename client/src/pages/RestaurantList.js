import React, { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { getRestaurants, searchNearbyRestaurants } from "../api";
import RestaurantCard from "../components/RestaurantCard";
import Pagination from "@mui/material/Pagination";
import Stack from "@mui/material/Stack";
import "./RestaurantList.css";

const RestaurantList = () => {
  const [restaurants, setRestaurants] = useState([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const location = useLocation();
  const navigate = useNavigate();

  // Fetch restaurants based on location or pagination
  const fetchRestaurants = async (lat, lng, dist) => {
    try {
      if (lat && lng && dist) {
        // Fetch restaurants based on location (lat, lng, dist)
        const data = await searchNearbyRestaurants(lat, lng, dist);
        setRestaurants(data.restaurants);
        setTotalPages(1); // Only one page for location-based search
      } else {
        // Fallback to paginated restaurant search
        const data = await getRestaurants(page, 12);
        setRestaurants(data.restaurants);
        setTotalPages(data.totalPages);
      }
    } catch (error) {
      console.error("Error fetching restaurants:", error);
    }
  };

  useEffect(() => {
    const queryParams = new URLSearchParams(location.search);
    const lat = queryParams.get("lat");
    const lng = queryParams.get("lng");
    const dist = queryParams.get("dist");
    const pageFromUrl = queryParams.get("page");

    // If lat, lng, and dist are present, fetch restaurants by location
    if (lat && lng && dist) {
      fetchRestaurants(lat, lng, dist);
    } else {
      // Otherwise, fetch paginated restaurants
      if (pageFromUrl) {
        setPage(Number(pageFromUrl));
      } else {
        setPage(1);
      }
      fetchRestaurants(); // Default paginated fetch
    }
  }, [location.search]); // Re-run when the query parameters change

  const handlePageChange = (e, value) => {
    setPage(value);
    navigate(`?page=${value}`, { replace: true });
  };

  return (
    <div className="restaurant-list-container">
      <div className="restaurant-list">
        <h1>🍽️ Best Food Near You</h1>

        <div className="grid">
          {restaurants.map((restaurant) => (
            <RestaurantCard
              key={restaurant.id}
              restaurant={restaurant}
            />
          ))}
        </div>

        {totalPages > 1 && (
          <Stack spacing={2} className="pagination-container">
            <Pagination
              count={totalPages}
              page={page}
              onChange={handlePageChange}
              variant="outlined"
              shape="rounded"
            />
          </Stack>
        )}
      </div>
    </div>
  );
};

export default RestaurantList;

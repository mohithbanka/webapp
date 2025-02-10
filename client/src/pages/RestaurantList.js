import React, { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { getRestaurants, searchNearbyRestaurants } from "../api";
import RestaurantCard from "../components/RestaurantCard";
import Pagination from "@mui/material/Pagination";
import Stack from "@mui/material/Stack";
import CircularProgress from "@mui/material/CircularProgress";
import Box from "@mui/material/Box";
import "./RestaurantList.css";

const RestaurantList = () => {
  const [restaurants, setRestaurants] = useState([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(false); // Loading state
  const location = useLocation();
  const navigate = useNavigate();

  // Fetch restaurants based on location or pagination
  const fetchRestaurants = async (lat, lng, dist) => {
    setLoading(true); // Start loading
    try {
      if (lat && lng && dist) {
        const data = await searchNearbyRestaurants(lat, lng, dist);
        setRestaurants(data.restaurants);
        setTotalPages(1);
      } else {
        const data = await getRestaurants(page, 12);
        setRestaurants(data.restaurants);
        setTotalPages(data.totalPages);
      }
    } catch (error) {
      console.error("Error fetching restaurants:", error);
    } finally {
      setLoading(false); // Stop loading
    }
  };

  useEffect(() => {
    const queryParams = new URLSearchParams(location.search);
    const lat = queryParams.get("lat");
    const lng = queryParams.get("lng");
    const dist = queryParams.get("dist");
    const pageFromUrl = queryParams.get("page");

    if (lat && lng && dist) {
      fetchRestaurants(lat, lng, dist);
    } else {
      if (pageFromUrl) {
        setPage(Number(pageFromUrl));
      } else {
        setPage(1);
      }
      fetchRestaurants();
    }
  }, [location.search]);

  const handlePageChange = (e, value) => {
    setPage(value);
    navigate(`?page=${value}`, { replace: true });
  };

  return (
    <div className="restaurant-list-container">
      <div className="restaurant-list">
        <h1>🍽️ Best Food Near You</h1>
        {loading ? (
          <Box
            sx={{
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              height: "50vh",
            }}
          >
            <CircularProgress />
          </Box>
        ) : (
          <>
            <div className="grid">
              {restaurants.map((restaurant) => (
                <RestaurantCard
                  key={restaurant.restaurant_id}
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
          </>
        )}
      </div>
    </div>
  );
};

export default RestaurantList;

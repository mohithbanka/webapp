import React, { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { getRestaurants } from "../api";
import RestaurantCard from "../components/RestaurantCard";
import Pagination from "@mui/material/Pagination";
import Stack from "@mui/material/Stack";
import CircularProgress from "@mui/material/CircularProgress";
import Box from "@mui/material/Box";
import "./RestaurantList.css";

const RestaurantList = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [restaurants, setRestaurants] = useState(location.state?.restaurants || []);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(!location.state?.restaurants);

  useEffect(() => {
    if (location.state?.restaurants) return;
    
    const queryParams = new URLSearchParams(location.search);
    const food = queryParams.get("food"); // Get detected food from URL
    const pageFromUrl = queryParams.get("page");

    const fetchRestaurants = async () => {
      setLoading(true);
      try {
        const data = await getRestaurants(page, 12, food);
        setRestaurants(data.restaurants);
        setTotalPages(data.totalPages);
      } catch (error) {
        console.error("Error fetching restaurants:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchRestaurants();
    if (pageFromUrl) setPage(Number(pageFromUrl));
  }, [location.search]);

  const handlePageChange = (e, value) => {
    setPage(value);
    navigate(`?page=${value}`, { replace: true });
  };

  return (
    <div className="restaurant-list-container">
      <div className="restaurant-list">
        <h1>🍽️ Restaurants Offering {new URLSearchParams(location.search).get("food") || "Best Food"} </h1>
        {loading ? (
          <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", height: "50vh" }}>
            <CircularProgress />
          </Box>
        ) : (
          <>
            {restaurants.length === 0 ? (
              <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", height: "50vh", fontSize: "1.5rem", fontWeight: "bold", color: "#ff5722", textAlign: "center" }}>
                <p>No Restaurants Found</p>
              </Box>
            ) : (
              <>
                <div className="grid">
                  {restaurants.map((restaurant) => (
                    <RestaurantCard key={restaurant.restaurant_id} restaurant={restaurant} />
                  ))}
                </div>

                {totalPages > 1 && (
                  <Stack spacing={2} className="pagination-container">
                    <Pagination count={totalPages} page={page} onChange={handlePageChange} variant="outlined" shape="rounded" />
                  </Stack>
                )}
              </>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default RestaurantList;

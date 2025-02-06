import React, { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { getRestaurants, searchByImage, searchNearbyRestaurants } from "../api";
import RestaurantCard from "../components/RestaurantCard";
import Pagination from "@mui/material/Pagination";
import Stack from "@mui/material/Stack";
import "./RestaurantList.css";
// import LocationSearch from "../components/LocationSearch";

const RestaurantList = () => {
  const [restaurants, setRestaurants] = useState([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [detectedFood, setDetectedFood] = useState("");

  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    const queryParams = new URLSearchParams(location.search);
    const pageFromUrl = queryParams.get("page");
    if (pageFromUrl) {
      setPage(Number(pageFromUrl));
    } else {
      setPage(1);
    }
    fetchRestaurants();
  }, [location.search]);

  const fetchRestaurants = async () => {
    try {
      const data = await getRestaurants(page, 12);
      setRestaurants(data.restaurants);
      setTotalPages(data.totalPages);
    } catch (error) {
      console.error("Error fetching data:", error);
    }
  };

  const handleLocationSearch = async (lat, lng, dist) => {
    try {
      console.log(
        `🔍 Fetching restaurants for ${lat}, ${lng} within ${dist} km`
      );
      const data = await searchNearbyRestaurants(lat, lng, dist);
      console.log("✅ API Response:", data);
      if (data.restaurants.length === 0) {
        alert("No restaurants found in this area.");
      }
      setRestaurants(data.restaurants);
      setTotalPages(1);
    } catch (error) {
      console.error("❌ Error searching nearby restaurants:", error);
    }
  };

  // const handleImageSearch = async (formData) => {
  //   try {
  //     const data = await searchByImage(formData);
  //     setDetectedFood(data.detectedFood);
  //     setRestaurants(data.restaurants);
  //     setTotalPages(1);
  //   } catch (error) {
  //     console.error("Error searching by image:", error);
  //   }
  // };

  const handlePageChange = (e, value) => {
    setPage(value);
    navigate(`?page=${value}`, { replace: true });
  };

  return (
    <div className="restaurant-list-container">
      <div className="restaurant-list">
        <h1>🍽️ Best Food Near You</h1>

        {detectedFood && (
          <h2 className="detected-food">Detected Food: {detectedFood}</h2>
        )}

        {/* <LocationSearch onSearch={handleLocationSearch} /> */}

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
      </div>
    </div>
  );
};

export default RestaurantList;

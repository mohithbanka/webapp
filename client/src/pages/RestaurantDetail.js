import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { getRestaurantById } from "../api";
import { Box, Typography, CircularProgress, Paper } from "@mui/material";
import "./RestaurantDetail.css"; // Import your custom CSS for additional styling

const RestaurantDetail = () => {
  const { id } = useParams();
  const [restaurant, setRestaurant] = useState(null);

  useEffect(() => {
    const fetchRestaurant = async () => {
      const data = await getRestaurantById(id);
      setRestaurant(data);
    };
    fetchRestaurant();
  }, [id]);

  if (!restaurant)
    return (
      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          height: "100vh",
        }}
      >
        <CircularProgress />
      </Box>
    );

  return (
    <Box sx={{ padding: 3 }} className="restaurant-detail-container">
      <div className="restaurant-header">
        <img
          src={restaurant.featured_image || "default-image-url.jpg"}
          alt={restaurant.name}
          className="restaurant-image"
        />
        <Box className="restaurant-info">
          <Typography
            variant="h3"
            sx={{ fontWeight: "bold" }}
            className="restaurant-name"
          >
            {restaurant.name || "No Name Available"}
          </Typography>
          <Typography variant="h5" className="restaurant-cuisine">
            {restaurant.cuisines || "Cuisines not available"}
          </Typography>
        </Box>
      </div>

      {/* Restaurant Details */}
      <Paper sx={{ padding: 3 }} className="restaurant-details-box">
        <Typography variant="h4" gutterBottom>
          Details
        </Typography>
        <Typography variant="body1">
          <strong>📍 Location:</strong>{" "}
          {restaurant.location.address || "Not available"}
        </Typography>
        <Typography variant="body1">
          <strong>💰 Cost for Two:</strong>{" "}
          {restaurant.average_cost_for_two || "N/A"} {restaurant.currency || ""}
        </Typography>
        <Typography variant="body1">
          <strong>⭐ Rating:</strong>{" "}
          {restaurant.user_rating.aggregate_rating || "N/A"} (
          {restaurant.user_rating.rating_text || "No rating"}))
        </Typography>

        {restaurant.menu_url && (
          <Typography
            variant="body1"
            sx={{ marginTop: 2 }}
            className="menu-url"
          >
            <strong>🍽️ Menu:</strong>{" "}
            <a
              href={restaurant.menu_url}
              target="_blank"
              rel="noopener noreferrer"
              className="menu-link"
            >
              View Menu
            </a>
          </Typography>
        )}
      </Paper>
    </Box>
  );
};

export default RestaurantDetail;

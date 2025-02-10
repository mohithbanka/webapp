import React from "react";
import { Link } from "react-router-dom";
import { Card, CardContent, CardMedia, Typography, Box } from "@mui/material";
import "./RestaurantCard.css"; // Import your custom CSS for additional styling

const RestaurantCard = ({ restaurant }) => {
  return (
    <Link to={`/restaurant/${restaurant.id}`} className="restaurant-card">
      <Card
        sx={{ maxWidth: 345, borderRadius: 2, boxShadow: 3, marginBottom: 3 }}
      >
        <CardMedia
          component="img"
          height="200"
          image={
            restaurant.featured_image ||
            "https://b.zmtcdn.com/data/pictures/4/306134/a3808bac6743110762e4cd2b1c60db94_featured_v2.jpg"
          }
          alt={restaurant.name}
          sx={{ borderRadius: 2 }}
        />
        <CardContent>
          <Typography variant="h6" component="div" sx={{ fontWeight: "bold" }}>
            {restaurant.name}
          </Typography>
          <Typography variant="body2" color="textSecondary">
            {restaurant.cuisines}
          </Typography>
          <Typography variant="body2" color="textSecondary">
            💰 {restaurant.average_cost_for_two} {restaurant.currency}
          </Typography>
          <Box
            sx={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <Typography variant="body2" color="textSecondary">
              📍 {restaurant.location.address}
            </Typography>
            <Typography variant="body2" color="primary">
              ⭐ {restaurant.user_rating.aggregate_rating}
            </Typography>
          </Box>
          {restaurant.distance && (
            <Typography variant="body2" color="textSecondary">
              {restaurant.distance} km
            </Typography>
          )}
        </CardContent>
      </Card>
    </Link>
  );
};

export default RestaurantCard;

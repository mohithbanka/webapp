import React from "react";
import { Container, Button, Box } from "@mui/material";
import { useNavigate } from "react-router-dom";
import "./Home.css";
import LocationSearch from "../components/LocationSearch";
import ImageSearch from "../components/ImageSearch";

const Home = () => {
  const navigate = useNavigate();

  const goToRestaurants = () => {
    navigate("/all-restaurants");
  };

  const handleLocationSearch = (lat, lng, dist) => {
    console.log(
      `Searching nearby restaurants at (${lat}, ${lng}) within ${dist} km`
    );
    // Navigate with the location search parameters
    navigate(`/all-restaurants/location?lat=${lat}&lng=${lng}&dist=${dist}`);
  };

  return (
    
    <Container
      maxWidth="md"
      sx={{ textAlign: "center", paddingTop: 4 }}
      className="home-container"
    >
      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
          marginTop: 2,
          marginBottom: 2,
        }}
      >
        <Button
          variant="contained"
          color="primary"
          size="large"
          onClick={goToRestaurants}
        >
          Explore All Restaurants
        </Button>
      </Box>

      <LocationSearch onSearch={handleLocationSearch} />
      <ImageSearch />
    </Container>
  );
};

export default Home;

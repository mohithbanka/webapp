import React from "react";
import { Button, AppBar, Toolbar, Typography } from "@mui/material";
import { useNavigate } from "react-router-dom";
import "./Header.css";

const Header = () => {
  const navigate = useNavigate();

  const handleRestaurantClick = () => {
    navigate("/restaurants");
  };

  const handleHomeClick = () => {
    navigate("/");
  };

  return (
    <AppBar position="sticky" className="header-appbar">
      <Toolbar className="header-toolbar">
        <Typography variant="h6" className="header-title">
          Restaurant Finder
        </Typography>
        <div className="header-buttons">
          <Button
            className="header-button"
            style={{ backgroundColor: "#ff5722", color: "white" }}
            onClick={handleHomeClick}
          >
            Home
          </Button>
          <Button
            className="header-button"
            style={{ backgroundColor: "#ff5722", color: "white" }}
            onClick={handleRestaurantClick}
          >
            Restaurants
          </Button>
        </div>
      </Toolbar>
    </AppBar>
  );
};

export default Header;

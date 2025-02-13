import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { Button, CircularProgress, Box, Typography } from "@mui/material";
import CloudUploadIcon from "@mui/icons-material/CloudUpload";
import "./ImageSearch.css";

const API_BASE_URL =
process.env.REACT_APP_API_BASE_URL || "https://webapp-zemg.onrender.com";


const ImageSearch = () => {
  const [image, setImage] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleImageChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      setImage(file);
      setError("");
    }
  };

  const handleSubmit = async () => {
    if (!image) {
      setError("Please upload an image.");
      return;
    }

    const formData = new FormData();
    formData.append("image", image);

    try {
      setLoading(true);
      setError("");

      const response = await axios.post(
        `${API_BASE_URL}/search-by-image`,
        formData,
        {
          headers: { "Content-Type": "multipart/form-data" },
        }
      );

      const { restaurants } = response.data;
      navigate(`/all-restaurants`, { state: { restaurants } });
    } catch (err) {
      console.error("Error searching by image:", err);
      setError("Could not detect food. Try another image.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box className="image-search-container">
      <Typography variant="h5" gutterBottom className="text">
        🍽️ Upload a Food Image to Find Restaurants
      </Typography>

      {/* Hidden File Input */}
      <input type="file" accept="image/*" id="file-input" onChange={handleImageChange} />

      {/* Upload Button that Triggers File Input */}
      <label htmlFor="file-input" className="upload-btn">
        <CloudUploadIcon /> {image ? image.name : "Upload Image"}
      </label>

      {error && <Typography color="error">{error}</Typography>}

      <Button
        variant="contained"
        color="primary"
        startIcon={<CloudUploadIcon />}
        onClick={handleSubmit}
        disabled={loading}
      >
        {loading ? <CircularProgress size={24} /> : "Search Restaurants"}
      </Button>
    </Box>
  );
};

export default ImageSearch;

import axios from "axios";

const API_BASE_URL = "http://localhost:5000"; // Change this to your backend URL

// Fetch all restaurants (paginated)
export const getRestaurants = async (page, limit) => {
  let url = `${API_BASE_URL}/all-restaurants?page=${page}&limit=${limit}`;
  const response = await fetch(url);
  return response.json(); // Return JSON response
};

// Fetch restaurant by ID
export const getRestaurantById = async (id) => {
  const response = await axios.get(`${API_BASE_URL}/restaurants/${id}`);
  return response.data; // Return restaurant data
};

// Fetch nearby restaurants based on location
export const searchNearbyRestaurants = async (lat, lng, dist) => {
  try {
    const response = await axios.get(`${API_BASE_URL}/api/restaurants/location`, {
      params: { lat, lng, dist },
    });

    console.log("📡 API Response:", response.data); // Debugging log
    return response.data; // Return the fetched restaurants
  } catch (error) {
    console.error("❌ Error fetching nearby restaurants:", error);
    return { total: 0, restaurants: [] }; // Return empty if error occurs
  }
};

// Search restaurants by image (optional feature)
export const searchByImage = async (formData) => {
  try {
    const response = await axios.post(
      `${API_BASE_URL}/image-search`,
      formData,
      {
        headers: { "Content-Type": "multipart/form-data" },
      }
    );
    return response.data; // Return data from image search
  } catch (error) {
    console.error("❌ Error searching by image:", error);
    return { total: 0, restaurants: [] }; // Return empty if error occurs
  }
};

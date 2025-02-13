import axios from "axios";

const API_BASE_URL =
  process.env.REACT_APP_API_BASE_URL || "https://webapp-zemg.onrender.com";

export const getRestaurants = async (page, limit) => {
  let url = `${API_BASE_URL}/all-restaurants?page=${page}&limit=${limit}`;
  const response = await fetch(url);
  return response.json();
};

export const getRestaurantById = async (id) => {
  const response = await axios.get(`${API_BASE_URL}/restaurants/${id}`);
  return response.data;
};

// export const searchNearbyRestaurants = async (lat, lng, dist) => {
//   try {
//     const response = await axios.get(
//       `${API_BASE_URL}/api/restaurants/location`,
//       {
//         params: { lat, lng, dist },
//       }
//     );

//     return response.data;
//   } catch (error) {
//     console.error("❌ Error fetching nearby restaurants:", error);
//     return { total: 0, restaurants: [] };
//   }
// };

// export const searchByImage = async (formData) => {
//   try {
//     const response = await axios.post(
//       `${API_BASE_URL}/search-by-image`,
//       formData,
//       {
//         headers: { "Content-Type": "multipart/form-data" },
//       }
//     );
//     return response.data;
//   } catch (error) {
//     console.error("❌ Error searching by image:", error);
//     return { total: 0, restaurants: [] };
//   }
// };

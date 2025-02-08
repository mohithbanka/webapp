const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
const dotenv = require("dotenv");
require("dotenv").config();

const app = express();
const port = process.env.PORT;

app.use(
  cors({
    origin: [
      "http://localhost:3000",
      "https://webapp-op95cj3ea-mohiths-projects-ba442874.vercel.app/",
    ], // Replace with your frontend URL
    methods: ["GET", "POST", "PUT", "DELETE"],
    credentials: true,
  })
);
app.use(express.json());

const mongoURI = process.env.MONGO_URI;
mongoose
  .connect(mongoURI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log("✅ Connected to MongoDB"))
  .catch((err) => console.error("❌ MongoDB Connection Error:", err));

const RestaurantSchema = new mongoose.Schema({
  restaurant_id: Number,
  name: String,
  country_code: Number,
  city: String,
  address: String,
  locality: String,
  locality_verbose: String,
  location: {
    type: { type: String, enum: ["Point"], default: "Point" },
    coordinates: { type: [Number], required: true },
  },
  cuisines: String,
  average_cost_for_two: Number,
  currency: String,
  has_table_booking: String,
  has_online_delivery: String,
  is_delivering_now: String,
  switch_to_order_menu: String,
  price_range: Number,
  aggregate_rating: Number,
  rating_color: String,
  rating_text: String,
  votes: Number,
});
RestaurantSchema.index({ location: "2dsphere" });
// Collection name: "restaurants"
const Restaurant = mongoose.model("restaurants", RestaurantSchema); // Collection name

app.get("/api/restaurants/:id", async (req, res) => {
  try {
    const restaurantId = req.params.id.toString();

    // console.log(`🔍 Searching for restaurant with ID: ${restaurantId}`);

    const restaurant = await Restaurant.findOne({
      id: restaurantId,
    });

    if (!restaurant) {
      console.log("❌ No matching restaurant found.");
      return res.status(404).json({ message: "Restaurant Not Found" });
    }

    // console.log("✅ Restaurant found:", restaurant);
    res.json(restaurant);
  } catch (error) {
    console.error("❌ Server Error:", error);
    res.status(500).json({ message: "Server Error", error: error.message });
  }
});

app.get("/api/all-restaurants", async (req, res) => {
  try {
    let { page = 1, limit = 10 } = req.query;
    page = parseInt(page);
    limit = parseInt(limit);

    const total = await Restaurant.countDocuments();

    const restaurants = await Restaurant.find()
      .select(
        "id name cuisines location average_cost_for_two price_range user_rating featured_image menu_url"
      )
      .skip((page - 1) * limit)
      .limit(limit);

    res.json({
      total,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      restaurants,
    });
  } catch (error) {
    res.status(500).json({ message: "Server Error", error: error.message });
  }
});

app.get("/api/restaurant/location", async (req, res) => {
  try {
    let { lat, lng, radius = 3, page = 1, limit = 10 } = req.query;

    lat = parseFloat(lat);
    lng = parseFloat(lng);
    radius = parseFloat(radius) * 1000; // Convert km to meters
    page = parseInt(page);
    limit = parseInt(limit);

    if (isNaN(lat) || isNaN(lng) || isNaN(radius)) {
      return res
        .status(400)
        .json({ message: "Invalid latitude, longitude, or radius" });
    }

    // console.log(
    //   `📍 Searching for restaurants within ${radius} meters of [${lng}, ${lat}]`
    // );

    const restaurants = await Restaurant.find({
      location: {
        $near: {
          $geometry: { type: "Point", coordinates: [lng, lat] },
          $maxDistance: radius,
        },
      },
    })
      .skip((page - 1) * limit)
      .limit(limit)
      .select(
        "restaurant_id name cuisines location average_cost_for_two price_range user_rating"
      );

    if (restaurants.length === 0) {
      console.log("❌ No restaurants found near this location.");
      return res
        .status(404)
        .json({ message: "No restaurants found in this area." });
    }

    res.json({
      total: restaurants.length,
      restaurants,
    });
  } catch (error) {
    console.error("❌ Error fetching nearby restaurants:", error);
    res.status(500).json({ message: "Server Error", error: error.message });
  }
});

app.listen(port, () => console.log(`🚀 Server running on port ${port}`));

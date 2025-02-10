const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
const dotenv = require("dotenv");
require("dotenv").config();

const app = express();
const port = process.env.PORT;
app.use(cors());
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

app.get("/restaurants/:id", async (req, res) => {
  try {
    const restaurantId = req.params.id.toString();

    const restaurant = await Restaurant.findOne({
      id: restaurantId,
    });

    if (!restaurant) {
      return res.status(404).json({ message: "Restaurant Not Found" });
    }

    res.json(restaurant);
  } catch (error) {
    console.error("❌ Server Error:", error);
    res.status(500).json({ message: "Server Error", error: error.message });
  }
});

app.get("/all-restaurants", async (req, res) => {
  try {
    let { page = 1, limit = 10 } = req.query;
    page = parseInt(page);
    limit = parseInt(limit);

    const total = await Restaurant.estimatedDocumentCount(); // Faster than countDocuments()

    const restaurants = await Restaurant.find()
      .select(
        "id name cuisines location average_cost_for_two price_range user_rating featured_image menu_url"
      )
      .skip((page - 1) * limit)
      .limit(limit)
      .lean();

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

app.get("/api/restaurants/location", async (req, res) => {
  try {
    let { lat, lng, radius = 3, page = 1, limit = 10 } = req.query;

    lat = parseFloat(lat);
    lng = parseFloat(lng);
    radius = parseFloat(radius) * 1000;
    page = parseInt(page);
    limit = parseInt(limit);

    if (isNaN(lat) || isNaN(lng) || isNaN(radius)) {
      return res
        .status(400)
        .json({ message: "Invalid latitude, longitude, or radius" });
    }

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
        "id name cuisines location average_cost_for_two price_range user_rating featured_image menu_url"
      );

    if (restaurants.length === 0) {
      return res
        .status(404)
        .json({ message: "No restaurants found in this area." });
    }

    res.json({
      total: restaurants.length,
      restaurants,
    });
  } catch (error) {
    res.status(500).json({ message: "Server Error", error: error.message });
  }
});

app.listen(port, () => console.log(`🚀 Server running on port`));

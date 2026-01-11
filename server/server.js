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
// ||"mongodb+srv://mohithbanka285:LcRXTXpUKSgAuFkJ@cluster0.7vm8m.mongodb.net/?appName=Cluster0";
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

const multer = require("multer");
const axios = require("axios");

dotenv.config();

const upload = multer({ storage: multer.memoryStorage() }); // Store image in memory

const validCuisines = {
  "Drinks Only": ["Juices", "Milkshakes", "Smoothies"],
  Oriya: ["Dalma", "Pakhala Bhata", "Chhena Poda"],
  Awadhi: ["Kebabs", "Biryani", "Lucknawi Korma"],
  Filipino: ["Adobo", "Sinigang", "Lechon"],
  American: ["Burger", "Fries", "Hot Dog", "Apple Pie", "crispy chicken"],
  French: ["Croissant", "Baguette", "Escargot", "Ratatouille"],
  Indian: ["Butter Chicken", "Naan", "Biryani", "Samosa", "Tandoori Chicken"],
  Tea: ["Chai", "Iced Tea", "Green Tea"],
  Mithai: ["Gulab Jamun", "Jalebi", "Rasgulla"],
  "South Indian": ["Dosa", "Idli", "Vada", "Sambar"],
  Peranakan: ["Laksa", "Ayam Buah Keluak", "Satay"],
  Sushi: ["Nigiri", "Sashimi", "Maki Rolls"],
  "Street Food": ["Pani Puri", "Bhel Puri", "Corn on the Cob"],
  Deli: ["Sandwich", "Bagels", "Cold Cuts"],
  Belgian: ["Waffles", "Moules-Frites", "Belgian Fries"],
  Naga: ["Smoked Pork", "Fish Curry", "Eromba"],
  Curry: ["Chicken Curry", "Lamb Curry", "Vegetable Curry"],
  Breakfast: ["Pancakes", "Eggs Benedict", "Omelette"],
  "Sri Lankan": ["Kottu", "Sri Lankan Rice and Curry", "Hoppers"],
  African: ["Jollof Rice", "Bunny Chow", "Biltong"],
  Vietnamese: ["Pho", "Bánh Mì", "Goi Cuon (Spring Rolls)"],
  Cantonese: ["Dim Sum", "Char Siu", "Wonton Soup"],
  Diner: ["Eggs and Bacon", "Pancakes", "Club Sandwich"],
  Pakistani: ["Biryani", "Chapli Kebab", "Seekh Kebab"],
  "Healthy Food": ["Salads", "Smoothies", "Grilled Vegetables"],
  Burmese: ["Mohinga", "Shan Noodles", "Tea Leaf Salad"],
  Mughlai: ["Korma", "Kebabs", "Biryani"],
  "Gourmet Fast Food": ["Truffle Fries", "Gourmet Burgers", "Lobster Rolls"],
  "Fish and Chips": ["Fish Fry", "Fries", "Mushy Peas"],
  Sandwich: ["Club Sandwich", "Grilled Cheese", "BLT"],
  Juices: ["Orange Juice", "Carrot Juice", "Lemonade"],
  "South American": ["Empanada", "Arepa", "Ceviche"],
  "Pub Food": ["Fish and Chips", "Pies", "Nachos"],
  Gujarati: ["Dhokla", "Khandvi", "Undhiyu"],
  "Bubble Tea": ["Milk Tea", "Fruit Tea", "Tapioca Pearls"],
  Patisserie: ["Croissants", "Macarons", "Eclairs"],
  Indonesian: ["Nasi Goreng", "Satay", "Gado-Gado"],
  Cajun: ["Jambalaya", "Crawfish", "Po'boy Sandwich"],
  European: ["Paella", "Pasta", "Baguette"],
  Korean: ["Kimchi", "Bulgogi", "Bibimbap"],
  German: ["Sausages", "Pretzels", "Schnitzel"],
  Kashmiri: ["Rogan Josh", "Yakhni", "Kahwa"],
  Arabian: ["Shawarma", "Hummus", "Falafel"],
  "Charcoal Grill": ["Grilled Meat", "Grilled Vegetables", "Barbecue"],
  Taiwanese: ["Bubble Tea", "Lu Rou Fan", "Xiao Long Bao"],
  Iranian: ["Kebab", "Fesenjan", "Tahchin"],
  Hawaiian: ["Poke", "Loco Moco", "Spam Musubi"],
  Seafood: ["Lobster", "Shrimp", "Crab"],
  Bakery: ["Bread", "Pastries", "Cakes"],
  Ramen: ["Shoyu Ramen", "Miso Ramen", "Tonkotsu Ramen"],
  Southern: ["Fried Chicken", "Cornbread", "Collard Greens"],
  "Coffee and Tea": ["Espresso", "Cappuccino", "Chai Latte"],
  Sunda: ["Sundae", "Ice Cream", "Milkshakes"],
  Greek: ["Souvlaki", "Moussaka", "Baklava", "Gyros"],
  "South African": ["Biltong", "Braai", "Bobotie"],
  Izgara: ["Grilled Meat", "Souvlaki", "Kebabs"],
  Scottish: ["Haggis", "Cullen Skink", "Shortbread"],
  Nepalese: ["Momo", "Dal Bhat", "Gundruk"],
  Canadian: ["Poutine", "Butter Tarts", "Nanaimo Bars"],
  "Soul Food": ["Fried Chicken", "Collard Greens", "Cornbread"],
  Kerala: ["Sadya", "Fish Curry", "Appam"],
  Armenian: ["Kebabs", "Dolma", "Baklava"],
  "Latin American": ["Tacos", "Empanadas", "Arepas"],
  British: ["Fish and Chips", "Sunday Roast", "Shepherd's Pie"],
  Steak: ["Ribeye", "Sirloin", "T-Bone"],
  "Raw Meats": ["Steak Tartare", "Ceviche", "Carpaccio"],
  Cafe: ["Pastries", "Cappuccino", "Sandwiches"],
  Brazilian: ["Feijoada", "Pão de Queijo", "Coxinha"],
  Moroccan: ["Tagine", "Couscous", "Harira"],
  "Fresh Fish": ["Sushi", "Grilled Fish", "Ceviche"],
  "North Eastern": ["Momoz", "Thukpa", "Ema Datshi"],
  Börek: ["Lahmacun", "Pide", "Baklava"],
  Biryani: ["Chicken Biryani", "Mutton Biryani", "Hyderabadi Biryani"],
  Spanish: ["Paella", "Tapas", "Churros"],
  Lebanese: ["Falafel", "Hummus", "Tabbouleh"],
  Italian: ["Pizza", "Pasta", "Tiramisu", "Lasagna"],
  Irish: ["Stew", "Soda Bread", "Colcannon"],
  Tapas: ["Patatas Bravas", "Chorizo", "Tortilla Española"],
  Chinese: ["Dim Sum", "Peking Duck", "Kung Pao Chicken"],
  Pizza: ["Margherita", "Pepperoni", "Hawaiian"],
  Singaporean: ["Laksa", "Satay", "Hainanese Chicken Rice"],
  International: ["Fusion", "Sushi", "Burgers"],
  "Dim Sum": ["Dumplings", "Bao", "Spring Rolls"],
  "World Cuisine": ["Pasta", "Pizza", "Sushi", "Burgers"],
  "Modern Australian": ["Barramundi", "Pavlova", "Anzac Biscuits"],
  Parsi: ["Dhansak", "Patra", "Sali Boti"],
  Australian: ["Vegemite", "Pavlova", "Meat Pie"],
  Bihari: ["Litti Chokha", "Mutton Korma", "Sattu Paratha"],
  Cuban: ["Cuban Sandwich", "Ropa Vieja", "Tostones"],
  "Ice Cream": ["Gelato", "Sorbet", "Frozen Yogurt"],
  Goan: ["Prawn Curry", "Bebinca", "Fish Recheado"],
  BBQ: ["Pulled Pork", "Brisket", "Ribs"],
  Kiwi: ["Pavlova", "Meat Pie", "Fish and Chips"],
  Assamese: ["Assam Laksa", "Khar", "Pitha"],
  "Tex-Mex": ["Burritos", "Nachos", "Tacos"],
  Malwani: ["Malwani Fish Curry", "Sol Kadhi", "Chicken Sukka"],
  Argentine: ["Asado", "Empanadas", "Choripán"],
  Durban: ["Bunny Chow", "Durban Curry", "Biltong"],
  "New American": ["Truffle Fries", "Avocado Toast", "Poke Bowls"],
  Portuguese: ["Bacalhau", "Pastel de Nata", "Piri Piri Chicken"],
  Beverages: ["Smoothies", "Juices", "Mocktails"],
  Rajasthani: ["Dal Baati Churma", "Gatte Ki Sabzi", "Ker Sangri"],
  "Modern Indian": ["Quinoa Biryani", "Sushi Samosa", "Tandoori Salmon"],
  "Fast Food": ["Burger", "Pizza", "Hot Dogs"],
  Thai: ["Pad Thai", "Green Curry", "Tom Yum Soup"],
  Contemporary: ["Fusion Cuisine", "Gourmet Burgers", "Salads"],
  Hyderabadi: ["Biryani", "Haleem", "Mirchi Ka Salan"],
  Maharashtrian: ["Pav Bhaji", "Vada Pav", "Poha"],
  Continental: ["Steak", "Pasta", "Salads"],
  Kebab: ["Seekh Kebab", "Shish Kebab", "Doner Kebab"],
  Peruvian: ["Ceviche", "Lomo Saltado", "Pisco Sour"],
  Bengali: ["Shorshe Ilish", "Macher Jhol", "Mishti"],
  Chettinad: [
    "Chettinad Chicken Curry",
    "Kuzhi Paniyaram",
    "Chettinad Biryani",
  ],
  Afghani: ["Kebabs", "Shorwa", "Mantu"],
  Japanese: ["Sushi", "Ramen", "Tempura"],
  Döner: ["Lamb Döner", "Chicken Döner", "Falafel Döner"],
  Southwestern: ["Chili", "Fajitas", "Quesadillas"],
  "Turkish Pizza": ["Lahmacun", "Pide", "Baklava"],
  Malay: ["Nasi Lemak", "Laksa", "Satay"],
  "Restaurant Cafe": ["Cakes", "Sandwiches", "Coffee"],
  Fusion: ["Asian Fusion", "Italian Tacos", "Sushi Pizza"],
  Caribbean: ["Jerk Chicken", "Ackee and Saltfish", "Patties"],
  Tibetan: ["Momo", "Thukpa", "Sha Phaley"],
  Mangalorean: ["Mangalorean Fish Curry", "Neer Dosa", "Chicken Sukka"],
  Burger: ["Cheeseburger", "Veggie Burger", "Chicken Burger"],
  "Finger Food": ["Spring Rolls", "Nachos", "Sliders"],
  Mexican: ["Tacos", "Quesadillas", "Burritos"],
  "Asian Fusion": ["Sushi Burrito", "Korean BBQ", "Dim Sum Tacos"],
  Sichuan: ["Mapo Tofu", "Kung Pao Chicken", "Dan Dan Noodles"],
  Nepali: ["Momo", "Thukpa", "Sel Roti", "crispy chicken"],
};

const detectFood = async (imageBuffer) => {
  try {
    const response = await axios.post(
      "https://api-inference.huggingface.co/models/ewanlong/food_type_image_detection",
      imageBuffer,
      {
        headers: {
          Authorization: `Bearer ${process.env.HF_API_KEY}`,
          "Content-Type": "application/octet-stream",
        },
      }
    );

    return response.data;
  } catch (error) {
    console.error(
      "Error from API:",
      error.response ? error.response.data : error.message
    );
    return null;
  }
};

app.post("/search-by-image", upload.single("image"), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: "No image uploaded" });
    }

    const foodResponse = await detectFood(req.file.buffer);

    if (!foodResponse || foodResponse.length === 0) {
      return res
        .status(400)
        .json({ error: "Food detection failed or no food recognized" });
    }

    const detectedFood = foodResponse[0]?.label?.toLowerCase();

    if (!detectedFood) {
      return res
        .status(400)
        .json({ error: "Could not identify food from the image" });
    }

    const matchingCuisines = Object.keys(validCuisines).filter((cuisine) =>
      validCuisines[cuisine].some((food) =>
        food.toLowerCase().includes(detectedFood.toLowerCase())
      )
    );

    if (matchingCuisines.length === 0) {
      return res
        .status(400)
        .json({ error: `No matching cuisines found for ${detectedFood}` });
    }

    const matchingRestaurants = await Restaurant.find({
      cuisines: { $in: matchingCuisines },
    });

    res.json({
      detectedFood,
      cuisines: matchingCuisines,
      restaurants: matchingRestaurants,
    });
  } catch (error) {
    console.error("Error processing image search:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

app.listen(port, () => console.log(`🚀 Server running on port`));

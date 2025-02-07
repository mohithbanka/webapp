const mongoose = require("mongoose");
const fs = require("fs");
const dotenv = require("dotenv");
const Restaurant = require("./models/Restaurant");

dotenv.config();

mongoose
  .connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log("MongoDB Connected"))
  .catch((err) => console.log(err));

const importData = async () => {
  try {
    const data = JSON.parse(fs.readFileSync("file5.json", "utf-8"));

    if (!Array.isArray(data) || data.length === 0) {
      throw new Error("Invalid JSON structure: Expected an array at the root.");
    }

    let restaurants = [];

    data.forEach((entry) => {
      if (Array.isArray(entry.restaurants)) {
        const extractedRestaurants = entry.restaurants.map((r) => {
          const rest = r.restaurant;
          return {
            id: rest.id,
            name: rest.name,
            cuisines: rest.cuisines,
            location: {
              type: "Point",
              coordinates: [
                parseFloat(rest.location.longitude),
                parseFloat(rest.location.latitude),
              ], // GeoJSON format
              address: rest.location.address,
              city: rest.location.city,
            },
            average_cost_for_two: rest.average_cost_for_two,
            price_range: rest.price_range,
            user_rating: rest.user_rating,
            featured_image: rest.featured_image,
            menu_url: rest.menu_url,
          };
        });

        restaurants = restaurants.concat(extractedRestaurants);
      }
    });

    if (restaurants.length === 0) {
      throw new Error("No valid restaurants found in the JSON file.");
    }

    await Restaurant.insertMany(restaurants);
    console.log(`Successfully imported ${restaurants.length} restaurants.`);
    process.exit();
  } catch (error) {
    console.error("Error:", error.message);
    process.exit(1);
  }
};

importData();

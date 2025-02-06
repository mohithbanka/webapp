const mongoose = require("mongoose");
const fs = require("fs");
const dotenv = require("dotenv");
const Restaurant = require("./models/Restaurant");

dotenv.config();

mongoose.connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true
}).then(() => console.log("MongoDB Connected"))
  .catch(err => console.log(err));

const importData = async () => {
    try {
        const data = JSON.parse(fs.readFileSync("file5.json", "utf-8"));
        if (!Array.isArray(data) || data.length === 0 || !data[0].restaurants) {
            throw new Error("Invalid JSON structure: 'restaurants' array not found");
        }

        const restaurants = data[0].restaurants.map(r => {
            const rest = r.restaurant;
            return {
                id: rest.id,
                name: rest.name,
                cuisines: rest.cuisines,
                location: {
                    type: "Point",
                    coordinates: [parseFloat(rest.location.longitude), parseFloat(rest.location.latitude)], // GeoJSON format
                    address: rest.location.address,
                    city: rest.location.city
                },
                average_cost_for_two: rest.average_cost_for_two,
                price_range: rest.price_range,
                user_rating: rest.user_rating,
                featured_image: rest.featured_image,
                menu_url: rest.menu_url
            };
        });

        await Restaurant.insertMany(restaurants);
        console.log("Data Imported Successfully");
        process.exit();
    } catch (error) {
        console.error("Error:", error.message);
        process.exit(1);
    }
};

importData();

import React from "react";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import Header from "./pages/Header";
import RestaurantList from "./pages/RestaurantList";
import Home from "./pages/Home";
import RestaurantDetail from "./pages/RestaurantDetail";

const App = () => {
  return (
    <div>
      <Router>
        <Header />
        <Routes>
          {/* Home page route */}
          <Route path="/" element={<Home />} />

          {/* Restaurant list page route */}
          <Route path="/all-restaurants" element={<RestaurantList />} />

          {/* Location-based restaurant list route */}
          <Route
            path="/all-restaurants/location"
            element={<RestaurantList />}
          />

          {/* Restaurant detail page route */}
          <Route path="/restaurant/:id" element={<RestaurantDetail />} />
        </Routes>
      </Router>
    </div>
  );
};

export default App;

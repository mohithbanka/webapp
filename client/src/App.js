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
          <Route path="/" element={<Home />} /> {/* Updated */}
          <Route path="/all-restaurants" element={<RestaurantList />} />{" "}
          <Route path="/restaurant/:id" element={<RestaurantDetail />} />{" "}
        </Routes>
      </Router>
    </div>
  );
};

export default App;

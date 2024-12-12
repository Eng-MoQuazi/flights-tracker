import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Navbar from "./components/Navbar"; 
import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard"; 
import MyFlight from "./pages/MyFlight";
import logo from "./images/logo.png";
import "./App.css"; 


const App = () => {
  return (
    <>
    <img class="logo" src={logo} alt='logo'/>
    <Router>
      <Navbar />
      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/my-flights" element={<MyFlight />} />
      
      </Routes>
    </Router>
    </>
  );
};

export default App;

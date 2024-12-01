require("dotenv").config(); 
const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const path = require("path");
const axios = require("axios");
const connectDB = require("./database");
const cors = require("cors");

const app = express();

app.use(cors());
app.use(express.json());

const SECRET_KEY = process.env.JWT_SECRET; 
const AVIATIONSTACK_API_KEY = process.env.AVIATIONSTACK_API_KEY;
let db;
let usersCollection;

(async () => {
 db = await connectDB();
 usersCollection = db.collection("user");
})();

const PORT = process.env.PORT || 3000;

app.post("/register", async (req, res) => {
   const { username, password, email } = req.body;
 
   try {
     const hashedPassword = await bcrypt.hash(password, 10);
     await usersCollection.insertOne({
       username,
       email,
       password: hashedPassword,
     });
     res.status(201).json("User registered successfully");
   } catch (error) {
     res.status(400).json("Error registering user: " + error.message);
   }
});

app.post("/login", async (req, res) => {
   const { username, password } = req.body;
 
   try {
     const user = await usersCollection.findOne({ username });
     if (!user) {
       return res.status(400).json("Invalid credentials");
     }
 
     const isPasswordValid = await bcrypt.compare(password, user.password);
     if (!isPasswordValid) {
       return res.status(400).json("Invalid credentials");
     }
 
     const token = jwt.sign(
       { username: user.username, email: user.email },
       SECRET_KEY,
       { expiresIn: "24h" }
     );
     res.json({ token });
   } catch (error) {
     res.status(500).json("Error logging in: " + error.message);
   }
});

function authenticateToken(req, res, next) {
 const authHeader = req.headers["authorization"];
 const token = authHeader && authHeader.split(" ")[1];

 console.log("Token received:", token);
 console.log("JWT Secret Key:", SECRET_KEY);

 if (!token) {
   console.error("No token provided");
   return res.status(401).json("Access denied, no token provided");
 }

 try {
   const verified = jwt.verify(token, SECRET_KEY);
   console.log("Verified Token:", verified);
   req.user = verified;
   next();
 } catch (err) {
   console.error("JWT Verification Error:", err.message);
   res.status(403).json("Invalid token");
 }
}

app.get("/api/dashboard", authenticateToken, async (req, res) => {
 res.json({ username: req.user.username, email: req.user.email });
});

app.get("/api/flights", authenticateToken, async (req, res) => {
 const { flightNumber } = req.query;

 if (!flightNumber) {
   return res.status(400).json({ error: "Flight number is required" });
 }

 try {
   const response = await axios.get("http://api.aviationstack.com/v1/flights", {
     params: {
       access_key: AVIATIONSTACK_API_KEY,
       flight_iata: flightNumber,
     },
   });

   if (!response.data.data || response.data.data.length === 0) {
     return res.status(404).json({ error: "Flight not found" });
   }

   const flight = response.data.data[0];
   const processedData = {
     departure: {
       latitude: flight?.departure?.latitude,
       longitude: flight?.departure?.longitude,
       airport: flight?.departure?.airport,
       scheduled: flight?.departure?.scheduled
     },
     arrival: {
       latitude: flight?.arrival?.latitude,
       longitude: flight?.arrival?.longitude,
       airport: flight?.arrival?.airport,
       scheduled: flight?.arrival?.scheduled
     },
     flight_status: flight?.flight_status,
     live: flight?.live
   };
   
   res.json(processedData);
 } catch (error) {
   console.error("Error:", error.message);
   res.status(500).json({ error: "Failed to fetch flight data" });
 }
});

app.use(express.static(path.join(__dirname, "public")));

app.listen(PORT, () => {
 console.log(`Server is running on http://localhost:${PORT}`);
});
require("dotenv").config(); 
const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const path = require("path");
const axios = require("axios");
const connectDB = require("./database");
const cors = require("cors");

const app = express();

const corsOptions = {
  origin: process.env.NODE_ENV === "production" ? "https://flights-tracker-mbim.onrender.com" : "http://localhost:5173",
};

app.use(cors(corsOptions));


app.use(express.json());

const SECRET_KEY = process.env.JWT_SECRET; 
const AVIATIONSTACK_API_KEY = process.env.AVIATIONSTACK_API_KEY;
let db; //MongoDB database
let usersCollection; //collection of user

// Connect to MongoDB
(async () => {
   db = await connectDB();
   usersCollection = db.collection("user"); //to store the user's data // To store the user's data
})();

const PORT = process.env.PORT || 3000;

// Create User Registration Route
app.post("/register", async (req, res) => {
   const { username, password, email } = req.body;
 
   try {
     const hashedPassword = await bcrypt.hash(password, 10);
 
    // Insert data to MongoDB
    await usersCollection.insertOne({
       username,
       email,
       password: hashedPassword,
     });

 
     res.status(201).json({ message: "User registered successfully" });
   } catch (error) {
     res.status(400).json("Error registering user: " + error.message);
   }
  });
  

// Create Login Route
app.post("/login", async (req, res) => {
   const { username, password } = req.body;
 
   try {
     const user = await usersCollection.findOne({ username });
     if (!user) {
       return res.status(400).json("Invalid credentials");
     }
 
     // Validate password
    const isPasswordValid = await bcrypt.compare(password, user.password);
     if (!isPasswordValid) {
       return res.status(400).json("Invalid credentials");
     }
 
     // Generate JWT
    const token = jwt.sign(
       { username: user.username, email: user.email },
       SECRET_KEY,
       { expiresIn: "24h" }
     );
     res.json({ token });
   } catch (error) {
    res.status(500).json({
      error: true,
      message: "Failed to fetch flight data",
      details: error.message,
    });
    
   }
  });


// Protect Routes - Middleware for JWT Verification
function authenticateToken(req, res, next) {
  const authHeader = req.headers["authorization"]; // get Authorization Header
  const token = authHeader && authHeader.split(" ")[1]; // get the token after the Bearer


  console.log("Token received:", token);//print token(testing)
  console.log("JWT Secret Key:", SECRET_KEY);//print secret key (testing)

  if (!token) {
    console.error("No token provided");
    return res.status(401).json("Access denied, no token provided");
  }

  try {
    const verified = jwt.verify(token, SECRET_KEY); //verify the token
    console.log("Verified Token:", verified);//print the token onfo(testing)
    req.user = verified; // save to req.user
    next();
  } catch (err) {
    console.error("JWT Verification Error:", err.message); //print err msg(testing)
    res.status(403).json("Invalid token");
  }
}

//Protected Route: Dashboard
app.get("/api/dashboard", authenticateToken, async (req, res) => {
  res.json({ username: req.user.username, email: req.user.email });
});

//flight information from AS API
// public route: for unregister user
app.get("/api/public-flights", async (req, res) => {
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

    const flights = response.data.data;

    if (!flights || flights.length === 0) {
      return res.status(404).json({ error: "No flight found for the given number" });
    }

    // fetch back basic flight infomation
    const basicInfo = flights.map((flight) => ({
      flightNumber: flight.flight.iata,
      departure: flight.departure.scheduled,
      arrival: flight.arrival.scheduled,
      status: flight.flight_status,
      airline: flight.airline.name
    }));

    res.json(basicInfo);
  } catch (error) {
    console.error("Error fetching flight data:", error.message);
    res.status(500).json({
      error: true,
      message: "Failed to fetch flight data",
      details: error.message,
    });
    
  }
});

// protected route: for register user
app.get("/api/protected-flights", authenticateToken, async (req, res) => {
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

    const flights = response.data.data;

    if (!flights || flights.length === 0) {
      return res.status(404).json({ error: "No flight found for the given number" });
    }

    // fetch the detail flight information
    const detailedInfo = flights.map((flight) => ({
      flightNumber: flight.flight.iata,
      departure: flight.departure.scheduled,
      arrival: flight.arrival.scheduled,
      status: flight.flight_status,
      departureAirport: flight.departure.airport,
      arrivalAirport: flight.arrival.airport,
      airline: flight.airline.name,
    }));

    res.json(detailedInfo);
  } catch (error) {
    console.error("Error fetching flight data:", error.message);
    res.status(500).json({
      error: true,
      message: "Failed to fetch flight data",
      details: error.message,
    });
    
  }
});

// add flight to "my flight"
app.post("/api/my-flights", authenticateToken, async (req, res) => {
  const { flightNumber, status, departure, arrival, airline } = req.body;
  const username = req.user.username;

  try {
    await usersCollection.updateOne(
      { username },
      {
        $push: {
          myFlights: { flightNumber, status, departure, arrival, airline },
        },
      }
    );
    res.status(200).json({ message: "Flight added successfully" });
  } catch (error) {
    res.status(500).json({
      error: true,
      message: "Failed to fetch flight data",
      details: error.message,
    });
    
  }
});



// get user's "my flight" list
app.get("/api/my-flights", authenticateToken, async (req, res) => {
  const username = req.user.username;

  try {
    const user = await usersCollection.findOne({ username });
    res.status(200).json(user.myFlights || []);
  } catch (error) {
    res.status(500).json({
      error: true,
      message: "Failed to fetch flight data",
      details: error.message,
    });
    
  }
});


// remove flight from "my flight"
app.delete("/api/my-flights", authenticateToken, async (req, res) => {
  const { flightNumber } = req.body;
  const username = req.user.username;

  try {
    await usersCollection.updateOne(
      { username },
      { $pull: { myFlights: { flightNumber } } }
    );
    res.status(200).json({ message: "Flight removed successfully" });
  } catch (error) {
    res.status(500).json({
      error: true,
      message: "Failed to fetch flight data",
      details: error.message,
    });
    
  }
});

// update flight information
app.put("/api/my-flights", authenticateToken, async (req, res) => {
  const { flightNumber, status, departure, arrival, airline } = req.body;
  const username = req.user.username;

  try {
    await usersCollection.updateOne(
      { username, "myFlights.flightNumber": flightNumber },
      {
        $set: {
          "myFlights.$.status": status,
          "myFlights.$.departure": departure,
          "myFlights.$.arrival": arrival,
          "myFlights.$.airline": airline,
        },
      }
    );
    res.status(200).json({ message: "Flight updated successfully" });
  } catch (error) {
    res.status(500).json({
      error: true,
      message: "Failed to fetch flight data",
      details: error.message,
    });
    
  }
});




// Serve static files
app.use(express.static(path.join(__dirname, "public")));

//start the server
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});


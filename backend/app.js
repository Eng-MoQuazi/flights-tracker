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
let db; //MongoDB database
let usersCollection; //collection of user

//Connect to MongoDB
(async () => {
  db = await connectDB();
  usersCollection = db.collection("user"); //to store the user's data
})();

const PORT = process.env.PORT || 3000;

//Create User Registration Route
app.post("/register", async (req, res) => {
    const { username, password, email } = req.body;
  
    try {
      const hashedPassword = await bcrypt.hash(password, 10);

      // insert data to MongoDB
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
  


//Create Login Route
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
  
      // generate JWT
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

  
//Protect Routes - Middleware for JWT Verification
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
    console.log("No flight number provided");
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
      console.log("No flights found for:", flightNumber);
      return res.status(404).json({ error: "No flight found for the given number" });
    }

    const basicInfo = flights.map((flight) => ({
      flightNumber: flight.flight?.iata || "Unknown",
      departure: flight.departure?.scheduled || "Unknown",
      arrival: flight.arrival?.scheduled || "Unknown",
      status: flight.flight_status || "Unknown",
      longitude: flight.live?.longitude || null,
      latitude: flight.live?.latitude || null,
      airline: flight.airline?.name || "Unknown",
    }));

    res.json(basicInfo);
  } catch (error) {
    console.error("Error fetching flight data:", error.message);
    res.status(500).json({ error: "Failed to fetch flight data" });
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
      longitude: flight.live?.longitude || null,
      latitude: flight.live?.latitude || null,
    }));

    res.json(detailedInfo);
  } catch (error) {
    console.error("Error fetching flight data:", error.message);
    res.status(500).json({ error: "Failed to fetch flight data" });
  }
});

// Add flight to user's "My Flights" list
app.post("/api/my-flights", authenticateToken, async (req, res) => {
  const { flightNumber, status, departure, arrival, departureAirport, arrivalAirport, airline } = req.body;

  try {
    const username = req.user.username;

    await db.collection("myFlights").updateOne(
      { username },
      {
        $addToSet: { 
          flights: { flightNumber, status, departure, arrival, departureAirport, arrivalAirport, airline } 
        }
      },
      { upsert: true }
    );

    res.json({ message: "Flight added successfully to your list" });
  } catch (error) {
    res.status(500).json({ error: "Failed to add flight: " + error.message });
  }
});

// Get user's "My Flights" list
app.get("/api/my-flights", authenticateToken, async (req, res) => {
  try {
    const username = req.user.username;

    const userFlights = await db.collection("myFlights").findOne({ username });
    console.log("Queried Flights for User:", username, userFlights); 

    if (!userFlights) {
      return res.json({ flights: [] }); 
    }

    res.json({ flights: userFlights.flights }); 
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch your flights: " + error.message });
  }
});


// Remove a flight from user's "My Flights" list
app.delete("/api/my-flights", authenticateToken, async (req, res) => {
  const { flightNumber } = req.body;

  try {
    const username = req.user.username;

    await db.collection("myFlights").updateOne(
      { username },
      { $pull: { flights: { flightNumber } } }
    );

    res.json({ message: "Flight removed successfully from your list" });
  } catch (error) {
    res.status(500).json({ error: "Failed to remove flight: " + error.message });
  }
});



// Serve static files
app.use(express.static(path.join(__dirname, "public")));

//start the server
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});

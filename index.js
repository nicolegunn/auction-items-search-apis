const express = require("express");
const app = express();
const cors = require("cors");
const mongoose = require("./db");
const path = require("path");
const searchRouter = require("./routes/searchRoutes");
const itemRouter = require("./routes/itemRoutes");

const allowedOrigins = [
  // Add any frontend urls that will need to access the apis
  "http://localhost:5173",
];

const corsOptions = {
  origin: function (origin, callback) {
    if (!origin || allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      callback(new Error("Not allowed by CORS"));
    }
  },
  methods: "GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS", //OPTIONS is necessary for pre-flight requests
  allowedHeaders: ["Content-Type", "Authorization"],
  credentials: true,
};

app.use(cors(corsOptions));
app.use(express.json());
// Handle preflight requests:
app.options("*", cors(corsOptions));

// Serve static files
app.use(express.static(path.join(__dirname, "public")));

app.set("views", path.join(__dirname, "views"));
app.set("view engine", "ejs");

// Routes
app.use(searchRouter);
app.use(itemRouter);

module.exports = app;

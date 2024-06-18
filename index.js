require("dotenv").config();
const express = require("express");
const app = express();
const cors = require("cors");

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

// const xxRouter = require("./routes/xxRoutes.js");

// app.use(xxRouter);

module.exports = app;

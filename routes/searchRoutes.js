const express = require("express");
const router = express.Router();
const searchController = require("../controllers/searchController.js");

router.get("/search", searchController.getSearchBox);
router.get("/search/results", searchController.getSearchResults);

module.exports = router;

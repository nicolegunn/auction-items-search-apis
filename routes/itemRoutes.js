const express = require("express");
const router = express.Router();
const itemController = require("../controllers/itemController.js");

router.get("/item/:id", itemController.getItem);

module.exports = router;

const Fuse = require("fuse.js");
const Item = require("../models/item");

module.exports.getSearchBox = (req, res) => {
  res.render("searchBox");
};

module.exports.getSearchResults = async (req, res) => {
  const { searchWord } = req.query;
  const items = await Item.find({});

  // Fuse.js options
  const options = {
    keys: ["title", "category", "description"],
    threshold: 0.3, // Adjust this value to make the search more or less fuzzy
  };

  const fuse = new Fuse(items, options);
  const results = fuse.search(searchWord).map((result) => result.item);

  res.render("searchResults", { items: results, searchWord });
};

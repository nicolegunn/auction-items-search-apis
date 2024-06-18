const Item = require("../models/item");

module.exports.getItem = async (req, res) => {
    const { id } = req.params;
    const { searchWord } = req.query;
  const item = await Item.findById(id);
  res.render("itemInfo", { item, searchWord });
};

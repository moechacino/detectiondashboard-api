const DeteksiBurung = require("../models/DeteksiBurung");

const getDetection = async (req, res) => {
  const deteksiBurung = await DeteksiBurung.find({});
  console.log(deteksiBurung);
  res.json(deteksiBurung);
};

module.exports = { getDetection };

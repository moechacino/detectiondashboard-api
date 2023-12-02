const mongoose = require("mongoose");

const DeteksiBurungSchema = new mongoose.Schema({
  isDetected: Boolean,
  speakerController: Boolean,
  speakerFreq: Number,
});

module.exports = mongoose.model("DeteksiBurung", DeteksiBurungSchema);

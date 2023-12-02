const express = require("express");
const router = express.Router();

const { getDetection } = require("../controllers/deteksiburung");

router.route("/deteksiburung/").get(getDetection);

module.exports = router;

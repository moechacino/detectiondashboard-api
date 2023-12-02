const express = require("express");
const router = express.Router();

const { getAllFiles } = require("../controllers/fotodauncontroller");

router.route("/fotodaun/").get(getAllFiles);

module.exports = router;

const express = require("express");
const router = express.Router();

const { getVideo } = require("../controllers/deteksipemilik");

router.route("/deteksipemilik/").get(getVideo);

module.exports = router;

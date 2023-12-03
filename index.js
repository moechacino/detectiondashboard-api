require("dotenv").config();
const express = require("express");
const bodyParser = require("body-parser");
const app = express();
const port = process.env.PORT || 5000;
const db = require("./db/db");
const deteksiburung = require("./routes/deteksiburung");
const fotodaun = require("./routes/fotodaun");
const deteksipemilik = require("./routes/deteksipemilik");

const cors = require("cors");

app.use(cors());

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.use("/", fotodaun);
app.use("/", deteksiburung);
app.use("/", deteksipemilik);

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send("Something went wrong!");
});

const start = async () => {
  try {
    await db(process.env.MONGO_URI);
    app.listen(port, () => {
      console.log(`Server is running on port ${port}`);
    });
  } catch (error) {
    console.log(error);
  }
};
start();

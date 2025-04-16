const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const dotenv = require("dotenv");
const gameRoutes = require("./routes/games");
const userRoutes = require("./routes/users");


dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());
app.use("/api/games", gameRoutes);
app.use("/api/users", userRoutes);

app.get("/", (req, res) => {
  res.send("Backend çalışıyor!");
});

mongoose
  .connect(process.env.MONGODB_URI)
  .then(() => {
    console.log("MongoDB bağlantısı başarılı!");
    app.listen(PORT, () => {
      console.log(`Server ${PORT} portunda çalışıyor!`);
    });
  })
  .catch((err) => console.error("MongoDB bağlantı hatası:", err));

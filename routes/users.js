const express = require("express");
const router = express.Router();
const User = require("../models/user");

// Yeni kullanıcı oluştur
router.post("/", async (req, res) => {
  try {
    const user = new User(req.body);
    await user.save();
    res.status(201).json(user);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Kullanıcı sil
router.delete("/:id", async (req, res) => {
  try {
    await User.findByIdAndDelete(req.params.id);
    res.json({ message: "Kullanıcı silindi." });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Kullanıcı profili getir
router.get("/:id", async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    res.json(user);
  } catch (err) {
    res.status(404).json({ error: "Kullanıcı bulunamadı." });
  }
});

// Giriş (basit bir login simülasyonu)
router.post("/login", async (req, res) => {
  const { name } = req.body;
  try {
    const user = await User.findOne({ name });
    if (user) {
      res.json({ message: "Giriş başarılı!", user });
    } else {
      res.status(404).json({ error: "Kullanıcı bulunamadı." });
    }
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;

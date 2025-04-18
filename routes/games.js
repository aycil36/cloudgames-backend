const express = require("express");
const Game = require("../models/game");
const router = express.Router();
const User = require("../models/users");
const { userId, text, rating, playTime } = req.body;

// Yeni oyun ekle
router.post("/", async (req, res) => {
  try {
    const { userId, text, rating, playTime } = req.body;

    const game = new Game(req.body);
    await game.save();
    res.status(201).json(game);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});


// Tüm oyunları getir
router.get("/", async (req, res) => {
  try {
    const games = await Game.find();
    res.json(games);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Oyun sil
router.delete("/:id", async (req, res) => {
  try {
    await Game.findByIdAndDelete(req.params.id);
    res.json({ message: "Oyun silindi." });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Değerlendirme ve yorum kapatma
router.patch("/:id/disable", async (req, res) => {
  try {
    const game = await Game.findById(req.params.id);
    game.ratingEnabled = false;
    await game.save();
    res.json({ message: "Değerlendirme ve yorum devre dışı bırakıldı." });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Değerlendirme ve yorum açma
router.patch("/:id/enable", async (req, res) => {
  try {
    const game = await Game.findById(req.params.id);
    game.ratingEnabled = true;
    await game.save();
    res.json({ message: "Değerlendirme ve yorum aktif edildi." });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Oyun oynama işlemi
router.post("/:id/play", async (req, res) => {
  const { userId, minutes } = req.body;
  try {
    const game = await Game.findById(req.params.id);
    const user = await User.findById(userId);

    if (!game || !user) return res.status(404).json({ error: "Kullanıcı veya oyun bulunamadı." });

    // Oyunun toplam oyun süresini artır
    game.playTime += minutes;

    // Kullanıcının toplam oyun süresini artır
    user.totalPlayTime += minutes;

    // Kullanıcının ratedGames listesinde bu oyun varsa, playTime'ı güncelle
    const existing = user.ratedGames.find(entry => entry.gameId.toString() === game._id.toString());
    if (existing) {
      existing.playTime += minutes;
    } else {
      user.ratedGames.push({
        gameId: game._id,
        rating: 0,
        playTime: minutes
      });
    }

    await game.save();
    await user.save();

    res.json({ message: "Oyun süresi kaydedildi." });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});


router.post("/:id/comment", async (req, res) => {
  try {
    const game = await Game.findById(req.params.id);
    const user = await User.findById(userId);

    if (!game || !user) {
      return res.status(404).json({ error: "Oyun veya kullanıcı bulunamadı." });
    }

    if (!game.isRatingEnabled) {
      return res.status(403).json({ error: "Yorum yapma özelliği kapalı." });
    }

    // Kullanıcının yorum listesine ekle
    user.comments.push({
      gameId: game._id,
      gameName: game.name,
      text
    });

    // Oyunun yorum listesine ekle
    game.allComments.push({
      userId: user._id,
      userName: user.name,
      text,
      rating: rating || 0,
      playTime: playTime || 0
    });

    // Oyun süresi ekle
    if (playTime) {
      game.playTime += playTime;
      user.totalPlayTime += playTime;

      const played = user.ratedGames.find(g => g.gameId.toString() === game._id.toString());
      if (played) {
        played.playTime += playTime;
      } else {
        user.ratedGames.push({ gameId: game._id, rating: 0, playTime });
      }
    }

    // Rating varsa, kullanıcıya puanı kaydet
    if (rating) {
      const rated = user.ratedGames.find(r => r.gameId.toString() === game._id.toString());

      if (rated) {
        rated.rating = rating;
      } else {
        user.ratedGames.push({
          gameId: game._id,
          rating,
          playTime: playTime || 0
        });
      }

      // Oyun için ortalama rating hesapla
      const allRatings = game.allComments
        .filter(c => c.rating > 0)
        .map(c => c.rating);

      if (allRatings.length > 0) {
        const average = allRatings.reduce((a, b) => a + b, 0) / allRatings.length;
        game.rating = parseFloat(average.toFixed(2));
      }
    }

    await user.save();
    await game.save();

    res.json({ message: "Yorum eklendi!" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});


module.exports = router;

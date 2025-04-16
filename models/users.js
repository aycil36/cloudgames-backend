const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  totalPlayTime: { type: Number, default: 0 },
  comments: [
    {
      gameId: mongoose.Schema.Types.ObjectId,
      gameName: String,
      text: String
    }
  ],
  ratedGames: [
    {
      gameId: mongoose.Schema.Types.ObjectId,
      rating: Number,
      playTime: Number
    }
  ]
});

module.exports = mongoose.model('User', userSchema);

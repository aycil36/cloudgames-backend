const mongoose = require('mongoose');

const gameSchema = new mongoose.Schema({
  name: String,
  genres: [String],
  photo: String,
  playTime: Number,
  rating: Number,
  isRatingEnabled: Boolean,
  releaseDate: String,
  developer: String,
  comments: [
    {
      userId:mongoose.Schema.Types.ObjectId,
      userName: String,
      text: String,
      playTime: Number,
      rating: number
    }
  ]
  

});

module.exports = mongoose.model('Game', gameSchema);

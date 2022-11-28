const mongoose = require("mongoose");

const Leaderboard = mongoose.model(
  "Leaderboard",
  new mongoose.Schema({
    player_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User"
    },
    disconected: Boolean,
    score: Number,
  })
);

module.exports = Leaderboard;

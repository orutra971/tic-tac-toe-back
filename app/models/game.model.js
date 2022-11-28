const mongoose = require("mongoose");

const Game = mongoose.model(
  "Game",
  new mongoose.Schema({
    player_x: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User"
    },
    player_o: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User"
    },
    state: Number,
  })
);

module.exports = Game;

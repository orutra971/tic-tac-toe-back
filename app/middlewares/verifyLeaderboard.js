const db = require("../models");
const Leaderboar = db.leaderboard;

const checkDuplicatePlayerInLeaderboard = (req, res, next) => {
  // Existing user in leaderboard
  Leaderboar.findOne({
    player_id: req.body.player_id,
  }).exec((err, user) => {
    if (err) {
      res.status(500).json({ message: err.message });
      return;
    }

    if (user) {
      res.status(400).json({ message: "Failed! the player is already in the leaderboard!" });
      return;
    }

    next();
  });
};

const checkIfPlayerExistInLeaderboar = (req, res, next) => {
  // Existing user in leaderboard
  Leaderboar.findOne({
    player_id: req.body.player_id,
  }).exec((err, user) => {
    if (err) {
      res.status(500).json({ message: err.message  });
      return;
    }

    if (!user) {
      res.status(400).json({ message: "Failed! the player is not in the leaderboard!" });
      return;
    }

    next();
  });
};

const verifyLeaderboar = {
  checkDuplicatePlayerInLeaderboard,
  checkIfPlayerExistInLeaderboar,
};

module.exports = verifyLeaderboar;

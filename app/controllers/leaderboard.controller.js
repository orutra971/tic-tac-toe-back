const db = require("../models");
const { leaderboard: Leaderboard, user: User } = db;
const { verifyGame } = require("../middlewares");

exports.addPlayerToLeaderboard = (req, res) => {
  const leaderboard = new Leaderboard({
    score: 0,
  });

  leaderboard.save((err, leaderboard) => {
    if (err) {
      res.status(500).json({ message: err.message });
      return;
    }

    User.find(
      {
        _id: req.body.player_id,
      },
      (err, user) => {
        if (err) {
          res.status(500).json({ message: err.message  });
          return;
        }

        leaderboard.player_id = user._id;
        leaderboard.save((err) => {
          if (err) {
            res.status(500).json({ message: err.message  });
            return;
          }

          res.json({ message: "Player added to leaderboard was created successfully!" });
        });
      }
    );

  });
};

exports.removePlayerFromLeaderboard = (req, res) => {
  Leaderboard.findOneAndDelete(
    {
      player_id: req.params.id,
    },
    (err, deleted) => {
      console.log('deleted', deleted);
      if (err) {
        res.status(500).json({ message: err.message });
        return;
      }
      if (deleted) {
        verifyGame.removeByIndex(deleted.player_id.toHexString(), "");
      }


      res.json({ message: "Player removed from leaderboard successfully!" });
    }
  );
};

exports.getLeaderboard = (_req, res) => {
  Leaderboard.find()
    .sort({score: -1})    
    .exec(function (err, result) {
      if (err) {
        res.status(400).json({ message: "Error fetching leaderboard!"});
      } else {
        res.json(result);
      }
    });
};

exports.getPlayerInLeaderboard = (req, res) => {
  Leaderboard.findOne(
    {
      player_id: req.params.id,
    },
    (err, game) => {
      if (err) {
        res.status(500).json({ message: err.message });
        return;
      }

      res.status(200).json(game);
    }
  );
};

exports.addPoint = (req, res) => {
  Leaderboard.findOneAndUpdate(
    {
      player_id: req.body.player_id,
    },
    {
      $inc: {score: 1},
    },
    (err) => {
      if (err) {
        res.status(500).json({ message: err.message  });
        return;
      }

      res.json({ message: "Leaderboard was changed successfully!" });
    }
  );
};

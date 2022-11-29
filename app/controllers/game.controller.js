const mongoose = require("mongoose");
const db = require("../models");
const { game: Game, user: User, leaderboard: Leaderboard } = db;
const { verifyGame } = require("../middlewares");

exports.createGame = (req, res) => {
  const game = new Game({
    state: -1,
    player_x: mongoose.Types.ObjectId(req.body.player_x),
    player_o: mongoose.Types.ObjectId(req.body.player_o),
  });
  game.save((err, game) => {
    verifyGame.removeByIndex(req.body.player_x, req.body.player_o);
    if (err) {
      res.status(500).json({ message: err.message });
      return;
    }
    console.log('gameCreate', game);

    User.find(
      {
        _id: { $in: [req.body.player_x, req.body.player_o] },
      },
      (err, users) => {
        if (err) {
          res.status(500).json({ message: err.message });
          return;
        }
        game.player_x = users.filter((e) => e._id.toHexString() === req.body.player_x).map((e) => e._id);
        game.player_o = users.filter((e) => e._id.toHexString() === req.body.player_o).map((e) => e._id);
        game.save((err) => {
          if (err) {
            res.status(500).json({ message: err.message });
            return;
          }

          res.json(game);
        });
      }
    );

  });
};

exports.getGame = (req, res) => {
  Game.findOne(
    {
      _id: req.params.id,
    },
    (err, game) => {
      // console.log({getGameErr: err.message});
      console.log({game: game});
      if (err) {
        res.status(500).json({ message: err.message });
        return;
      }
      
      if (game && game.player_x && game.player_o) {
        verifyGame.removeByIndex(game.player_x.toHexString(), game.player_o.toHexString());
      }
      
      if (game.state === -1) {
        game.state = 0;

        game.save((err) => {
          if (err) {
            res.status(500).json({ message: err.message });
          }
          console.log({game2: game});

          res.status(200).json(game);
        });
        return;
      }

      if (game.state === 0) {
        res.status(200).json(game);
        return;
      }

      res.status(500).json({ message: "Game already finished" });
    }
  );
};

exports.deleteGame = (req, res) => {
  console.log('gameToDelete', req.params.id);
  Game.findOne(
    {
      _id: req.params.id,
    },
    (err, game) => {
      if (!game || !game.player_x || !game.player_o) {
        res.status(500).json({ message: "Player not found in game" });
        return;
      }

      verifyGame.removeByIndex(game.player_x.toHexString(), game.player_o.toHexString());

      if (err) {
        res.status(500).json({ message: err.message });
        return;
      }

      Game.deleteMany(
        {
          state: -1,
          player_x: {$in: [game.player_x.toHexString(), game.player_o.toHexString()]},
          player_o: {$in: [game.player_x.toHexString(), game.player_o.toHexString()]}
        },
        (err, deleted) => {
          console.log('gameDeleted', deleted);
          if (err) {
            res.status(500).json({ message: err.message });
            return;
          }
    
          res.status(200).json({ message: 'Game deleted successfully!'});
        }
        
      )
    }
  )
};

exports.getAllGames = (req, res) => {
  Game.find(
    {
      state: {$in:  [-1, 0]}
    },
    (err, games) => {
      if (err) {
        res.status(500).json({ message: err.message });
        return;
      }

      res.status(200).json(games);
    }
  );
};


exports.finishGame = (req, res) => {
  Game.findOneAndUpdate(
    {
      _id: req.params.id,
    },
    {
      $set: {state: req.body.state},
    },
    (err, game) => {
      if (err) {
        res.status(500).json({ message: err.message });
        return;
      }
      verifyGame.removeByIndex(game.player_x.toHexString(), game.player_o.toHexString());

      if (game.state === 0) {
        const player_id = req.body.state === 1 ? game.player_x.toHexString() : game.player_o.toHexString();
        Leaderboard.findOneAndUpdate(
          {
            player_id: player_id,
          },
          {
            $inc: {score: 1},
          },
          (err) => {
            if (err) {
              res.status(500).json({ message: err.message  });
              return;
            }
      
            res.status(200).json(game);
          }
        );
        return;
      }

      res.status(200).json(game);
    }
  );
};

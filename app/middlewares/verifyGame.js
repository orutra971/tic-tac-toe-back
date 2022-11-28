const db = require("../models");
const Game = db.game;
const User = db.user;


const cachePlayersWaitingPetition = [];

const removeByIndex = (player_x, player_o) => {
  const index = cachePlayersWaitingPetition.reduce(function (r, v, i) {
    return r.concat(v === player_x || v === player_o ? i : []);
  }, []);
  index.forEach((e) => {
    cachePlayersWaitingPetition.splice(e, 1);
  })
}

const checkDuplicateGame = (req, res, next) => {
  // Existing game
  if (cachePlayersWaitingPetition.some((e) => e === req.body.player_x || e === req.body.player_o)) {
    console.log({ message: "Failed! Game already exist in cache!", cache: cachePlayersWaitingPetition })
    res.status(400).json({ message: "Failed! Game already exist!" });
    return;
  } else {
    cachePlayersWaitingPetition.push(req.body.player_x);
    cachePlayersWaitingPetition.push(req.body.player_o);
  }

  Game.findOne({
    $or: [
      {
        state: -1,
        player_x: req.body.player_x
      },
      {
        state: -1,
        player_x: req.body.player_o
      },
      {
        state: -1,
        player_o: req.body.player_x
      },
      {
        state: -1,
        player_o: req.body.player_o
      },
    ]
  }).exec((err, user) => {
    if (err) {
      res.status(500).json({ message: err.message  });
      return;
    }

    if (user) {
      console.log({ message: "Failed! Game already exist!" })
      res.status(400).json({ message: "Failed! Game already exist!" });
      return;
    }

    next();
  });
};

const checkGameExist = (req, res, next) => {
  // Existing game
  Game.findOne({
    _id: req.params.id,
  }).exec((err, user) => {
    if (err) {
      res.status(500).json({ message: err.message  });
      return;
    }

    if (!user) {
      res.status(400).json({ message: "Failed! Game doesn't exist!" });
      return;
    }

    next();
  });
};

const checkGameResultExist = (req, res, next) => {
  // Existing game
  if (!req.body.state) {
    res.status(400).json({ message: "Failed! game state missing" });
    return;

  }

  next();
};

const  checkPlayerMissing = (req, res, next) => {
  if (!req.body.player_x || !req.body.player_o) {
    res.status(400).json({ message: "The game is missing players!" });
    return;
  }

  // Find player_x
  User.findOne({
    _id: req.body.player_x,
  }).exec((err, user) => {
    if (err) {
      res.status(500).json({ message: err.message  });
      return;
    }

    if (!user) {
      res.status(400).json({ message: "Failed! player X doesn't exist!" });
      return;
    }
    
    // Find player_o
    User.findOne({
      _id: req.body.player_o,
    }).exec((err, user) => {
      if (err) {
        res.status(500).json({ message: err.message  });
        return;
      }
  
      if (!user) {
        res.status(400).json({ message: "Failed! player O doesn't exist!" });
        return;
      }
  
      next();
    });
  });

};

const verifyGame = {
  cachePlayersWaitingPetition,
  removeByIndex,
  checkDuplicateGame,
  checkGameExist,
  checkGameResultExist,
  checkPlayerMissing,
};

module.exports = verifyGame;

const { authJwt } = require("../middlewares");
const controller = require("../controllers/game.controller");
const { verifyGame } = require("../middlewares");

module.exports = function(app) {
  app.use(function(req, res, next) {
    res.header(
      "Access-Control-Allow-Headers",
      "x-access-token, Origin, Content-Type, Accept"
    );
    next();
  });

  app.get("/api/games", 
    [
      authJwt.verifyToken,
    ],
    controller.getAllGames,
  );

  app.get("/api/games/:id", 
    [
      authJwt.verifyToken,
      verifyGame.checkGameExist,
    ],
    controller.getGame,
  );

  app.post("/api/games", 
    [
      authJwt.verifyToken,
      verifyGame.checkPlayerMissing,
      verifyGame.checkDuplicateGame,
    ],
    controller.createGame,
  );

  app.patch("/api/games/:id", 
    [
      authJwt.verifyToken,
      verifyGame.checkGameExist,
      verifyGame.checkGameResultExist,
    ],
    controller.finishGame,
  );

  app.delete("/api/games/:id", 
    [
      authJwt.verifyToken,
      verifyGame.checkGameExist,
    ],
    controller.deleteGame,
  );

};

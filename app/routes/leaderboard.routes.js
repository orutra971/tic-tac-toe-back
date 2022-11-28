const { authJwt } = require("../middlewares");
const controller = require("../controllers/leaderboard.controller");
const { verifyLeaderboar } = require("../middlewares");

module.exports = function(app) {
  app.use(function(req, res, next) {
    res.header(
      "Access-Control-Allow-Headers",
      "x-access-token, Origin, Content-Type, Accept"
    );
    next();
  });

  app.get("/api/leaderboard", 
    [
      authJwt.verifyToken,
    ],
    controller.getLeaderboard,
  );

  app.get("/api/leaderboard/:id", 
    [
      authJwt.verifyToken,
    ],
    controller.getPlayerInLeaderboard,
  );


  app.post("/api/leaderboard", 
    [
      authJwt.verifyToken,
      verifyLeaderboar.checkDuplicatePlayerInLeaderboard,
    ],
    controller.addPlayerToLeaderboard,
  );

  app.patch("/api/leaderboard", 
    [
      authJwt.verifyToken,
      verifyLeaderboar.checkIfPlayerExistInLeaderboar,
    ],
    controller.addPoint,
  );

  app.delete("/api/leaderboard/:id", 
    [
      authJwt.verifyToken,
    ],
    controller.removePlayerFromLeaderboard,
  );

};

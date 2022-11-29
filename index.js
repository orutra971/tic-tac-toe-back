require('dotenv').config();
const express = require("express");
const cors = require("cors");
const dbConfig = require("./app/config/db.config");


const app = express();

var corsOptions = {
  origin: ["https://tic-tac-toe-front-9lnq.vercel.app", "https://tic-tac-toe-mx.herokuapp.com"],
};

app.use(cors(corsOptions));

// parse requests of content-type - application/json
app.use(express.json());

// parse requests of content-type - application/x-www-form-urlencoded
app.use(express.urlencoded({ extended: true }));

const db = require("./app/models");
const Role = db.role;


db.mongoose
  .connect(`mongodb+srv://${dbConfig.MONGODB_USER}:${dbConfig.MONGODB_PASSWORD}@clustermongo.jfbf9pd.mongodb.net/${dbConfig.MONGODB_DATABASE}?retryWrites=true&authSource=admin&w=majority`, {
    useNewUrlParser: true,
    useUnifiedTopology: true
  })
  .then(() => {
    console.log("Successfully connect to MongoDB.");
    initial();
  })
  .catch(err => {
    console.error("Connection error", err);
    process.exit();
  });

// simple route
app.get("/", (req, res) => {
  res.json({ message: "Welcome to tic-tac-toe application." });
});

// routes
require("./app/routes/auth.routes")(app);
require("./app/routes/user.routes")(app);
require("./app/routes/game.routes")(app);
require("./app/routes/leaderboard.routes")(app);


app.listen(8080, () => {
  console.log(`Server is running.`);

});

function initial() {
  Role.estimatedDocumentCount((err, count) => {
    if (!err && count === 0) {
      new Role({
        name: "user"
      }).save(err => {
        if (err) {
          console.log("error", err);
        }

        console.log("added 'user' to roles collection");
      });

      new Role({
        name: "moderator"
      }).save(err => {
        if (err) {
          console.log("error", err);
        }

        console.log("added 'moderator' to roles collection");
      });

      new Role({
        name: "admin"
      }).save(err => {
        if (err) {
          console.log("error", err);
        }

        console.log("added 'admin' to roles collection");
      });
    }
  });
}

module.exports = app;

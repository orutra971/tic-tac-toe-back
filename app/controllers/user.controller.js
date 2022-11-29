const db = require("../models");
const { user: User } = db;


exports.allAccess = (req, res) => {
  res.status(200).json("Public Content.");
};

exports.userBoard = (req, res) => {
  res.status(200).json("User Content.");
};

exports.adminBoard = (req, res) => {
  res.status(200).json("Admin Content.");
};

exports.moderatorBoard = (req, res) => {
  res.status(200).json("Moderator Content.");
};

exports.getPlayers = async (req, res) => {
  User.find(
    {},
    (err, users) => {
      console.log({err});
      if (err) {
        res.status(500).json({ message: err.message });
        return;
      }
      const _users = users.map((e) => ({_id: e._id.toHexString(), username: e.username, image: e.image}));

      console.log({_users});

      res.status(200).send(JSON.stringify(_users));
    }
  );
};
const config = require("../config/auth.config");
const db = require("../models");
const { user: User, role: Role, refreshToken: RefreshToken, leaderboard: Leaderboard } = db;
const avatar = require('random-avatar-generator');
const generator = new avatar.AvatarGenerator();
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");

exports.signup = (req, res) => {
  const user = new User({
    username: req.body.username,
    email: req.body.email,
    password: bcrypt.hashSync(req.body.password, 8),
    image: generator.generateRandomAvatar(),
  });

  user.save((err, user) => {
    if (err) {
      res.status(500).json({ message: err.message });
      return;
    }

    if (req.body.roles) {
      Role.find(
        {
          name: { $in: req.body.roles },
        },
        (err, roles) => {
          if (err) {
            res.status(500).json({ message: err.message });
            return;
          }

          user.roles = roles.map((role) => role._id);
          user.save((err) => {
            if (err) {
              res.status(500).json({ message: err.message });
              return;
            }

            res.json({ message: "User was registered successfully!" });
          });
        }
      );
    } else {
      Role.findOne({ name: "user" }, (err, role) => {
        if (err) {
          res.status(500).json({ message: err.message });
          return;
        }

        user.roles = [role._id];
        user.save((err, _result) => {
          if (err) {
            res.status(500).json({ message: err.message });
            return;
          }

          res.json({ message: "User was registered successfully!" });
        });
      });
    }
  });
};

exports.signin = (req, res) => {
  User.findOne({
    email: req.body.email,
  })
    .populate("roles", "-__v")
    .exec(async (err, user) => {
      if (err) {
        res.status(500).json({ message: err.message });
        return;
      }

      if (!user) {
        return res.status(404).json({ message: "User not found." });
      }

      let passwordIsValid = bcrypt.compareSync(
        req.body.password,
        user.password
      );

      if (!passwordIsValid) {
        return res.status(401).json({
          accessToken: null,
          message: "Invalid Password!",
        });
      }

      Leaderboard.findOneAndUpdate(
        { player_id: user._id },
        {
          player_id: user._id,
          score: 0,
          disconected: false,
        },
        { upsert: true, strict: false },
        async (err, _leaderboard) => {
          if (err) {
            res.status(500).json({ message: err.message });
            return;
          }
          let expiredAt = new Date();
        
          expiredAt.setSeconds(
            expiredAt.getSeconds() + config.jwtExpiration
          );

          let token = jwt.sign({ id: user.id }, config.secret, {
            expiresIn: config.jwtExpiration,
          });
    
          let refreshToken = await RefreshToken.createToken(user);
    
          let authorities = [];
    
          for (let i = 0; i < user.roles.length; i++) {
            authorities.push("ROLE_" + user.roles[i].name.toUpperCase());
          }
          res.status(200).json({
            id: user._id,
            username: user.username,
            email: user.email,
            roles: authorities,
            accessToken: token,
            refreshToken: refreshToken,
            accessTokenExpires: expiredAt.getTime().toString(),
            image: user.image,
          });

        }
      );
    });
};

exports.refreshToken = async (req, res) => {
  const { refreshToken: requestToken } = req.body;

  if (requestToken == null) {
    return res.status(403).json({ message: "Refresh Token is required!" });
  }

  try {
    let refreshToken = await RefreshToken.findOne({ token: requestToken });

    if (!refreshToken) {
      res.status(403).json({ message: "Refresh token is not in database!" });
      return;
    }

    if (RefreshToken.verifyExpiration(refreshToken)) {
      RefreshToken.findByIdAndRemove(refreshToken._id, { useFindAndModify: false }).exec();
      
      res.status(403).json({
        message: "Refresh token was expired. Please make a new signin request",
      });
      return;
    }
    let expiredAt = new Date();
  
    expiredAt.setSeconds(
      expiredAt.getSeconds() + config.jwtExpiration
    );

    let newAccessToken = jwt.sign({ id: refreshToken.user._id }, config.secret, {
      expiresIn: config.jwtExpiration,
    });

    return res.status(200).json({
      accessToken: newAccessToken,
      refreshToken: refreshToken.token,
      accessTokenExpires: expiredAt.getTime().toString(),
    });
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};

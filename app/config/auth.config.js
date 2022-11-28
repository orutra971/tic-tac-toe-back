module.exports = {
  secret: process.env.SECRET,
  jwtExpiration: 10800,           // 3 hour
  jwtRefreshExpiration: 86400,   // 24 hours
};

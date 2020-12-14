const jwt = require('jsonwebtoken');

module.exports = (id, username) => {
  // expires after half and hour (1800 seconds = 30 minutes)
  return jwt.sign({ id, username }, process.env.TOKEN_SECRET, { expiresIn: '1800s' });
};

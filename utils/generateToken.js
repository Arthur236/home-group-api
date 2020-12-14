const jwt = require('jsonwebtoken');

const { tokenSecret } = require('../config/variables');

module.exports = (id, username) => {
  // expires after half and hour (1800 seconds = 30 minutes)
  return jwt.sign({ id, username }, tokenSecret, { expiresIn: '1800s' });
};

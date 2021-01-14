const jwt = require('jsonwebtoken');

const { tokenSecret } = require('../config/variables');

module.exports = (id, firstName, email, isAdmin) => {
  // expires after half and hour (1800 seconds = 30 minutes)
  return jwt.sign({ id, firstName, email, isAdmin }, tokenSecret, { expiresIn: '1800s' });
};

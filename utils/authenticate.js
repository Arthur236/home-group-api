const jwt = require('jsonwebtoken');
const colors = require('colors');

const { authTokenSecret } = require('../config/variables');

module.exports = {
  userIsAuthenticated: (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (token === null) {
      return res.status(401).send({ msg: 'Unauthorized' });
    }

    try {
      const user = jwt.verify(token, authTokenSecret);

      req.user = user;
      next();
    } catch (error) {
      console.log(colors.red(error.message));
      return res.status(400).json({ msg: error.message });
    }
  },

  userIsAdmin: (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (token === null) {
      return res.status(401).send({ msg: 'Unauthorized' });
    }

    try {
      const user = jwt.verify(token, authTokenSecret);

      if (!user.isAdmin) {
        return res.status(401).send({ msg: 'Unauthorized' });
      }

      req.user = user;
      next();
    } catch (error) {
      console.log(colors.red(error.message));
      return res.status(400).json({ msg: error.message });
    }
  },
};

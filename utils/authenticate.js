const jwt = require('jsonwebtoken');

const { tokenSecret } = require('../config/variables');

module.exports = {
  userIsAuthenticated: (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (token === null) {
      return res.status(401).send({ error: 'Unauthorized' });
    }

    jwt.verify(token, tokenSecret, (err, user) => {
      console.log(err);

      if (err) {
        return res.status(403).send({ error: 'Forbidden' });
      }

      req.user = user;
      next();
    });
  },

  userIsAdmin: (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (token === null) {
      return res.status(401).send({ error: 'Unauthorized' });
    }

    jwt.verify(token, tokenSecret, (err, user) => {
      console.log(err);

      if (err) {
        return res.status(403).send({ error: 'Forbidden' });
      }

      if (!req.user.isAdmin) {
        return res.status(401).send({ error: 'Unauthorized' });
      }

      req.user = user;
      next();
    });
  },
};

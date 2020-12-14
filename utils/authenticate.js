module.exports = {
  userIsAuthenticated: (req, res, next) => {
    const authHeader = req.headers['Authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (token == null) {
      return res.status(401).send({ error: 'Unauthorized' });
    }

    jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, user) => {
      console.log(err);

      if (err) {
        return res.status(403).send({ error: 'Forbidden' });
      }

      req.user = user;
      next();
    });
  },

  userIsAdmin: (req, res, next) => {
    const authHeader = req.headers['Authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (token == null) {
      return res.status(401).send({ error: 'Unauthorized' });
    }

    jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, user) => {
      console.log(err);

      if (err) {
        return res.status(403).send({ error: 'Forbidden' });
      }

      if (!req.user.is_admin) {
        return res.status(401).send({ error: 'Unauthorized' });
      }

      req.user = user;
      next();
    });
  },
};

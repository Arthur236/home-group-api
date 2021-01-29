const express = require('express');

const User = require('../../models/User');
const { userIsAuthenticated } = require('../../../utils/authenticate');

const router = express.Router();

router.get('/', userIsAuthenticated, async (req, res) => {
  const limit = req.query.limit || 10;
  const page = req.query.page || 1;

  try {
    const users = await User.find({}, '_id firstName lastName email photo dateJoined isDeleted')
      .skip((limit * page) - limit)
      .limit(limit);
    const userCount = await User.countDocuments();

    return res.status(200).send({
      users,
      currentPage: parseInt(page),
      pages: Math.ceil(userCount / limit)
    });
  } catch (error) {
    console.log(error);
    res.status(400).send({ msg: 'An error occurred' });
  }
});

module.exports = router;

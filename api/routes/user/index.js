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

    return res.status(200).json({
      users,
      currentPage: parseInt(page),
      pages: Math.ceil(userCount / limit)
    });
  } catch (error) {
    console.log(error);
    res.status(400).json({ msg: 'An error occurred' });
  }
});

router.get('/:id', userIsAuthenticated, async (req, res) => {
  const { id } = req.params;

  try {
    const user = await User.findOne({ _id: id }, '_id firstName lastName email photo dateJoined isDeleted').exec();

    return res.status(200).json(user);
  } catch (error) {
    console.log(error.message);
    res.status(404).json({ msg: 'User not found' });
  }
});

module.exports = router;

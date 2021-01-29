const express = require('express');
const colors = require('colors');

const User = require('../../models/User');

const { uploadDir } = require('../../../utils/uploadHelper');
const { userIsAuthenticated } = require('../../../utils/authenticate');

const router = express.Router();

const userFields = '_id firstName lastName email photo dateJoined isDeleted';

router.get('/', userIsAuthenticated, async (req, res) => {
  const limit = req.query.limit || 10;
  const page = req.query.page || 1;

  try {
    const users = await User.find({}, userFields)
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
    const user = await User.findOne({ _id: id }, userFields);

    return res.status(200).json({ user });
  } catch (error) {
    console.log(error.message);
    res.status(404).json({ msg: 'User not found' });
  }
});

router.put('/:id', userIsAuthenticated, async (req, res) => {
  const { id } = req.params;

  // Check if user is owner
  if (req.user.id !== id) {
    console.log(colors.red('Not authorized to update user'));
    return res.status(401).json({ msg: 'Unauthorized' });
  }

  try {
    const { firstName, lastName } = req.body;

    const user = await User.findOne({ _id: id }, userFields);

    await user.updateOne({ firstName, lastName });

    return res.status(200).json(user);
  } catch (error) {
    console.log(error.message);
    res.status(404).json({ msg: 'User not found' });
  }
});

module.exports = router;

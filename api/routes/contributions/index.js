const express = require('express');
const { isEmpty } = require('lodash');

const Contribution = require('../../models/Contribution');
const User = require('../../models/User');

const { userIsAuthenticated, userIsAdmin } = require('../../../utils/authenticate');

const router = express.Router();

router.get('/', userIsAuthenticated, async (req, res) => {
  const limit = req.query.limit || 10;
  const page = req.query.page || 1;

  try {
    const contributions = await Contribution.find({ isDeleted: false })
      .populate('user', ['_id', 'photo', 'firstName', 'lastName'])
      .skip((limit * page) - limit)
      .limit(limit);

    const contributionCount = await Contribution.countDocuments();

    return res.status(200).json({
      total: contributionCount,
      currentPage: parseInt(page),
      pages: Math.ceil(contributionCount / limit),
      contributions
    });
  } catch (error) {
    console.log(error);
    res.status(400).json({ msg: 'Could not fetch contributions' });
  }
});

router.post('/create', userIsAdmin, async (req, res) => {
  const { amount, isFine, month, year, user } = req.body;
  const errors = {};

  if (!amount) {
    errors.title = 'Amount is required';
  }

  if (!month) {
    errors.description = 'Month is required';
  }

  if (!year) {
    errors.description = 'Year is required';
  }

  if (!isEmpty(errors)) {
    return res.status(400).json({ errors });
  } else {
    try {
      const userExists = await User.findOne({ _id: user });

      if (!userExists) {
        return res.status(400).json({ msg: 'User not found' });
      }

      const newContribution = new Contribution();

      newContribution.user = user;
      newContribution.amount = amount;
      newContribution.isFine = isFine;
      newContribution.month = month;
      newContribution.year = year;

      await newContribution.save();
      return res.status(201).json({ msg: 'The contribution was successfully saved' });
    } catch (error) {
      console.log(error);
      return res.status(400).json({ msg: 'An error occurred' });
    }
  }
});

router.put('/:id', userIsAdmin, async (req, res) => {
  const { amount, isFine, month, year, user } = req.body;
  const { id } = req.params;

  const errors = {};

  if (!amount) {
    errors.title = 'Amount is required';
  }

  if (!month) {
    errors.description = 'Month is required';
  }

  if (!year) {
    errors.description = 'Year is required';
  }

  if (!isEmpty(errors)) {
    return res.status(400).json({ errors });
  } else {
    try {
      const userExists = await User.findOne({ _id: user, isDeleted: false });

      if (!userExists) {
        return res.status(400).json({ msg: 'User not found' });
      }

      const contribution = await Contribution.findOne({ _id: id, isDeleted: false });

      if (!contribution) {
        return res.status(404).json({ msg: 'Contribution not found' });
      }

      await contribution.updateOne({ amount, isFine, month, year, user });

      return res.status(200).json({
        msg: 'The contribution was successfully updated',
      });
    } catch (error) {
      console.log(error);
      return res.status(400).json({ msg: 'An error occurred' });
    }
  }
});

router.delete('/:id', userIsAdmin, async (req, res) => {
  const { id } = req.params;

  try {
    const contribution = await Contribution.findOne({ _id: id });

    if (!contribution) {
      return res.status(404).json({ msg: 'Contribution not found' });
    }

    await contribution.updateOne({ isDeleted: true });

    return res.status(200).json({
      msg: 'The contribution was successfully deleted'
    });
  } catch (error) {
    console.log(error);
    return res.status(400).json({ msg: 'An error occurred' });
  }
});

module.exports = router;

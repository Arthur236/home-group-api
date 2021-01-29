const express = require('express');
const { isEmpty } = require('lodash');

const Contribution = require('../../models/Contribution');

const { userIsAuthenticated, userIsAdmin } = require('../../../utils/authenticate');

const router = express.Router();

router.get('/', userIsAuthenticated, async (req, res) => {
  const limit = req.query.limit || 10;
  const page = req.query.page || 1;

  try {
    const contributions = await Contribution.find()
      .populate('user', ['_id', 'photo', 'firstName', 'lastName'])
      .skip((limit * page) - limit)
      .limit(limit);

    const contributionCount = await Contribution.countDocuments();

    return res.status(200).json({
      contributions,
      currentPage: parseInt(page),
      pages: Math.ceil(contributionCount / limit)
    });
  } catch (error) {
    console.log(error);
    res.status(400).json({ msg: 'Could not fetch contributions' });
  }
});

router.post('/create', userIsAdmin, async (req, res) => {
  const { amount, month, year, user } = req.body;
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
    const newContribution = new Contribution();

    newContribution.user = user;
    newContribution.amount = amount;
    newContribution.month = month;
    newContribution.year = year;

    try {
      await newContribution.save();
      return res.status(201).json({ msg: 'The contribution was successfully saved' });
    } catch (error) {
      console.log(error);
      return res.status(400).json({ msg: 'An error occurred' });
    }
  }
});

module.exports = router;

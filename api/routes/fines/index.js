const express = require('express');
const { isEmpty } = require('lodash');

const Fine = require('../../models/Fine');
const User = require('../../models/User');

const { userIsAuthenticated, userIsAdmin } = require('../../../utils/authenticate');

const router = express.Router();

router.get('/', userIsAuthenticated, async (req, res) => {
  const limit = req.query.limit || 10;
  const page = req.query.page || 1;

  try {
    const fines = await Fine.find({ isDeleted: false })
      .populate('user', ['_id', 'photo', 'firstName', 'lastName'])
      .skip((limit * page) - limit)
      .limit(limit);

    const fineCount = await Fine.countDocuments();

    return res.status(200).json({
      total: fineCount,
      currentPage: parseInt(page),
      pages: Math.ceil(fineCount / limit),
      fines
    });
  } catch (error) {
    console.log(error);
    res.status(400).json({ msg: 'Could not fetch fines' });
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
    try {
      const userExists = await User.findOne({ _id: user, isDeleted: false });

      if (!userExists) {
        return res.status(400).json({ msg: 'User not found' });
      }

      const newFine = new Fine();

      newFine.user = user;
      newFine.amount = amount;
      newFine.month = month;
      newFine.year = year;

      await newFine.save();
      return res.status(201).json({ msg: 'The fine was successfully saved' });
    } catch (error) {
      console.log(error);
      return res.status(400).json({ msg: 'An error occurred' });
    }
  }
});

router.put('/:id', userIsAdmin, async (req, res) => {
  const { amount, month, year, user } = req.body;
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
        return res.status(404).json({ msg: 'User not found' });
      }

      const fine = await Fine.findOne({ _id: id, isDeleted: false });

      if (!fine) {
        return res.status(404).json({ msg: 'Fine not found' });
      }

      await fine.updateOne({ amount, month, year, user });

      return res.status(200).json({
        msg: 'The fine was successfully updated'
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
    const fine = await Fine.findOne({ _id: id });

    if (!fine) {
      return res.status(404).json({ msg: 'Fine not found' });
    }

    await fine.updateOne({ isDeleted: true });

    return res.status(200).json({
      msg: 'The fine was successfully deleted'
    });
  } catch (error) {
    console.log(error);
    return res.status(400).json({ msg: 'An error occurred' });
  }
});

module.exports = router;

const express = require('express');
const { isEmpty } = require('lodash');

const Contribution = require('../../models/Contribution');
const { userIsAuthenticated } = require('../../../utils/authenticate');

const router = express.Router();

router.get('/', userIsAuthenticated, (req, res) => {
  const limit = req.query.limit || 10;
  const page = req.query.page || 1;

  Contribution.find()
    .populate('user', ['_id', 'photo', 'username', 'firstName', 'lastName'])
    .skip((limit * page) - limit)
    .limit(limit)
    .then((contributions) => {
      Contribution.countDocuments().then((contributionCount) => {
        res.status(200).send({
          contributions,
          currentPage: parseInt(page),
          pages: Math.ceil(contributionCount / limit)
        })
      });
    }).catch((error) => {
    console.log('Could not fetch your posts\n', error);

    res.status(400).send({ error: 'Could not fetch contributions' });
  });
});

router.post('/create', (req, res) => {
  const errors = {};

  if (!req.body.amount) {
    errors.title = 'Amount is required';
  }

  if (!req.body.month) {
    errors.description = 'Month is required';
  }

  if (!req.body.year) {
    errors.description = 'Year is required';
  }

  if (!isEmpty(errors)) {
    res.status(400).send({ errors });
  } else {
    const newContribution = new Contribution();

    newContribution.user = req.body.user;
    newContribution.amount = req.body.amount;
    newContribution.month = req.body.month;
    newContribution.year = req.body.year;

    newContribution.save().then((savedPost) => {
      res.status(201).send({ msg: 'The contribution was successfully saved' });
    }).catch((error) => {
      console.log('Could not create your post\n', error);
      res.status(400).send({ errors: error.errors });
    });
  }
});

module.exports = router;

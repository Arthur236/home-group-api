const express = require('express');
const bcrypt = require('bcryptjs');
const { isEmpty } = require('lodash');

const User = require('../../models/User');
const { userIsAdmin } = require('../../../utils/authenticate');
const generateToken = require('../../../utils/generateToken');

const router = express.Router();

router.post('/login', (req, res) => {
  const errors = {};

  if (!req.body.email) {
    errors.email = 'Email is required';
  }

  if (!req.body.password) {
    errors.password = 'Password is required';
  }

  if (!isEmpty(errors)) {
    return res.status(400).json(errors);
  } else {
    User.find({ email: req.body.email }).then(async (users) => {
      if (users.length > 0) {
        const user = users[0];

        const isPasswordValid = await bcrypt.compareSync(req.body.password, user.password);

        if (isPasswordValid) {
          const token = await generateToken(user._id, user.firstName, user.email, user.isAdmin);

          return res.status(200).json({ token });
        } else {
          return res.status(401).json({ error: 'Password is not valid' });
        }
      } else {
        return res.status(404).json({ error: 'User does not exist' });
      }
    })
  }
});

router.post('/register', userIsAdmin, (req, res) => {
  const errors = {};

  if (!req.body.firstName) {
    errors.firstName = 'First Name is required';
  }

  if (req.body.firstName.trim().length < 3) {
    errors.firstName = 'First Name should be at least 3 letters long';
  }

  if (!req.body.lastName) {
    errors.lastName = 'Last Name is required';
  }

  if (req.body.lastName.trim().length < 3) {
    errors.lastName = 'Last Name should be at least 3 letters long';
  }

  if (!req.body.email) {
    errors.email = 'Email is required';
  }

  if (!req.body.password) {
    errors.password = 'Password is required';
  }

  if (req.body.password.length < 6) {
    errors.password = 'Password should be at least 6 characters long';
  }

  if (!isEmpty(errors)) {
    return res.status(400).json(errors);
  } else {
    bcrypt.genSalt(10, (err, salt) => {
      bcrypt.hash(req.body.password, salt, (err, hash) => {

        const newUser = new User({
          firstName: req.body.firstName,
          lastName: req.body.lastName,
          email: req.body.email,
          password: hash,
        });

        User.find({ email: req.body.email }).then((users) => {
          if (users.length < 1) {
            User.find({ email: req.body.email }).then((users) => {
              if (users.length < 1) {
                newUser.save().then((savedUser) => {
                  console.log(`${savedUser.firstName} was registered successfully`);
                  return res.status(201).json(`${savedUser.firstName} was registered successfully`);
                });
              } else {
                errors.email = `A user with email '${req.body.email}' already exists`;
                return res.status(400).json(errors);
              }
            });
          } else {
            errors.email = `A user with email '${req.body.email}' already exists`;
            return res.status(400).json(errors);
          }
        });
      });
    });
  }
});

module.exports = router;

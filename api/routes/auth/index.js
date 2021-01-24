const express = require('express');
const bcrypt = require('bcryptjs');
const { extend, isEmpty } = require('lodash');
const mailgun = require('mailgun-js');
const handlebars = require("handlebars");
const jwt = require('jsonwebtoken');
const fs = require("fs");
const path = require("path");

const User = require('../../models/User');
const { userIsAdmin } = require('../../../utils/authenticate');
const generateToken = require('../../../utils/generateToken');
const {
  authTokenSecret,
  clientUrl,
  resetTokenSecret,
  mailgunApiKey,
  mailgunDomain
} = require('../../../config/variables');

const router = express.Router();
const mg = mailgun({ apiKey: mailgunApiKey, domain: mailgunDomain });

router.post('/login', (req, res) => {
  const { email, password } = req.body;
  const errors = {};

  if (!email) {
    errors.email = 'Email is required';
  }

  if (!password) {
    errors.password = 'Password is required';
  }

  if (!isEmpty(errors)) {
    return res.status(400).json(errors);
  } else {
    User.find({ email }).then(async (users) => {
      if (users.length > 0) {
        const user = users[0];

        const isPasswordValid = await bcrypt.compareSync(password, user.password);

        if (isPasswordValid) {
          const token = await generateToken(user.slug, user.firstName, user.email, user.isAdmin, authTokenSecret, '30m');

          return res.status(200).json({ token });
        } else {
          return res.status(401).json({ error: 'Password is not valid' });
        }
      } else {
        return res.status(404).json({ error: 'User does not exist' });
      }
    });
  }
});

router.post('/register', userIsAdmin, (req, res) => {
  const { firstName, lastName, email, password } = req.body;
  const errors = {};

  if (!firstName) {
    errors.firstName = 'First Name is required';
  }

  if (firstName.trim().length < 3) {
    errors.firstName = 'First Name should be at least 3 letters long';
  }

  if (!lastName) {
    errors.lastName = 'Last Name is required';
  }

  if (lastName.trim().length < 3) {
    errors.lastName = 'Last Name should be at least 3 letters long';
  }

  if (!email) {
    errors.email = 'Email is required';
  }

  if (!password) {
    errors.password = 'Password is required';
  }

  if (password.length < 6) {
    errors.password = 'Password should be at least 6 characters long';
  }

  if (!isEmpty(errors)) {
    return res.status(400).json(errors);
  } else {
    bcrypt.genSalt(10, (err, salt) => {
      bcrypt.hash(password, salt, (err, hash) => {

        const newUser = new User({
          firstName,
          lastName,
          email,
          password: hash
        });

        User.find({ email }).then((users) => {
          if (users.length < 1) {
            User.find({ email }).then((users) => {
              if (users.length < 1) {
                newUser.save().then((savedUser) => {
                  console.log(`${savedUser.firstName} was registered successfully`);
                  return res.status(201).json({ success: `${savedUser.firstName} was registered successfully` });
                });
              } else {
                errors.email = `A user with email '${email}' already exists`;
                return res.status(400).json(errors);
              }
            });
          } else {
            errors.email = `A user with email '${email}' already exists`;
            return res.status(400).json(errors);
          }
        });
      });
    });
  }
});

router.put('/forgot-password', (req, res) => {
  const { email } = req.body;
  const errors = {};

  if (!email) {
    errors.email = 'Email is required';
  }

  if (!isEmpty(errors)) {
    return res.status(400).json(errors);
  } else {
    User.findOne({ email }, async (err, user) => {
      if (err || !user) {
        return res.status(400).json({ error: 'A user with that email does not exist' });
      }

      const token = await generateToken(user.slug, user.firstName, user.email, user.isAdmin, resetTokenSecret, '5m');
      const emailTemplateSource = fs.readFileSync(path.join(__dirname, "../../../templates/resetEmail.hbs"), "utf8");
      const template = handlebars.compile(emailTemplateSource);

      const htmlToSend = template({
        firstName: user.firstName,
        link: `${clientUrl}/reset-password/${token}`
      });

      const email = {
        from: 'noreply@homegroup.com',
        to: user.email,
        subject: 'Password Reset Link',
        html: htmlToSend
      };

      return user.updateOne({ resetToken: token }, (err, success) => {
        if (err) {
          return res.status(400).json({ error: 'Failed to save reset token' });
        }

        mg.messages().send(email, (error, body) => {
          if (error) {
            console.error('Mailgun Error:', error);
            return res.status(400).json({ error: 'Failed to send reset email' });
          }

          return res.status(200).json({ success: 'Reset email sent successfully' });
        });
      });
    });
  }
});

router.put('/reset-password', (req, res) => {
  const { newPassword, token } = req.body;
  const errors = {};

  if (!token) {
    errors.token = 'Token is required';
  }

  if (!newPassword) {
    errors.newPassword = 'Password is required';
  }

  if (!isEmpty(errors)) {
    return res.status(400).json(errors);
  } else {
    jwt.verify(token, resetTokenSecret, (err, decodeToken) => {
      if (err) {
        return res.status(401).json({ error: 'Invalid or expired token' });
      }

      User.findOne({ resetToken: token }, (err, user) => {
        if (err || !user) {
          return res.status(400).json({ error: 'Invalid token' });
        }

        bcrypt.genSalt(10, (err, salt) => {
          bcrypt.hash(newPassword, salt, (err, hash) => {

            const data = {
              password: hash,
              resetToken: ''
            };

            user = extend(user, data);

            user.save((err, result) => {
              if (err) {
                return res.status(400).json({ error: 'Could not reset password' });
              }

              return res.status(200).json({ success: 'Password reset successfully' });
            });
          });
        });
      });
    });
  }
});

module.exports = router;

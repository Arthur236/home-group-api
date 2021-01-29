const express = require('express');
const bcrypt = require('bcryptjs');
const { extend, isEmpty } = require('lodash');
const mailgun = require('mailgun-js');
const handlebars = require("handlebars");
const jwt = require('jsonwebtoken');
const fs = require("fs");
const path = require("path");
const colors = require('colors');

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

router.post('/login', async (req, res) => {
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
    try {
      const user = await User.findOne({ email });

      if (user) {
        const isPasswordValid = await bcrypt.compareSync(password, user.password);

        if (isPasswordValid) {
          const token = await generateToken(user._id, user.firstName, user.email, user.isAdmin, authTokenSecret, '30m');

          return res.status(200).json({ token });
        } else {
          return res.status(401).json({ msg: 'Password is not valid' });
        }
      } else {
        return res.status(404).json({ msg: 'User does not exist' });
      }
    } catch (error) {
      console.log(colors.red(error));
      return res.status(400).json({ msg: 'An error occurred' });
    }
  }
});

router.post('/register', userIsAdmin, async (req, res) => {
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
    try {
      const salt = await bcrypt.genSalt(10);

      const hash = await bcrypt.hash(password, salt);

      const newUser = new User({
        firstName,
        lastName,
        email,
        password: hash
      });

      const user = await User.findOne({ email });

      if (!user) {
        const savedUser = await newUser.save();

        console.log(colors.green(`\n${savedUser.firstName} was registered successfully`));

        return res.status(201).json({ msg: `${savedUser.firstName} was registered successfully` });
      } else {
        errors.email = `A user with email '${email}' already exists`;
        return res.status(400).json(errors);
      }
    } catch (error) {
      console.log(colors.red(error));
      return res.status(400).json({ msg: 'An error occurred' });
    }
  }
});

router.put('/forgot-password', async (req, res) => {
  const { email } = req.body;
  const errors = {};

  if (!email) {
    errors.email = 'Email is required';
  }

  if (!isEmpty(errors)) {
    return res.status(400).json(errors);
  } else {
    try {
      const user = await User.findOne({ email });

      if (!user) {
        return res.status(400).json({ msg: 'A user with that email does not exist' });
      }

      const token = await generateToken(user._id, user.firstName, user.email, user.isAdmin, resetTokenSecret, '5m');
      const emailTemplateSource = fs.readFileSync(path.join(__dirname, "../../../templates/resetEmail.hbs"), "utf8");
      const template = handlebars.compile(emailTemplateSource);

      const htmlToSend = template({
        firstName: user.firstName,
        link: `${clientUrl}/reset-password/${token}`
      });

      const emailToSend = {
        from: 'noreply@homegroup.com',
        to: user.email,
        subject: 'Password Reset Link',
        html: htmlToSend
      };

      const updatedUser = await user.updateOne({ resetToken: token });

      if (!updatedUser) {
        return res.status(400).json({ msg: 'Failed to save reset token' });
      }

      mg.messages().send(emailToSend, (error, body) => {
        if (error) {
          console.error('Mailgun Error:', error);
          return res.status(400).json({ msg: 'Failed to send reset email' });
        }

        return res.status(200).json({ msg: 'Reset email sent successfully' });
      });
    } catch (error) {
      console.log(colors.red(error));
      return res.status(400).json({ msg: 'An error occurred' });
    }
  }
});

router.put('/reset-password', async (req, res) => {
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
    try {
      const decodeToken = await jwt.verify(token, resetTokenSecret);

      if (!decodeToken) {
        return res.status(401).json({ msg: 'Invalid or expired token' });
      }

      const user = await User.findOne({ resetToken: token });

      if (!user) {
        return res.status(400).json({ msg: 'Invalid token' });
      }

      const salt = await bcrypt.genSalt(10);

      const hash = await bcrypt.hash(newPassword, salt);

      const data = {
        password: hash,
        resetToken: ''
      };

      const newUser = extend(user, data);

      const updatedUser = await newUser.save();

      if (!updatedUser) {
        return res.status(400).json({ msg: 'Could not reset password' });
      }

      return res.status(200).json({ msg: 'Password reset successfully' });
    } catch (error) {
      console.log(colors.red(error));
      return res.status(400).json({ msg: 'An error occurred' });
    }
  }
});

module.exports = router;

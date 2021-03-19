const express = require('express');
const colors = require('colors');

const User = require('../../models/User');

const uploadImage = require('../../../utils/uploadImage');
const { userIsAuthenticated } = require('../../../utils/authenticate');

const router = express.Router();

const userFields = '_id firstName lastName email photo dateJoined isDeleted';

const singleUpload = uploadImage.single('photo');

router.post('/:id', userIsAuthenticated, async (req, res) => {
  const { id } = req.params;

  // Check if user is owner
  if (req.user.id !== id) {
    console.log(colors.red('Not authorized to update user'));
    return res.status(401).json({ msg: 'Unauthorized' });
  }

  try {
    const user = await User.findOne({ _id: id }, userFields);

    if (!user) {
      return res.status(404).json({ msg: 'User not found' });
    }

    singleUpload(req, res, (error) => {
      if (error) {
        console.log('errors', error);
        return res.status(400).json({ error: error });
      }

      if (!req.file) {
        console.log('Error: No File Selected!');
        return res.status(400).json({ msg: 'Error: No File Selected' });
      } else {
        const imageLocation = req.file.location;

        user.updateOne({ photo: imageLocation });

        return res.status(200).json({ msg: 'Photo successfully updated' });
      }
    });
  } catch (error) {
    console.log(error.message);
    return res.status(400).json({ msg: 'An error occurred' });
  }
});

module.exports = router;

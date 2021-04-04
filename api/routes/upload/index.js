const express = require('express');
const colors = require('colors');

const User = require('../../models/User');

const { uploadToAWS, deleteFile } = require('../../../utils/awsHelpers');
const { userIsAuthenticated } = require('../../../utils/authenticate');

const router = express.Router();

const userFields = '_id firstName lastName email photoName photoUrl dateJoined isDeleted';

router.put('/:id', userIsAuthenticated, async (req, res) => {
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

    if (req.files) {
      const file = req.files.profilePicture;

      if (user.photoName) {
        await deleteFile(user.photoName);
      }

      const uploadRes = await uploadToAWS(file);

      await user.updateOne({ photoUrl: uploadRes.photoUrl, photoName: uploadRes.photoName });

      return res.status(200).json({ msg: 'Photo successfully updated' });
    }

    return res.status(404).json({ error: 'FILES_NOT_FOUND' });
  } catch (error) {
    console.log(error.message);
    return res.status(400).json({ msg: 'An error occurred' });
  }
});

module.exports = router;

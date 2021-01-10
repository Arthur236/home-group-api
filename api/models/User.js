const mongoose = require('mongoose');
const URLSlugs = require('mongoose-url-slugs');

const { Schema } = mongoose;

const UserSchema = new Schema({
  firstName: {
    type: String,
    required: true,
  },
  lastName: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    unique: true,
    required: true,
  },
  password: {
    type: String,
    required: true,
    minlength: 6,
  },
  photo: {
    type: String,
    default: '',
  },
  isAdmin: {
    type: Boolean,
    default: false,
  },
  dateJoined: {
    type: Date,
    default: Date.now(),
  },
  slug: {
    type: String,
  },
  isDeleted: {
    type: Boolean,
    default: false,
  }
});

UserSchema.plugin(URLSlugs('firstName', { field: 'slug'}));
module.exports = mongoose.model('User', UserSchema);

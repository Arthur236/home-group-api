const mongoose = require('mongoose');
const URLSlugs = require('mongoose-url-slugs');

const { Schema } = mongoose;

const UserSchema = new Schema({
  username: {
    type: String,
    unique: true,
    required: true,
    minlength: 3,
  },
  firstName: {
    type: String,
  },
  lastName: {
    type: String,
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
  is_admin: {
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
});

UserSchema.plugin(URLSlugs('username', { field: 'slug'}));
module.exports = mongoose.model('User', UserSchema);

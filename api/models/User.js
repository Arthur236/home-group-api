const mongoose = require('mongoose');
const mongooseSlugPlugin = require('mongoose-slug-plugin');

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
  isDeleted: {
    type: Boolean,
    default: false,
  },
  resetToken: {
    type: String,
    default: '',
  },
});

UserSchema.plugin(mongooseSlugPlugin, { tmpl: '<%=firstName%>' });
module.exports = mongoose.model('User', UserSchema);

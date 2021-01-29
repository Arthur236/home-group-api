const mongoose = require('mongoose');

const months = require('../../constants/months');

const { Schema } = mongoose;

const ContributionSchema = new Schema({
  user: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  amount: {
    type: Number,
    required: true,
  },
  month: {
    type: String,
    enum: months,
    required: true,
  },
  year: {
    type: Number,
    required: true,
  },
  isFine: {
    type: Boolean,
    default: false
  },
  createdAt: {
    type: Date,
    default: Date.now(),
  },
});

module.exports = mongoose.model('Contribution', ContributionSchema);

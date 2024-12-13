const mongoose = require('mongoose');

const ReviewSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
  },
  coursename: {
    type: String,
    required: true,
  },
  rating: {
    type: Number,
    required: true,
    min: 1,
    max: 5, 
  },
  description: {
    type: String,
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model('Review', ReviewSchema);

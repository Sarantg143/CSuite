const mongoose = require('mongoose');

const CourseRatingSchema = new mongoose.Schema({
  coursename: {
    type: String,
    required: true,
   
  },
  averageRating: {
    type: Number,
    default: 0,
  },
  totalReviews: {
    type: Number,
    default: 0,
  },
});

module.exports = mongoose.model('Course', CourseRatingSchema);

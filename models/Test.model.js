const mongoose = require('mongoose');

const questionSchema = new mongoose.Schema({
  question: String,
  options: [String],
  correctAnswer: String,
}, { _id: false });

const TestSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Title field required']
  },
  lessonId: {
    type: String,
    required: [false, 'LessonId field required']
  },
  courseId: {
    type: String,
    required: [false, 'CourseId field required']
  },
  isTestAvailable: {
    type: Boolean,
    default: true,
    required: [true, 'isTestAvailable field required']
  },
  timeLimit: {
    type: Number, 
    required: true
  },
  questions: [questionSchema]
});

const Test = mongoose.model('Test', TestSchema);

module.exports = Test;

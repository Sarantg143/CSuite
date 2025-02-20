const mongoose = require('mongoose');

const AnswerSchema = new mongoose.Schema({
  question: { type: String, required: true },
  selectedAnswer: { type: String, required: true },
  correctAnswer: { type: String, required: true },
  isCorrect: { type: Boolean, required: false }
}, { _id: false });

const LessonTestSchema = new mongoose.Schema({
  // lessonId: { type: mongoose.Schema.Types.ObjectId, required: true },
  lessonTitle: { type: String, required: true },
  answers: { type: [AnswerSchema], default: [] },
  lessonTotalMarks: { type: Number, default: 0 }
}, { _id: false });

const UserTestResponseSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  courseId: { type: mongoose.Schema.Types.ObjectId, required: true },
  courseTitle: { type: String, required: true },
  lessons: { type: [LessonTestSchema], default: [] },
  courseTotalMarks: { type: Number, default: 0 }
}, { timestamps: true });

const UserTestResponse = mongoose.model('Answer', UserTestResponseSchema);

module.exports = UserTestResponse;

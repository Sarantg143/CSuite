const mongoose = require('mongoose');

const VideoSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true
  },
  link: {
    type: String,
    required: true
  },
  duration: {
    type: String,
    required: true
  },
  notes: {
    type: String,
    default: ''
  }
}, { _id: false });

const FileSchema = new mongoose.Schema({
  type: {
    type: String,
    required: true,
    enum: ['video', 'ppt', 'pdf']
  },
  link: {
    type: String,
    required: true
  }
}, { _id: false });


const ChapterSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true
  },
  type: {
    type: String,
    required: true,
    enum: ['video', 'ppt', 'pdf']
  },
  link: {
    type: String,
    required: true
  },
  duration: {
    type: String,
    default: null
  },
  notes: {
    type: String,
    default: ''
  }
}, { _id: false });

const LessonSchema = new mongoose.Schema({
  test: {
    questions: [
      {
        question: {
          type: String,
          required: true
        },
        options: {
          type: [String],
          required: true
        },
        correctAnswer: {
          type: String,
          required: true
        }
      }
    ],
    timeLimit: {
      type: Number,
      required: false
    }
  },
  title: {
    type: String,
    required: true
  },
  description: {
    type: String,
    required: true
  },
  chapter: {
    type: [ChapterSchema],
    default: []
  }
}, { _id: false });

const OverviewPointSchema = new mongoose.Schema({
  heading: {
    type: String,
    required: true
  },
  content: {
    type: String,
    required: true
  }
}, { _id: false });

const WhatYouGetSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true
  },
  description: {
    type: String,
    required: true
  }
}, { _id: false });

const WhoIsThisForSchema = new mongoose.Schema({
  text: {
    type: String,
    required: true
  }
}, { _id: false });

const CourseDetailsSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Title field required']
  },
  overviewPoints: {
    type: [OverviewPointSchema],
    default: []
  },
  description: {
    type: String,
    required: [true, 'Description field required']
  },
  image: {
    type: String,
    default: ''
  },
  lessons: {
    type: [LessonSchema],
    default: []
  },
  header: {
    type: String,
    default: ''
  },
  videoUrl: {
    type: String,
    default: ''
  },
  whoIsThisFor: {
    type: [WhoIsThisForSchema],
    default: []
  },
  whatYouGet: {
    type: [WhatYouGetSchema],
    default: []
  },
  syllabus: {
    type: String,
    default: ''
  },
  price: {
    type: Number,
    default: 0
  }
}, { timestamps: true });

const CourseDetail = mongoose.model('CourseDetail', CourseDetailsSchema);

module.exports = CourseDetail;

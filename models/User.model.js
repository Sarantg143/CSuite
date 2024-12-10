const mongoose = require('mongoose');
const bcrypt = require('bcrypt');


const ChapterProgressSchema = new mongoose.Schema({
  chapterId: {
    type: Number, 
    required: true
  },
 watched: {
    type: Boolean,
    default: false
  },
  watchedAt: {
    type: Date, 
    default: null
  }
}, { _id: false });

const LessonProgressSchema = new mongoose.Schema({
  lessonId: {
    type: Number, 
    required: true
  },
  chapters: {
    type: [ChapterProgressSchema],
    default: []
  }
}, { _id: false });

const CourseProgressSchema = new mongoose.Schema({
  courseId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true
  },
  lessons: {
    type: [LessonProgressSchema],
    default: []
  },
  watchedPercentage: {
    type: Number,
    default: 0 
  }
}, { _id: false });

const CoursePurchasedSchema = new mongoose.Schema({
  courseId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'CourseDetail',
    required: true
  },
  courseName: {
    type: String,
    required: true
  }
}, { _id: false });

const testScoreSchema = new mongoose.Schema({
  courseName: {
    type: String,
    required: true
  },
  lessonName: {
    type: String,
    required: true
  },
  score: {
    type: Number,
    required: true
  }
}, { timestamps: true });

const EmergencyContactSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [false, 'Emergency contact name required']
  },
  relationship: {
    type: String,
    required: [false, 'Emergency contact relationship required']
  },
  phone: {
    type: String,
    required: [false, 'Emergency contact phone required']
  },
  address: {
    type: String,
    required: [false, 'Emergency contact address required']
  }
}, { _id: false });

const LoginLogoutLogSchema = new mongoose.Schema({
  date: { type: String, required: true }, 
  loginTime: { type: Date, default: null },
  logoutTime: { type: Date, default: null },
}, { _id: false });

const UserSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Name field required']
  },
  email: {
    type: String,
    required: [true, 'Email field required']
  },
  phoneNumber: {
    type: String,
    required: [false, 'Phone number field required']
  },
  password: {
    type: String,
    required: [false, 'Password field required'],
    select: false 
  },
  linkedIn: {
    type: String,
    required: [false, 'LinkedIn field required']
  },
  bio: {
    type: String,
    required: [false, 'Bio field required']
  },
  coursePurchased: [CoursePurchasedSchema],
  idCard: {
    type: String,
    required: [false, 'ID card field required']
  },
  address: {
    type: String,
    required: [false, 'Address field required']
  },
  testScore: {
    type: Number,
    required: [false, 'Test score field required']
  },
  companyname: {
    type: String,
    required: [false, 'Company name field required']
  },
  position: {
    type: String,
    required: [false, 'Position field required']
  },
  relationship: {
    type: String,
    required: [false, 'Relationship field required']
  },
  gender: {
    type: String,
    required: [false, 'Gender field required']
  },
  profilePic: {
    type: String,
    required: [false, 'Profile picture field required']
  },
  profileBanner: {
    type: String,
    required: [false, 'Profile banner field required']
  },
  testScores: [testScoreSchema],
  elaTestScore: { type: Number,  default: 0 },
  emergencyContact: {
    type: EmergencyContactSchema,
    required: false
  },
  socialMediaId: {
    type: String,
    required: [false, 'Social media ID required'],
    unique: true,
    sparse: true 
  },
  courseProgress: [CourseProgressSchema],
  type: { type: String, default: 'user' },
  firstLogin: { type: Boolean, default: true },
  elaComplete: { type: Boolean, default: false },
  loginLogoutLogs: [LoginLogoutLogSchema],
}, { timestamps: true });

// Hash the password
UserSchema.pre('save', async function (next) {
  if (this.isModified('password') && this.password) {
    try {
      const salt = await bcrypt.genSalt(10);
      this.password = await bcrypt.hash(this.password, salt);
      next();
    } catch (error) {
      next(error);
    }
  } else {
    next();
  }
});

const User = mongoose.model('User', UserSchema);

module.exports = User;

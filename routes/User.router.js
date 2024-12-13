const { Router } = require('express');
const multer = require('multer');
const bcrypt = require('bcrypt');
const mongoose = require('mongoose');
//const jwt = require('jsonwebtoken'); 
const User = require('../models/User.model');
const CourseDetail = require('../models/CourseDetails.model');
const { findUserByEmail, insertUser } = require('../models/User.model');
const { updateVideoProgress, calculateCompletionPercentage } = require('../services/progressService');

const QuestionModel = require('../models/Question.model');

const { auth } = require("../services/firebaseAdmin");
const { verifyPasswordResetCode } = require("firebase/auth");

const userRouter = Router();


const storage = multer.memoryStorage();
const upload = multer({
  storage: storage,
  limits: {
    fieldSize: 25 * 1024 * 1024, 
    fileSize: 25 * 1024 * 1024 
  }
});


// Get all users
userRouter.get('/', async (req, res) => {
  try {
    const users = await User.find({});
    res.status(200).json({ success: true, users, message: "Get request success" });
  } catch (e) {
    res.status(500).json({ success: false, message: e.message });
  }
});


userRouter.post('/check', async (req, res) => {
  try {
    const {email,password} = req.body;
    const users = await User.findOne({email:email});
    if (users.length<1) {
      return res.status(200).json({ success: false, message: "User not found" });
    }
    isMatch = await bcrypt.compare(password, users.password);
    res.status(200).json({ success: true, users, message: "Get request success" });
  } catch (e) {
    res.status(500).json({ success: false, message: e.message });
  }
});

userRouter.get('/user/:id', async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }
    res.status(200).json({ success: true, user, message: "Get request success" });
  } catch (e) {
    res.status(500).json({ success: false, message: e.message });
  }
});

userRouter.post('/', upload.fields([{ name: 'profilePic' }, { name: 'profileBanner' }]), async (req, res) => {
  try {
    const { password, socialMediaId, ...rest } = req.body;

    // Process profilePic and profileBanner if they exist
    const profilePic = req.files?.profilePic?.[0]?.buffer?.toString('base64') || null;
    const profileBanner = req.files?.profileBanner?.[0]?.buffer?.toString('base64') || null;
    
    console.log("Received request to register or login user with email:", email);

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      console.log("User already exists with email:", email);
      return res.status(200).json({ success: true, user: existingUser, message: "User already registered, logged in successfully" });
    }

    let newUser;
    if (socialMediaId) {
      // Create user with social media ID
      newUser = new User({ ...rest, profilePic, profileBanner, socialMediaId });
    } else if (password) {

      const hashedPassword = await bcrypt.hash(password, 10);
      newUser = new User({ ...rest, password: hashedPassword, profilePic, profileBanner });
    } else {
      return res.status(400).json({ success: false, message: 'Password or social media ID required' });
    }

  
    const savedUser = await newUser.save();
    res.status(201).json({ success: true, user: savedUser, message: "User added successfully" });
  } catch (e) {
    console.error("Error creating user:", e);  // Improved error logging
    res.status(500).json({ success: false, message: e.message });
  }
});


userRouter.put('/:id', upload.fields([{ name: 'profilePic' }, { name: 'profileBanner' }]), async (req, res) => {
  try {
    const { password, ...rest } = req.body;

    if (password) {
      const hashedPassword = await bcrypt.hash(password, 10);
      rest.password = hashedPassword;
    }
    if (req.files.profilePic) {
      rest.profilePic = req.files.profilePic[0].buffer.toString('base64');
    }
    if (req.files.profileBanner) {
      rest.profileBanner = req.files.profileBanner[0].buffer.toString('base64');
    }

    const updatedUser = await User.findByIdAndUpdate(req.params.id, rest, { new: true });
    if (!updatedUser) {
      return res.status(404).json({ success: false, message: "User not found" });
    }
    res.status(200).json({ success: true, user: updatedUser, message: "Successfully updated" });
  } catch (e) {
    res.status(500).json({ success: false, message: e.message });
  }
});

// Update ELA test score for a user
userRouter.put('/updateElaScore/:id', async (req, res) => {
    try {
        const updatedUser = await User.findByIdAndUpdate(
            req.params.id,
            { elaTestScore: req.body.elaTestScore },
            { new: true }
        );
        if (!updatedUser) return res.status(404).json({ message: 'User not found' });
        res.json({ message: 'ELA test score updated', user: updatedUser });
    } catch (error) {
        res.status(400).json({ message: 'Error updating ELA test score', error: error.message });
    }
});

userRouter.get('/:id/ela', async (req, res) => {
  try {
    const userId = req.params.id;

    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({ error: 'Invalid user ID' });
    }
    const user = await User.findById(userId).select('elaComplete');
    
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json({ elaComplete: user.elaComplete });
  } catch (error) {
    console.error('Error fetching ELA complete status:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

userRouter.put('/:id/ela', async (req, res) => {
  try {
    const userId = req.params.id;
    const { elaComplete } = req.body;

    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({ error: 'Invalid user ID' });
    }
    if (typeof elaComplete !== 'boolean') {
      return res.status(400).json({ error: 'elaComplete must be a boolean' });
    }
    const user = await User.findByIdAndUpdate(userId, { elaComplete }, { new: true }).select('elaComplete');

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json({ message: 'ELA complete status updated successfully', elaComplete: user.elaComplete });
  } catch (error) {
    console.error('Error updating ELA complete status:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

userRouter.put('/updatecourse/:id', async (req, res) => {
  try {
    console.log('Request received:', req.params.id, req.body);
    const { courseId, courseName} = req.body;
     if (!courseId || !courseName) {
      return res.status(400).json({ success: false, message: "courseId and courseName are required" });
    }
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    const course = await CourseDetail.findById(courseId);
    if (!course) {
      return res.status(404).json({ success: false, message: "Course not found" });
    }

    if (user.coursePurchased.some(purchased => purchased.courseId.toString() === courseId.toString())) {
      return res.status(400).json({ success: false, message: "Course already purchased" });
    }

     user.coursePurchased.push({ courseId: course._id, courseName: course.title });
    const updatedUser = await user.save();
    res.status(200).json({ success: true, user: updatedUser, message: "Course added successfully" });
  } catch (e) {
    res.status(500).json({ success: false, message: e.message });
  }
});


userRouter.delete('/:id', async (req, res) => {
  try {
    const user = await User.findByIdAndDelete(req.params.id);
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }
    res.status(200).json({ success: true, message: "User deleted successfully" });
  } catch (e) {
    res.status(500).json({ success: false, message: e.message });
  }
});

userRouter.post('/progress/update', async (req, res) => {
  const { userId, courseId, lessonIndex, chapterIndex } = req.body;

  try {
    const result = await updateVideoProgress(userId, courseId, lessonIndex, chapterIndex);
    res.status(200).json({
      message: 'Progress updated successfully',
      watchedPercentage: result.watchedPercentage,
      courseProgress: result.courseProgress
    });
  } catch (error) {
    res.status(500).json({ message: 'Error updating video progress', error });
  }
});


userRouter.get('/progress/:userId/:courseId', async (req, res) => {
  const { userId, courseId } = req.params;
  try {
    const progress = await calculateCompletionPercentage(userId, courseId);
    res.status(200).json(progress);
  } catch (error) {
    res.status(500).json({ message: 'Error retrieving user progress', error });
  }
});


userRouter.get('/fetchela', async (req, res) => {
  try {
    const ela = await ELA.findOne();  // Assuming ELA is another model
    res.json(ela);
  } catch (err) {
    console.log(err.stack);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

userRouter.get('/check', async (req, res) => {
  try {
    if (!req.query.email) {
      return res.status(400).json({ error: 'Email query parameter is required' });
    }
    console.log(req.query.email);
    const user = await User.findOne({
      $or: [{ email: req.query.email }, { name: req.query.email }], });

    if (user) {
      res.json(user);
    } else {
      res.status(404).json({ message: 'User not found' });
    }
    console.log(req.query.email)
    console.log("route --- check")
  } catch (err) {
    console.error('Error in /check route:', err);
    res.status(500).json({ error: 'Internal Server Error' });
  }

  console.log("Check")
});

userRouter.post('/checks', async (req, res) => {
  try {
    const { email } = req.body;
    const existingUser= await User.findOne({
      $or: [{ email }, { name: email }],
    });

    if (existingUser) {
      return res.status(200).json({ exists: true, message: 'Email already exists in the database' });
    } else {
      return res.status(200).json({ exists: false, message: 'Email is available' });
    }
  } catch (err) {
    console.log(err.stack);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});



userRouter.post('/signup', async (req, res) => {
  try {
    const { name, email, linkedin, password } = req.body;
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ error: 'User already exists' });
    }
    const newUser = new User({
      name,
      email,
      linkedIn: linkedin,
      password,
      type: 'user',
      firstLogin: true,
      elaComplete: false,
    });

    // Save the user
    await newUser.save();
    res.json({ message: 'Signup successful', user: newUser });
  } catch (err) {
    console.log(err.stack);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// userRouter.post('/login', async (req, res) => {
//   try {
//     const { identifier, password } = req.body; 
//     const user = await User.findOne({
//          $or: [{ email: req.body.email }, { name: req.body.email }],
//          }).select('+password');

//     if (!user) {
//       return res.status(400).json({ error: 'Invalid email/username or password' });
//     }

//     const isMatch = await bcrypt.compare(req.body.password, user.password);
//     if (!isMatch) {
//       return res.status(400).json({ error: 'Invalid email/username or password' });
//     }
//     const userData = user.toObject();
//     delete userData.password;

//     res.json({ message: 'Login successful', user: userData });
//   } catch (err) {
//     console.error(err.stack);
//     res.status(500).json({ error: 'Internal Server Error' });
//   }
// });

userRouter.post('/login', async (req, res) => {
  try {
    const user = await User.findOne({
              $or: [{ email: req.body.email }, { name: req.body.email }],
               }).select('+password');
      
    if (!user) {
      return res.status(400).json({ error: 'Invalid email or password' });
    }
    const isMatch = await bcrypt.compare(req.body.password, user.password);
    if (!isMatch) {
      return res.status(400).json({ error: 'Invalid email or password' });
    }

    const userData = user.toObject();
    delete userData.password;
    res.json({ message: 'Login successful', user: userData });
  } catch (err) {
    console.log(err.stack);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

userRouter.put('/:id/resetpass', async (req, res) => {
  try {
    const { id } = req.params;
    const { newPassword } = req.body;

    if (!newPassword) {
      return res.status(400).json({ success: false, message: 'New password is required' });
    }
    const user = await User.findById(id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }
    user.password = newPassword;
    await user.save();

    res.status(200).json({ success: true, message: 'Password reset successfully' });
  } catch (error) {
    console.error('Error resetting password:', error);
    res.status(500).json({ success: false, message: 'Internal server error', error: error.message });
  }
});




userRouter.post("/verify-reset-link", async (req, res) => {
  const { oobCode } = req.body;

  try {
  
    const email = await verifyPasswordResetCode(auth, oobCode);
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    res.status(200).json({ success: true, userId: user._id });
  } catch (err) {
    console.error("Error verifying reset link:", err);
    res.status(400).json({ success: false, message: err.message });
  }
});

// User Login time
userRouter.post("/:userId/login", async (req, res) => {
  const { userId } = req.params;

  try {
    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: "User not found" });

    const today = new Date().toISOString().split("T")[0]; // e.g., "2024-11-25"
    const existingLog = user.loginLogoutLogs.find((log) => log.date === today);

    if (existingLog) {
      existingLog.loginTime = new Date(); // Update today's login time
    } else {
      user.loginLogoutLogs.push({
        date: today,
        loginTime: new Date(),
      });
    }

    await user.save();
    res.status(200).json({ message: "Login time recorded", logs: user.loginLogoutLogs });
  } catch (err) {
    res.status(500).json({ message: "Failed to record login time", error: err.message });
  }
});

// User Logout time
userRouter.post("/:userId/logout", async (req, res) => {
  const { userId } = req.params;

  try {
    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: "User not found" });

    const today = new Date().toISOString().split("T")[0]; // e.g., "2024-11-25"
    const existingLog = user.loginLogoutLogs.find((log) => log.date === today);

    if (existingLog) {
      existingLog.logoutTime = new Date();
    } else {
      user.loginLogoutLogs.push({
        date: today,
        logoutTime: new Date(),
      });
    }

    await user.save();
    res.status(200).json({ message: "Logout time recorded", logs: user.loginLogoutLogs });
  } catch (err) {
    res.status(500).json({ message: "Failed to record logout time", error: err.message });
  }
});


//  Daily Logs
userRouter.get("/:userId/daily-login-logout", async (req, res) => {
  const { userId } = req.params;

  try {
    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: "User not found" });

    res.status(200).json({
      message: "Daily login/logout logs retrieved",
      logs: user.loginLogoutLogs,
    });
  } catch (err) {
    res.status(500).json({ message: "Failed to retrieve logs", error: err.message });
  }
});



module.exports = userRouter;

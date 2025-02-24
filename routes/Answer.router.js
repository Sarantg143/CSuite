const express = require('express');
const router = express.Router();
const UserTestResponse = require('../models/Answer.model');


router.post('/submit-test', async (req, res) => {
    try {
      const { userId, courseId, courseTitle, lessonTitle, answers } = req.body;
      let parsedAnswers = answers;
  
      if (typeof answers === 'string') {
        try {
          parsedAnswers = JSON.parse(answers);
        } catch (error) {
          return res.status(400).json({ message: 'Invalid answers format', error: error.message });
        }
      }
  
      if (!Array.isArray(parsedAnswers)) {
        return res.status(400).json({ message: 'Answers must be an array' });
      }
  
      let correctCount = parsedAnswers.reduce((count, ans) => 
        ans.selectedAnswer === ans.correctAnswer ? count + 1 : count, 0);
      
      let testRecord = await UserTestResponse.findOne({ userId, courseId });
  
      if (!testRecord) {
        testRecord = new UserTestResponse({
          userId,
          courseId,
          courseTitle,
          lessons: [{
            lessonTitle,
            answers: parsedAnswers,
            lessonTotalMarks: correctCount
          }]
        });
      } else {
        
        const existingLesson = testRecord.lessons.find(lesson => lesson.lessonTitle === lessonTitle);
        if (existingLesson) {
          return res.status(200).json({ message: 'Test for this lesson already submitted' }); 
        }
        testRecord.lessons.push({
          lessonTitle,
          answers: parsedAnswers,
          lessonTotalMarks: correctCount
        });
      }
  
      // Calculate total marks
      testRecord.courseTotalMarks = testRecord.lessons.reduce((sum, lesson) => sum + lesson.lessonTotalMarks, 0);
      await testRecord.save();
  
      res.status(201).json({ 
        message: 'Test submitted successfully', 
        lessonTotalMarks: correctCount, 
        courseTotalMarks: testRecord.courseTotalMarks 
      });
  
    } catch (error) { 
      res.status(500).json({ message: 'Error submitting test', error: error.message }); 
    }
  });
  
  

  router.get('/course-marks/:userId/:courseId', async (req, res) => {
    try {
      const { userId, courseId } = req.params;
  
      const testRecord = await UserTestResponse.findOne({ userId, courseId });
  
      if (!testRecord) {
        return res.status(404).json({ message: 'No test records found for this user in this course' });
      }
  
      res.status(200).json({ courseTotalMarks: testRecord.courseTotalMarks });
    } catch (error) {
      res.status(500).json({ message: 'Error fetching course total marks', error: error.message });
    }
  });
  

  router.get('/lesson-marks/:userId/:courseId', async (req, res) => {
    try {
        const { userId, courseId } = req.params;
        const testRecord = await UserTestResponse.findOne({ userId, courseId });

        if (!testRecord) {
            return res.status(404).json({ message: 'No test records found for this user in this course' });
        }

        const lessonMarks = testRecord.lessons.map(lesson => ({
            lessonTitle: lesson.lessonTitle,
            lessonMarks: lesson.lessonTotalMarks
        }));

        res.status(200).json(lessonMarks);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching lesson-wise marks', error: error.message });
    }
});

router.get('/:userId', async (req, res) => {
  try {
      const { userId } = req.params;
      const testRecords = await UserTestResponse.find({ userId });

      if (!testRecords.length) {
          return res.status(404).json({ message: 'No test records found for this user' });
      }

      const userTestData = testRecords.map(record => ({
          courseId: record.courseId,
          courseTitle: record.courseTitle,
          totalMarks: record.courseTotalMarks,
          lessons: record.lessons.map(lesson => ({
              lessonTitle: lesson.lessonTitle,
              lessonMarks: lesson.lessonTotalMarks,
              answers: lesson.answers 
          }))
      }));

      res.status(200).json(userTestData);
  } catch (error) {
      res.status(500).json({ message: 'Error fetching user test data', error: error.message });
  }
});


router.get('/', async (req, res) => {
  try {
      const testRecords = await UserTestResponse.find();
      res.status(200).json(testRecords);
  } catch (error) {
      res.status(500).json({ message: 'Error fetching test data', error: error.message });
  }
});


router.get('/user/:userId', async (req, res) => {
  try {
      const { userId } = req.params;
      const testRecords = await UserTestResponse.find({ userId });

      if (!testRecords.length) {
          return res.status(404).json({ message: 'No test records found for this user' });
      }

      res.status(200).json(testRecords);
  } catch (error) {
      res.status(500).json({ message: 'Error fetching user test data', error: error.message });
  }
});


// router.post('/submit-test', async (req, res) => { try { const { userId, courseId, courseTitle, lessonTitle, answers } = req.body;
//   let parsedAnswers = answers;
//   if (typeof answers === 'string') {
//       try {
//           parsedAnswers = JSON.parse(answers);
//       } catch (error) {
//           return res.status(400).json({ message: 'Invalid answers format', error: error.message });
//       }
//   }
//   if (!Array.isArray(parsedAnswers)) {
//       return res.status(400).json({ message: 'Answers must be an array' });
//   }

//   let correctCount = parsedAnswers.reduce((count, ans) => 
//       ans.selectedAnswer === ans.correctAnswer ? count + 1 : count, 0);
//   let testRecord = await UserTestResponse.findOne({ userId, courseId });

//   if (!testRecord) {

//       testRecord = new UserTestResponse({
//           userId,
//           courseId,
//           courseTitle,
//           lessons: [{
//               lessonTitle,
//               answers: parsedAnswers,
//               lessonTotalMarks: correctCount
//           }]
//       });
//   } else {
//       const existingLesson = testRecord.lessons.find(lesson => lesson.lessonTitle === lessonTitle);
//       if (existingLesson) {
//           return res.status(400).json({ message: 'Test for this lesson already submitted' });
//       }
//       testRecord.lessons.push({
//           lessonTitle,
//           answers: parsedAnswers,
//           lessonTotalMarks: correctCount
//       });
//   }
//   testRecord.courseTotalMarks = testRecord.lessons.reduce((sum, lesson) => sum + lesson.lessonTotalMarks, 0);
//   await testRecord.save();

//   res.status(201).json({ 
//       message: 'Test submitted successfully', 
//       lessonTotalMarks: correctCount, 
//       courseTotalMarks: testRecord.courseTotalMarks 
//   });

// } catch (error) { res.status(500).json({ message: 'Error submitting test', error: error.message }); } });

module.exports = router;

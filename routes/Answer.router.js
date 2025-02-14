const express = require('express');
const router = express.Router();
const UserTestResponse = require('../models/Answer.model');


router.post('/submit-test', async (req, res) => {
    try {
      const { userId, courseId, lessonId, lessonTitle, answers } = req.body;
  
      let correctCount = 0;
      answers.forEach(ans => {
        if (ans.selectedAnswer === ans.correctAnswer) {
          correctCount++;
        }
      });
  
      let testRecord = await UserTestResponse.findOne({ userId, courseId });
  
      if (!testRecord) {
        testRecord = new UserTestResponse({
          userId,
          courseId,
          lessons: [{
            lessonId,
            lessonTitle,
            answers,
            lessonTotalMarks: correctCount
          }]
        });
      } else {
        const existingLessonIndex = testRecord.lessons.findIndex(lesson => lesson.lessonId.toString() === lessonId);
  
        if (existingLessonIndex !== -1) {
          return res.status(400).json({ message: 'Test for this lesson already submitted' });
        }
  
        testRecord.lessons.push({
          lessonId,
          lessonTitle,
          answers,
          lessonTotalMarks: correctCount
        });
      }
  
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
        lessonId: lesson.lessonId,
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
      const testRecords = await UserTestResponse.find({ userId }).populate('courseId', 'title');
  
      if (!testRecords.length) {
        return res.status(404).json({ message: 'No test records found for this user' });
      }
  
      const groupedResults = testRecords.map(record => ({
        courseId: record.courseId._id,
        courseTitle: record.courseId.title,
        totalMarks: record.courseTotalMarks,
        lessons: record.lessons.map(lesson => ({
          lessonId: lesson.lessonId,
          lessonTitle: lesson.lessonTitle,
          lessonMarks: lesson.lessonTotalMarks
        }))
      }));
  
      res.status(200).json(groupedResults);
    } catch (error) {
      res.status(500).json({ message: 'Error fetching user test data', error: error.message });
    }
  });
  

module.exports = router;

const express = require('express');
const testRouter = express.Router();

const Test = require('../models/Test.model'); 
const User = require('../models/User.model');  


testRouter.post('/', async (req, res) => {
  try {
    const { title, lessonId, courseId, isTestAvailable, timeLimit, questions } = req.body;

    const test = new Test({
      title,
      lessonId,
      courseId,
      isTestAvailable,
      timeLimit,
      questions
    });

    await test.save();
    res.status(201).json({ message: 'Test created successfully', test });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});


testRouter.get('/', async (req, res) => {
  try {
    const { courseId, lessonId } = req.query;
    const query = {};

    if (courseId) query.courseId = courseId;
    if (lessonId) query.lessonId = lessonId;

    const tests = await Test.find(query);
    res.status(200).json(tests);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});


testRouter.post('/submit', async (req, res) => {
  try {
    const { testId, userId, answers } = req.body;

    const test = await Test.findById(testId);
    if (!test) return res.status(404).json({ error: 'Test not found' });

    let score = 0;
    test.questions.forEach((question, index) => {
      if (answers[index] === question.correctAnswer) {
        score += 1;
      }
    });
    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ error: 'User not found' });

    if (!user.testScores) user.testScores = {};
    user.testScores[testId] = score;

    await user.save();

    res.status(200).json({ message: 'Test submitted successfully', score });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = testRouter;

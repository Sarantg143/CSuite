const express = require('express');
const router = express.Router();
const Question = require('../models/Question.model.js');


router.get('/', async (req, res) => {
  try {
    const questions = await Question.find();
    res.json(questions);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.get('/:id', async (req, res) => {
  const { id } = req.params;

  try {
    const questionDoc = await Question.findById(id);
    if (!questionDoc) {
      return res.status(404).json({ message: 'Document not found' });
    }
    res.status(200).json(questionDoc);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.post('/', async (req, res) => {
  try {
    const { description, difficulty, tags, time } = req.body;
    const question = new Question({
      description,
      difficulty,
      tags,
      time,
    });
    await question.save();
    res.status(201).json(question);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/:id/', async (req, res) => {
  try {
    const question = await Question.findById(req.params.id);
    if (!question) return res.status(404).json({ error: 'Question not found' });
    res.status(200).json(question);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.put('/:id/', async (req, res) => {
  try {
    const { description, difficulty, tags, time } = req.body;
    const question = await Question.findByIdAndUpdate(
      req.params.id,
      { description, difficulty, tags, time },
      { new: true } 
    );
    if (!question) return res.status(404).json({ error: 'Question not found' });
    res.status(200).json(question);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.delete('/:id/', async (req, res) => {
  try {
    const question = await Question.findByIdAndDelete(req.params.id);
    if (!question) return res.status(404).json({ error: 'Question not found' });
    res.status(200).json({ message: 'Question deleted successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

 //Add a new section to a specific question
router.post('/:id/sections', async (req, res) => {
  try {
    const { section, questions } = req.body;
    const question = await Question.findById(req.params.id);
    if (!question) return res.status(404).json({ error: 'Question not found' });

    question.sections.push({ section, questions });
    await question.save();
    res.status(201).json(question);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

//Get all sections of a specific question
router.get('/:id/sections', async (req, res) => {
  try {
    const question = await Question.findById(req.params.id);
    if (!question) return res.status(404).json({ error: 'Question not found' });

    res.status(200).json(question.sections);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

 //Update a specific section in a question
router.put('/:id/sections/:sectionNumber', async (req, res) => {
  try {
    const { section, questions } = req.body;
    const question = await Question.findById(req.params.id);
    if (!question) return res.status(404).json({ error: 'Question not found' });

    const sectionIndex = question.sections.findIndex(s => s.section === parseInt(req.params.sectionNumber));
    if (sectionIndex === -1) return res.status(404).json({ error: 'Section not found' });

    question.sections[sectionIndex] = { section, questions };
    await question.save();
    res.status(200).json(question);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

//  Delete a specific section from a question
router.delete('/:id/sections/:sectionNumber', async (req, res) => {
  try {
    const question = await Question.findById(req.params.id);
    if (!question) return res.status(404).json({ error: 'Question not found' });

    const sectionIndex = question.sections.findIndex(s => s.section === parseInt(req.params.sectionNumber));
    if (sectionIndex === -1) return res.status(404).json({ error: 'Section not found' });

    question.sections.splice(sectionIndex, 1);
    await question.save();
    res.status(200).json(question);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

//  Add a new question to a specific section
router.post('/:id/sections/:sectionNumber/questions', async (req, res) => {
  try {
    const { question, options, answer } = req.body;
    const q = await Question.findById(req.params.id);
    if (!q) return res.status(404).json({ error: 'Question not found' });

    const section = q.sections.find(s => s.section === parseInt(req.params.sectionNumber));
    if (!section) return res.status(404).json({ error: 'Section not found' });

    section.questions.push({ question, options, answer });
    await q.save();
    res.status(201).json(q);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get all questions within a specific section
router.get('/:id/sections/:sectionNumber/questions', async (req, res) => {
  try {
    const q = await Question.findById(req.params.id);
    if (!q) return res.status(404).json({ error: 'Question not found' });

    const section = q.sections.find(s => s.section === parseInt(req.params.sectionNumber));
    if (!section) return res.status(404).json({ error: 'Section not found' });

    res.status(200).json(section.questions);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});
//  Update a specific question within a section
router.put('/:id/sections/:sectionNumber/questions/:questionIndex', async (req, res) => {
  try {
    const { question, options, answer } = req.body;
    const q = await Question.findById(req.params.id);
    if (!q) return res.status(404).json({ error: 'Question not found' });

    const section = q.sections.find(s => s.section === parseInt(req.params.sectionNumber));
    if (!section) return res.status(404).json({ error: 'Section not found' });

    if (section.questions.length <= req.params.questionIndex)
      return res.status(404).json({ error: 'Question not found in section' });

    section.questions[req.params.questionIndex] = { question, options, answer };
    await q.save();
    res.status(200).json(q);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});
//Delete a specific question within a section
router.delete('/:id/sections/:sectionNumber/questions/:questionIndex', async (req, res) => {
  try {
    const q = await Question.findById(req.params.id);
    if (!q) return res.status(404).json({ error: 'Question not found' });

    const section = q.sections.find(s => s.section === parseInt(req.params.sectionNumber));
    if (!section) return res.status(404).json({ error: 'Section not found' });

    if (section.questions.length <= req.params.questionIndex)
      return res.status(404).json({ error: 'Question not found in section' });

    section.questions.splice(req.params.questionIndex, 1);
    await q.save();
    res.status(200).json(q);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});


module.exports = router;

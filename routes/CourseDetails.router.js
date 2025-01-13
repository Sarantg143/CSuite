const fs = require('fs');
const path = require('path');
const express = require('express');
const multer = require('multer');
const CourseDetail = require('../models/CourseDetails.model');
const User = require('../models/User.model');
const courseDetailsRouter = express.Router();

const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

const bufferToBase64 = (buffer) => {if (!buffer) return ''; 
  return buffer.toString('base64');
};

const parseJsonFields = (req, res, next) => {
  try {
    if (req.body.overviewPoints && typeof req.body.overviewPoints === 'string') {
      req.body.overviewPoints = JSON.parse(req.body.overviewPoints);
    }
    if (req.body.lessons && typeof req.body.lessons === 'string') {
      req.body.lessons = JSON.parse(req.body.lessons);
    }
    if (req.body.whoIsThisFor && typeof req.body.whoIsThisFor === 'string') {
      req.body.whoIsThisFor = JSON.parse(req.body.whoIsThisFor);
    }
    if (req.body.whatYouGet && typeof req.body.whatYouGet === 'string') {
      req.body.whatYouGet = JSON.parse(req.body.whatYouGet);
    }
    next();
  } catch (error) {
    res.status(400).json({ message: 'Invalid JSON in request body', error: error.message });
  }
};

courseDetailsRouter.post('/add', upload.single('image'), parseJsonFields, async (req, res) => {
  try {
    const {
      title,
      description,
      overviewPoints,
      lessons,
      header,
      videoUrl,
      whoIsThisFor,
      whatYouGet,
      syllabus,
      price
    } = req.body;
    const image = req.file ? bufferToBase64(req.file.buffer) : '';

    const newCourse = new CourseDetail({
      title,
      description,
      overviewPoints,
      image,
      lessons,
      header,
      videoUrl,
      whoIsThisFor,
      whatYouGet,
      syllabus,
      price: Number(price)
    });

    await newCourse.save();
    res.status(201).json({ message: 'Course created successfully', newCourse });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error creating course', error: error.message });
  }
});

courseDetailsRouter.get('/', async (req, res) => {
  try {
    const courses = await CourseDetail.find();
    courses.forEach(course => {
      if (course.image) {
        course.image = `data:image/jpeg;base64,${course.image}`;
      }
    });
    res.status(200).json(courses);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching courses', error: error.message });
  }
});


courseDetailsRouter.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const course = await CourseDetail.findById(id);
    if (!course) {
      return res.status(404).json({ message: 'Course not found' });
    }
    if (course.image) {
      course.image = `data:image/jpeg;base64,${course.image}`;
    }
    res.status(200).json(course);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching course', error: error.message });
  }
});


courseDetailsRouter.put('/edit/:id', upload.single('image'), async (req, res) => {
  try {
    const { id } = req.params;
    const {
      title,
      description,
      overviewPoints,
      lessons,
      header,
      videoUrl,
      whoIsThisFor,
      whatYouGet,
      syllabus,
      price
    } = req.body;

    const currentCourse = await CourseDetail.findById(id);
    if (!currentCourse) {
      return res.status(404).json({ message: 'Course not found' });
    }

    let image = currentCourse.image;
    if (req.file) {
      console.log('New image uploaded');
      image = bufferToBase64(req.file.buffer); 
    } else {
      console.log('No new image uploaded, keeping current image');
    }

    const parsedOverviewPoints = typeof overviewPoints === 'string' ? JSON.parse(overviewPoints) : overviewPoints || currentCourse.overviewPoints;
    const parsedLessons = typeof lessons === 'string' ? JSON.parse(lessons) : lessons || currentCourse.lessons;
    const parsedWhoIsThisFor = typeof whoIsThisFor === 'string' ? JSON.parse(whoIsThisFor) : whoIsThisFor || currentCourse.whoIsThisFor;
    const parsedWhatYouGet = typeof whatYouGet === 'string' ? JSON.parse(whatYouGet) : whatYouGet || currentCourse.whatYouGet;


    // const parsedOverviewPoints = overviewPoints ? JSON.parse(overviewPoints) : currentCourse.overviewPoints;
    // const parsedLessons = lessons ? JSON.parse(lessons) : currentCourse.lessons;
    // const parsedWhoIsThisFor = whoIsThisFor ? JSON.parse(whoIsThisFor) : currentCourse.whoIsThisFor;
    // const parsedWhatYouGet = whatYouGet ? JSON.parse(whatYouGet) : currentCourse.whatYouGet;

    const updatedCourse = await CourseDetail.findByIdAndUpdate(
      id,
      {
        title,
        description,
        overviewPoints: parsedOverviewPoints,
        lessons: parsedLessons,
        whoIsThisFor: parsedWhoIsThisFor,
        whatYouGet: parsedWhatYouGet,
        image,
        header,
        videoUrl,
        syllabus,
        price: Number(price)
      },
      { new: true } 
    );

    if (!updatedCourse) {
      return res.status(404).json({ message: 'Course not found' });
    }

    res.status(200).json({ message: 'Course updated successfully', updatedCourse });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error updating course', error: error.message });
  }
});



courseDetailsRouter.delete('/delete/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const deletedCourse = await CourseDetail.findByIdAndDelete(id);
    if (!deletedCourse) {
      return res.status(404).json({ message: 'Course not found' });
    }
    res.status(200).json({ message: 'Course deleted successfully', deletedCourse });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error deleting course', error: error.message });
  }
});


courseDetailsRouter.put('/:courseId/:lessonIndex/test', async (req, res) => {
  const { courseId, lessonIndex } = req.params;
  const { test } = req.body;

  try {
    const course = await CourseDetail.findById(courseId);

    if (!course) {
      return res.status(404).json({ message: 'Course not found' });
    }

    const lesson = course.lessons[lessonIndex];
    if (!lesson) {
      return res.status(404).json({ message: 'Lesson not found' });
    }
    lesson.test = test || null;

    await course.save();

    res.status(200).json({ message: 'Test added/updated successfully', course });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal server error', error: error.message });
  }
});

courseDetailsRouter.get('/:courseId/:lessonIndex/test', async (req, res) => {
  const { courseId, lessonIndex } = req.params;

  try {
    const course = await CourseDetail.findById(courseId);

    if (!course) {
      return res.status(404).json({ message: 'Course not found' });
    }

    const lesson = course.lessons[lessonIndex];
    if (!lesson) {
      return res.status(404).json({ message: 'Lesson not found' });
    }

    res.status(200).json({ test: lesson.test || {} });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal server error', error: error.message });
  }
});

courseDetailsRouter.delete('/:courseId/:lessonIndex/test', async (req, res) => {
  const { courseId, lessonIndex } = req.params;

  try {
    const course = await CourseDetail.findById(courseId);

    if (!course) {
      return res.status(404).json({ message: 'Course not found' });
    }

    const lesson = course.lessons[lessonIndex];
    if (!lesson) {
      return res.status(404).json({ message: 'Lesson not found' });
    }
    lesson.test = null;

    await course.save();

    res.status(200).json({ message: 'Test deleted successfully', course });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal server error', error: error.message });
  }
});

courseDetailsRouter.post('/submitTest/:userId', async (req, res) => {
  const { userId } = req.params;
  const { courseId, lessonIdentifier, answers } = req.body;

  try {
   
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const course = await CourseDetail.findById(courseId);
    if (!course) {
      return res.status(404).json({ message: 'Course not found' });
    }

    let lesson;
    if (typeof lessonIdentifier === 'number') {
      lesson = course.lessons[lessonIdentifier];
    } else {
      lesson = course.lessons.find(lesson => lesson.title === lessonIdentifier);
    }

    if (!lesson) {
      return res.status(404).json({ message: 'Lesson not found' });
    }

    let score = 0;
    lesson.chapter.forEach((chapter, index) => {
      if (answers[index] && answers[index] === chapter.correctAnswer) {
        score += 1;
      }
    });

    const testScore = {
      courseName: course.title,
      lessonName: lesson.title,
      score: score
    };

    user.testScores.push(testScore);
    await user.save();

    res.status(200).json({ message: 'Test submitted successfully', testScore });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal server error', error: error.message });
  }
});


module.exports = courseDetailsRouter;

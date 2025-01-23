const express = require('express');
const Review = require('../models/Review.model');
const Course = require('../models/CourseRating.model');

const reviewRouter = express.Router();



const updateCourseRating = async (coursename) => {
  try {
    const reviews = await Review.find({ coursename });
    const totalReviews = reviews.length;
    const averageRating = totalReviews > 0
      ? reviews.reduce((sum, review) => sum + review.rating, 0) / totalReviews
      : 0;

    // Upsert (Update or Insert) the course rating entry
    await Course.findOneAndUpdate(
      { coursename },
      { averageRating, totalReviews },
      { upsert: true, new: true }
    );
  } catch (error) {
    console.error('Error updating course rating:', error.message);
  }
};


reviewRouter.post('/', async (req, res) => {
  try {
    const { username, coursename, rating, description } = req.body;

    const newReview = new Review({
      username,
      coursename,
      rating: Number(rating),
      description,
    });

    await newReview.save();
    await updateCourseRating(coursename); 
    res.status(201).json({ message: 'Review added successfully', newReview });
  } catch (error) {
    console.error('Error adding review:', error.message);
    res.status(500).json({ message: 'Error adding review', error: error.message });
  }
});


reviewRouter.get('/:coursename', async (req, res) => {
  try {
    const { coursename } = req.params;
    const reviews = await Review.find({ coursename });

    const course = await Course.findOne({ coursename: coursename });

    if (!course) {
      return res.status(404).json({ message: 'Course not found' });
    }

    res.status(200).json({
      course,
      reviews,
    });
  } catch (error) {
    console.error('Error fetching reviews for course:', error.message);
    res.status(500).json({ message: 'Error fetching reviews', error: error.message });
  }
});


reviewRouter.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const deletedReview = await Review.findByIdAndDelete(id);
    if (!deletedReview) {
      return res.status(404).json({ message: 'Review not found' });
    }
    await updateCourseRating(deletedReview.coursename); 
    res.status(200).json({ message: 'Review deleted successfully', deletedReview });
  } catch (error) {
    console.error('Error deleting review:', error.message);
    res.status(500).json({ message: 'Error deleting review', error: error.message });
  }
});


reviewRouter.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { username, coursename, rating, description } = req.body;

    const updatedReview = await Review.findByIdAndUpdate(
      id,
      { username, coursename, rating: Number(rating), description },
      { new: true }
    );

    if (!updatedReview) {
      return res.status(404).json({ message: 'Review not found' });
    }

    await updateCourseRating(coursename); 
    res.status(200).json({ message: 'Review updated successfully', updatedReview });
  } catch (error) {
    console.error('Error updating review:', error.message);
    res.status(500).json({ message: 'Error updating review', error: error.message });
  }
});

// reviewRouter.post('/', async (req, res) => {
//   try {
//     const { username, coursename, rating, description } = req.body;

//     const newReview = new Review({
//       username,
//       coursename,
//       rating: Number(rating),
//       description,
//     });

//     await newReview.save();
//     res.status(201).json({ message: 'Review added successfully', newReview });
//   } catch (error) {
//     console.error('Error adding review:', error.message);
//     res.status(500).json({ message: 'Error adding review', error: error.message });
//   }
// });


reviewRouter.get('/', async (req, res) => {
  try {
    const reviews = await Review.find();
    res.status(200).json(reviews);
  } catch (error) {
    console.error('Error fetching reviews:', error.message);
    res.status(500).json({ message: 'Error fetching reviews', error: error.message });
  }
});


reviewRouter.get('/:coursename/rating', async (req, res) => {
  try {
    const { coursename } = req.params;
    const reviews = await Review.find({ coursename });
    res.status(200).json(reviews);
  } catch (error) {
    console.error('Error fetching reviews for course:', error.message);
    res.status(500).json({ message: 'Error fetching reviews', error: error.message });
  }
});


// reviewRouter.delete('/:id', async (req, res) => {
//   try {
//     const { id } = req.params;
//     const deletedReview = await Review.findByIdAndDelete(id);
//     if (!deletedReview) {
//       return res.status(404).json({ message: 'Review not found' });
//     }
//     res.status(200).json({ message: 'Review deleted successfully', deletedReview });
//   } catch (error) {
//     console.error('Error deleting review:', error.message);
//     res.status(500).json({ message: 'Error deleting review', error: error.message });
//   }
// });


// reviewRouter.put('/:id', async (req, res) => {
//   try {
//     const { id } = req.params;
//     const { username, coursename, rating, description } = req.body;

//     const updatedReview = await Review.findByIdAndUpdate(
//       id,
//       { username, coursename, rating: Number(rating), description },
//       { new: true }
//     );

//     if (!updatedReview) {
//       return res.status(404).json({ message: 'Review not found' });
//     }

//     res.status(200).json({ message: 'Review updated successfully', updatedReview });
//   } catch (error) {
//     console.error('Error updating review:', error.message);
//     res.status(500).json({ message: 'Error updating review', error: error.message });
//   }
// });

module.exports = reviewRouter;

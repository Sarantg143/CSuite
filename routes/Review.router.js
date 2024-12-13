const express = require('express');
const Review = require('../models/Review.model');

const reviewRouter = express.Router();


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
    res.status(201).json({ message: 'Review added successfully', newReview });
  } catch (error) {
    console.error('Error adding review:', error.message);
    res.status(500).json({ message: 'Error adding review', error: error.message });
  }
});


reviewRouter.get('/', async (req, res) => {
  try {
    const reviews = await Review.find();
    res.status(200).json(reviews);
  } catch (error) {
    console.error('Error fetching reviews:', error.message);
    res.status(500).json({ message: 'Error fetching reviews', error: error.message });
  }
});


reviewRouter.get('/:coursename', async (req, res) => {
  try {
    const { coursename } = req.params;
    const reviews = await Review.find({ coursename });
    res.status(200).json(reviews);
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

    res.status(200).json({ message: 'Review updated successfully', updatedReview });
  } catch (error) {
    console.error('Error updating review:', error.message);
    res.status(500).json({ message: 'Error updating review', error: error.message });
  }
});

module.exports = reviewRouter;

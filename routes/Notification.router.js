const express = require('express');
const router = express.Router();
const Notification = require('../models/Notification.model');
const mongoose = require('mongoose');


router.get('/:userId', async (req, res) => {
  const { userId } = req.params;
  try {
    const notifications = await Notification.find().sort({ createdAt: -1 });
    const response = notifications.map(notification => ({
      ...notification.toObject(),
      isRead: notification.readBy.includes(userId) 
    }));
    res.json(response);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch notifications' });
  }
}); 


router.post('/', async (req, res) => {
  const { title, message } = req.body;
  try {
    const notification = new Notification({ title, message });
    await notification.save();
    res.status(201).json(notification);
  } catch (err) {
    res.status(500).json({ error: 'Failed to create notification' });
  }
});


router.put('/no/:userId/:notificationId', async (req, res) => {
  const {  userId,notificationId } = req.params;
  try {
    const notification = await Notification.findByIdAndUpdate(
      notificationId,
      { $addToSet: { readBy: userId } }, 
      { new: true }
    );
    res.json(notification);
  } catch (err) {
    res.status(500).json({ error: 'Failed to mark notification as read' });
  }
});


router.put('/:userId/:notificationId', async (req, res) => {
    const {  userId,notificationId } = req.params;
  
    try {
      const notification = await Notification.findById(notificationId);
      if (!notification) {
        return res.status(404).json({ error: 'Notification not found' });
      }
  
      const userObjectId = new mongoose.Types.ObjectId(userId);
  
      if (!notification.readBy.some((id) => id.equals(userObjectId))) {
        notification.readBy.push(userObjectId); 
      }
  
      await notification.save();
      res.status(200).json({ message: 'Notification marked as read', notification });
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: 'Failed to mark notification as read' });
    }
  });

router.delete('/:notificationId', async (req, res) => {
    try {
      await Notification.findByIdAndDelete(req.params.notificationId);
      res.json({ message: 'Notification deleted successfully' });
    } catch (err) {
      res.status(500).json({ error: 'Failed to delete notification' });
    }
  });
  
module.exports = router;

const express = require("express");
const Appointment = require("../models/Appointment.model");
const User = require("../models/User.model");
const router = express.Router();

// User requests an appointment 
// router.post("/request", async (req, res) => {
//   try {
//     const { userId, requestMessage, requestedDate } = req.body;
//     const appointment = new Appointment({ userId, requestMessage, requestedDate, status: "pending" });
//     await appointment.save();
//     res.status(201).json({ message: "Appointment request sent", appointment });
//   } catch (err) {
//     res.status(500).json({ error: err.message });
//   }
// });

router.post("/request", async (req, res) => {
  try {
    const { userId, username, requestMessage, requestedDate } = req.body;
  //  const user = await User.findById(userId);
  //  if (!user) {
  //    return res.status(404).json({ error: "User not found" });
 //   }
 //   if (user.username !== username) {
  //    return res.status(400).json({ error: "Username does not match user ID" });
//    }
    const newAppointment = new Appointment({
      userId,
      username,
      status: "pending",
      requestMessage,
      requestedDate
    });

    await newAppointment.save();
    res.status(201).json({ message: "Appointment request sent", appointment: newAppointment });
  } catch (error) {
    res.status(500).json({ error: "Server error" });
  }
});

// Admin confirms the appointment 
router.put("/confirm/:id", async (req, res) => {
  try {
    const { date, time, meetLink } = req.body;
    const appointment = await Appointment.findByIdAndUpdate(
      req.params.id,
      { date, time, meetLink, status: "confirmed" },
      { new: true }
    );
    if (!appointment) return res.status(404).json({ message: "Appointment not found" });
    res.json({ message: "Appointment confirmed", appointment });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Admin schedules an appointment directly
router.post("/schedule", async (req, res) => {
  try {
    const { userId, date, time, meetLink, purpose } = req.body;
    const appointment = new Appointment({ userId, date, time, meetLink, purpose, status: "confirmed" });
    await appointment.save();
    res.status(201).json({ message: "Appointment scheduled", appointment });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get("/", async (req, res) => {
  try {
    const appointments = await Appointment.find();
    res.json(appointments);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get("/:userId", async (req, res) => {
  try {
    const appointments = await Appointment.find({ userId: req.params.userId });
    res.json(appointments);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.delete("/:id", async (req, res) => {
    try {
      const appointment = await Appointment.findByIdAndDelete(req.params.id);
  
      if (!appointment) {
        return res.status(404).json({ error: "Appointment not found" });
      }
  
      res.json({ message: "Appointment deleted successfully", appointment });
    } catch (error) {
      res.status(500).json({ error: "Server error" });
    }
  });

module.exports = router;

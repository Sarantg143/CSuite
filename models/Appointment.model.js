const mongoose = require("mongoose");

const appointmentSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, required: true, ref: "User" },
  status: { type: String, enum: ["pending", "confirmed"], default: "pending" },

  requestMessage: { type: String, required: function () { return this.status === "pending"; } },
  requestedDate: { type: String, required: function () { return this.status === "pending"; } },

  date: { type: String },
  time: { type: String },
  meetLink: { type: String },
  purpose: { type: String }
}, { timestamps: true });

module.exports = mongoose.model("Appointment", appointmentSchema);

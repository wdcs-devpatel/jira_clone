const mongoose = require("mongoose");

const timeLogSchema = new mongoose.Schema({

  taskId: {
    type: String,
    required: true
  },

  user: {
    type: String,
    required: true
  },

  timeSpent: {
    type: String,
    required: true
  },

  dateStarted: {
    type: Date,
    required: true
  },

  description: {
    type: String
  }

}, { timestamps: true });

module.exports = mongoose.model("TimeLog", timeLogSchema);
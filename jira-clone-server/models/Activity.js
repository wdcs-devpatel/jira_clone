const mongoose = require("mongoose");

const activitySchema = new mongoose.Schema({
  taskId: {
    type: String, // Postgres Task ID
    required: true
  },

  user: {
    type: String,
    required: true
  },

  action: {
    type: String,
    required: true
  },

  details: {
    type: String
  }

}, { timestamps: true });

module.exports = mongoose.model("Activity", activitySchema);
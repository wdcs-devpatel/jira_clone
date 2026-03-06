const mongoose = require("mongoose");

/**
 * Backlog Schema
 * Defines the structure for items in the project backlog.
 * Timestamps are enabled to automatically track 'createdAt' and 'updatedAt'.
 */
const backlogSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true
    },

    projectId: {
      type: Number,
      required: true
    },

    createdBy: {
      type: Number,
      required: true
    },

    priority: {
      type: String,
      enum: ["critical", "high", "medium", "low"],
      default: "medium"
    },

    status: {
      type: String,
      enum: ["todo", "in-progress", "done"],
      default: "todo"
    }
  },
  { 
    timestamps: true 
  }
);

module.exports = mongoose.model("Backlog", backlogSchema);
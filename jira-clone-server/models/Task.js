const mongoose = require("mongoose");

const commentSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    text: {
      type: String,
      required: true,
    },
  },
  { timestamps: true }
);

const activitySchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    action: String, // "STATUS_CHANGED", "PRIORITY_CHANGED", etc.
    field: String,  // which field changed
    oldValue: String,
    newValue: String,
  },
  { timestamps: true }
);

const taskSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    description: String,

    project: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Project",
    },

    assignee: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },

    // 🔥 STATUS WORKFLOW
    status: {
      type: String,
      enum: ["Backlog", "In Progress", "In Review", "Done"],
      default: "Backlog",
    },

    // 🔥 PRIORITY
    priority: {
      type: String,
      enum: ["Highest", "High", "Medium", "Low"],
      default: "Medium",
    },

    // 🔥 COMMENTS
    comments: [commentSchema],

    // 🔥 ACTIVITY LOG
    activityLogs: [activitySchema],

    // 🔥 FILE ATTACHMENTS
    attachments: [
      {
        filename: String,
        fileUrl: String,
        uploadedBy: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "User",
        },
      },
    ],
  },
  { timestamps: true }
);

module.exports = mongoose.model("Task", taskSchema);
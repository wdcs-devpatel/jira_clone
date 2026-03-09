const mongoose = require("mongoose");

const viewerUserSchema = new mongoose.Schema({
  userId: Number,
  role: {
    type: String,
    default: "Viewer"
  }
});

module.exports = mongoose.model("ViewerUser", viewerUserSchema);
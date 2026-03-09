const mongoose = require("mongoose");

const viewerRoleSchema = new mongoose.Schema({
  name: {
    type: String,
    default: "Viewer"
  },
  permissions: {
    type: [String],
    default: ["view_dashboard", "view_task"]
  }
});

module.exports = mongoose.model("ViewerRole", viewerRoleSchema);
const express = require("express");
const router = express.Router();

const {
  createActivity,
  getTaskActivity
} = require("../controllers/activityController");

router.post("/", createActivity);

router.get("/:taskId", getTaskActivity);

module.exports = router;
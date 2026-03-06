const express = require("express");
const router = express.Router();

const {
  createTimeLog,
  getTimeLogs
} = require("../controllers/timeLogController");

router.post("/", createTimeLog);

router.get("/:taskId", getTimeLogs);

module.exports = router;
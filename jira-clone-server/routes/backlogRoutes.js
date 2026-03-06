const express = require("express");
const router = express.Router();

const {
  createBacklog,
  getBacklogs,
  updateBacklog,
  deleteBacklog,
} = require("../controllers/backlogController");

/* ===============================
   BACKLOG ROUTES
   =============================== */

router.post("/", createBacklog);

router.get("/", getBacklogs);

router.put("/:id", updateBacklog);

router.delete("/:id", deleteBacklog);

module.exports = router;
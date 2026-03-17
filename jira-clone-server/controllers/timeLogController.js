const publishTimeLog = require("../rabbitmq/timeProducer");
const TimeLog = require("../models/TimeLog");

/* CREATE TIME LOG (via RabbitMQ) */
exports.createTimeLog = async (req, res) => {
  try {
    const { taskId, user, timeSpent, dateStarted, description } = req.body;

    // Queue the message to RabbitMQ instead of saving directly to DB here
    await publishTimeLog({
      taskId,
      user,
      timeSpent,
      dateStarted,
      description
    });

    res.status(201).json({
      message: "TimeLog queued successfully"
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

/* GET TIME LOGS */
exports.getTimeLogs = async (req, res) => {
  try {
    const logs = await TimeLog.find({
      taskId: req.params.taskId
    }).sort({ createdAt: -1 });

    res.json(logs);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
const TimeLog = require("../models/TimeLog");
const { getChannel } = require("./connection");

const QUEUE = "timeLogQueue";

const startTimeLogConsumer = async () => {

  const channel = getChannel();

  await channel.assertQueue(QUEUE);

  channel.consume(QUEUE, async (msg) => {

    const data = JSON.parse(msg.content.toString());

    try {

      await TimeLog.create(data);

      console.log("TimeLog Saved");

      channel.ack(msg);

    } catch (error) {

      console.error("TimeLog Consumer Error:", error);

    }

  });

};

module.exports = startTimeLogConsumer;
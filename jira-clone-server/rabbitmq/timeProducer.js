const { getChannel } = require("./connection");

const QUEUE = "timeLogQueue";

const publishTimeLog = async (data) => {
  const channel = getChannel();

  await channel.assertQueue(QUEUE);

  channel.sendToQueue(
    QUEUE,
    Buffer.from(JSON.stringify(data))
  );
};

module.exports = publishTimeLog;
const { getChannel } = require("./connection");

const QUEUE = "activityQueue";

const publishActivity = async (data) => {
  const channel = getChannel();

  await channel.assertQueue(QUEUE);

  channel.sendToQueue(
    QUEUE,
    Buffer.from(JSON.stringify(data))
  );
};

module.exports = publishActivity;
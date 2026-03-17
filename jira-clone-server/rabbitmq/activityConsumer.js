const Activity = require("../models/Activity");
const { getChannel } = require("./connection");

const QUEUE = "activityQueue";

const startActivityConsumer = async () => {

  const channel = getChannel();

  await channel.assertQueue(QUEUE);

  channel.consume(QUEUE, async (msg) => {

    const data = JSON.parse(msg.content.toString());

    try {

      await Activity.create(data);
        
      console.log("Activity Saved");

      channel.ack(msg);

    } catch (error) {

      console.error("Activity Consumer Error:", error);

    }

  });

};

module.exports = startActivityConsumer;
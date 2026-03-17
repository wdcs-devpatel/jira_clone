const amqp = require("amqplib");

let channel;

const connectRabbitMQ = async () => {
  try {
    const connection = await amqp.connect("amqp://localhost");
    channel = await connection.createChannel();

    console.log("RabbitMQ Connected");

    return channel;
  } catch (error) {
    console.error("RabbitMQ Connection Error:", error);
  }
};

const getChannel = () => channel;

module.exports = { connectRabbitMQ, getChannel };   
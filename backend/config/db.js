const { Sequelize } = require("sequelize");

const sequelize = new Sequelize(
  "jira_clone",      // database name
  "postgres",        // username
  "1234",    // password
  {
    host: "localhost",
    dialect: "postgres",
  }
);

const connectDB = async () => {
  try {
    await sequelize.authenticate();
    console.log("PostgreSQL Connected");
  } catch (error) {
    console.error("Unable to connect:", error);
  }
};

module.exports = { sequelize, connectDB };

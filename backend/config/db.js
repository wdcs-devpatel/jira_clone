const { Sequelize } = require("sequelize");
const { DB } = require("./env.config");

const sequelize = new Sequelize(
  DB.name,
  DB.user,
  DB.pass,
  {
    host: DB.host,
    dialect: DB.dialect,
    logging: false
  }
);

const connectDB = async () => {
  try {
    await sequelize.authenticate();
    console.log("PostgreSQL Connected");
  } catch (error) {
    console.error("DB Connection Failed:", error.message);
    process.exit(1);
  }
};

module.exports = { sequelize, connectDB };

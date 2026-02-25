require("dotenv").config();
const { Sequelize } = require("sequelize");

/* ===============================
   VALIDATE ENV VARIABLES
=============================== */
const required = [
  "PORT",
  "DB_NAME",
  "DB_USER",
  "DB_PASS",
  "DB_HOST",
  "DB_DIALECT",
  "JWT_SECRET"
];

required.forEach(key => {
  if (!process.env[key]) {
    console.error(`Missing ENV variable: ${key}`);
    process.exit(1);
  }
});

/* ===============================
   CONFIG OBJECT
=============================== */
const CONFIG = {
  PORT: process.env.PORT,
  DB: {
    name: process.env.DB_NAME,
    user: process.env.DB_USER,
    pass: process.env.DB_PASS,
    host: process.env.DB_HOST,
    dialect: process.env.DB_DIALECT,
  },
  JWT_SECRET: process.env.JWT_SECRET,
  JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN || "1h"
};

/* ===============================
   SEQUELIZE INSTANCE
=============================== */
const sequelize = new Sequelize(
  CONFIG.DB.name,
  CONFIG.DB.user,
  CONFIG.DB.pass,
  {
    host: CONFIG.DB.host,
    dialect: CONFIG.DB.dialect,
    logging: false,
    define: {
      // ❌ REMOVED: underscored: true
      // ✅ FIX: Set underscored to false to match 'createdAt' and 'updatedAt' in pgAdmin
      underscored: false, 
      timestamps: true,   
      freezeTableName: true 
    }
  }
);

/* ===============================
   DB CONNECT FUNCTION
=============================== */
const connectDB = async () => {
  try {
    await sequelize.authenticate();
    console.log("PostgreSQL Connected");
  } catch (error) { 
    console.error("DB Connection Failed:", error.message);
    process.exit(1);
  }
};

module.exports = {
  sequelize,
  connectDB,
  CONFIG
};
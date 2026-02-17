require("dotenv").config();

const required = [
  "PORT",
  "DB_NAME",
  "DB_USER",
  "DB_PASS",
  "DB_HOST",
  "DB_DIALECT"
];

required.forEach(key => {
  if (!process.env[key]) {
    throw new Error(`Missing environment variable: ${key}`);
  }
});

module.exports = {
  PORT: process.env.PORT,
  DB: {
    name: process.env.DB_NAME,
    user: process.env.DB_USER,
    pass: process.env.DB_PASS,
    host: process.env.DB_HOST,
    dialect: process.env.DB_DIALECT,
  },
  JWT_SECRET: process.env.JWT_SECRET
};

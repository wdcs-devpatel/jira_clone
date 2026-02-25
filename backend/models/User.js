const { DataTypes } = require("sequelize");
const { sequelize } = require("../config/db");

const User = sequelize.define(
  "User",
  {
    id: { 
      type: DataTypes.INTEGER, 
      autoIncrement: true, 
      primaryKey: true 
    },
    username: { 
      type: DataTypes.STRING, 
      allowNull: false, 
      unique: true 
    },
    email: { 
      type: DataTypes.STRING, 
      allowNull: false, 
      unique: true 
    },
    password: { 
      type: DataTypes.STRING, 
      allowNull: false 
    },
    // 🔥 Explicitly matching your pgAdmin 'firstName' column
    firstName: { 
      type: DataTypes.STRING, 
      field: 'firstName' 
    },
    // 🔥 Explicitly matching your psql 'lastName' column
    lastName: { 
      type: DataTypes.STRING, 
      field: 'lastName' 
    },
    phone: { 
      type: DataTypes.STRING 
    },
    // 🔥 Matching your psql 'role_id' column
    role_id: { 
      type: DataTypes.INTEGER, 
      allowNull: false 
    },
    // 🔥 Matching your psql 'refreshToken' column
    refreshToken: { 
      type: DataTypes.TEXT, 
      field: 'refreshToken' 
    },
  },
  { 
    tableName: 'Users', // ⚠️ CRITICAL: Must be capitalized to match pgAdmin
    timestamps: true    // Matches createdAt and updatedAt columns
  }
);

module.exports = User;
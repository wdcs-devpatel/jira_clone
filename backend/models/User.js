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

    firstName: { 
      type: DataTypes.STRING, 
      field: "firstName"
    },

    lastName: { 
      type: DataTypes.STRING, 
      field: "lastName"
    },

    phone: { 
      type: DataTypes.STRING 
    },

    role_id: { 
      type: DataTypes.INTEGER, 
      allowNull: false 
    },

    refreshToken: { 
      type: DataTypes.TEXT, 
      field: "refreshToken"
    },

    isActive: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
      allowNull: false
    }
  },
  { 
    tableName: "Users",
    timestamps: true
  }
);

module.exports = User;
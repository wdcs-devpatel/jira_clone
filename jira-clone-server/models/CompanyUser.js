const mongoose = require("mongoose");

const companyUserSchema = new mongoose.Schema(
{
  userId: {
    type: Number,
    required: true,
    unique: true
  },
  company: {
    type: String,
    required: true
  }
},
{ timestamps: true }
);

module.exports = mongoose.model("CompanyUser", companyUserSchema);
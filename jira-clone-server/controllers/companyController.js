const Company = require("../models/Company");
const CompanyUser = require("../models/CompanyUser");

/**
 * GET ALL COMPANIES
 * Returns the list of organizations (e.g., WebClues, CodeZeros)
 */
exports.getCompanies = async (req, res) => {
  try {
    const companies = await Company.find().select("name");
    res.json(companies);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

/**
 * UPDATE USER COMPANY
 * Upserts a mapping between a Postgres User ID and a MongoDB Company name.
 */
exports.updateUserCompany = async (req, res) => {
  try {
    const { userId } = req.params;
    const { company } = req.body;

    const updated = await CompanyUser.findOneAndUpdate(
      { userId },
      { company },
      { upsert: true, new: true }
    );

    res.json(updated);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

/**
 * GET ALL USER COMPANY MAPPINGS
 * ✅ New function to resolve 404 and provide data for the merged Admin table.
 */
exports.getUserCompanies = async (req, res) => {
  try {
    const mappings = await CompanyUser.find();
    res.json(mappings);
  } catch (err) {
    console.error("Fetch mappings error:", err);
    res.status(500).json({ error: err.message });
  }
};
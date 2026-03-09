const express = require("express");
const router = express.Router();
const companyController = require("../controllers/companyController");

/**
 * 🏢 COMPANY & ORGANIZATION ROUTES
 * Mounted at: /api/companies
 */

// 1. Get List of all Companies (e.g., for dropdowns)
router.get("/", companyController.getCompanies);

// 2. Fetch all User-Company-Role mappings
router.get("/users", companyController.getUserCompanies);

// 3. Upsert a User's Company and Role mapping
router.put("/user/:userId", companyController.updateUserCompany);

/**
 * 👁 VIEWER ROLE DEFINITION
 * Endpoint: GET /api/companies/roles/viewer
 * Used by AdminPage to display locked capabilities for the Viewer role.
 */
router.get("/roles/viewer", (req, res) => {
  res.json({
    id: "viewer",
    name: "Viewer",
    Permissions: [
      { id: "view_dashboard", name: "view_dashboard" }
    ]
  });
});

module.exports = router;
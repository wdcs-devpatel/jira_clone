const express = require("express");
const router = express.Router();
const companyController = require("../controllers/companyController");

/*
Because server.js already mounts this router on:
app.use("/api/companies", companyRoutes);

So routes here must start with "/"
*/

router.get("/", companyController.getCompanies);

router.put("/user/:userId", companyController.updateUserCompany);

router.get("/users", companyController.getUserCompanies);

module.exports = router;
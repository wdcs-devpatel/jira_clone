const router = require("express").Router();
const auth = require("../middleware/auth");
const requireRole = require("../middleware/requireRole");
const { Permission } = require("../models");

/* =====================================================
   GET ALL PERMISSIONS (Admin Only)
===================================================== */

router.get(
  "/",
  auth,
  requireRole("Admin"),
  async (req, res, next) => {
    try {
      const permissions = await Permission.findAll({
        attributes: ["id", "name"]
      });

      res.json(permissions);
    } catch (err) {
      next(err);
    }
  }
);

module.exports = router;
const router = require("express").Router();

const auth = require("../middleware/auth");
const requirePermission = require("../middleware/requirePermission");
const { Permission } = require("../models");

/* =====================================================
   GET ALL PERMISSIONS
   Requires: view_admin_panel
===================================================== */

router.get(
  "/",
  auth,
  requirePermission("view_admin_panel"),
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
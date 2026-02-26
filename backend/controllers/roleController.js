const { Role, Permission } = require("../models");

exports.getRoles = async (req, res, next) => {
  try {
    const roles = await Role.findAll({
      include: {
        model: Permission,
        through: { attributes: [] }
      }
    });
    res.json(roles);
  } catch (err) { next(err); }
};

exports.updateRolePermissions = async (req, res, next) => {
  try {
    const { roleId } = req.params;
    const { permissionIds } = req.body;

    const role = await Role.findByPk(roleId);

    if (!role) {
      return res.status(404).json({ message: "Role not found" });
    }

    // 🔥 PROTECT ADMIN ROLE
    if (role.name === "Admin") {
      return res.status(403).json({
        message: "Admin role permissions cannot be modified"
      });
    }

    await role.setPermissions(permissionIds);

    res.json({ message: "Permissions updated successfully" });

  } catch (err) {
    next(err);
  }
};
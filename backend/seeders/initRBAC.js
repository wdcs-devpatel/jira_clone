const { Role, Permission } = require("../models");

const initializeRBAC = async () => {
  try {
    const roles = ["Admin", "PM", "TL", "QA", "Dev"];
    for (const name of roles) {
      await Role.findOrCreate({ 
        where: { name }, 
        defaults: { name, is_system: name === "Admin" } 
      });
    }

    const perms = ["create_project", "create_task", "edit_task", "delete_task", "view_admin_panel"];
    for (const name of perms) {
      await Permission.findOrCreate({ where: { name } });
    }

    const adminRole = await Role.findOne({ where: { name: "Admin" } });
    const allPerms = await Permission.findAll();
    await adminRole.setPermissions(allPerms);

    console.log("✅ RBAC System Initialized");
  } catch (err) {
    console.error("❌ RBAC Error:", err);
  }
};

module.exports = initializeRBAC;
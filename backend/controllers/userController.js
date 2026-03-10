const { User, Role, Permission } = require("../models");

/* =====================================================
   GET ALL USERS (Admin Only)
   Used to populate the 'Active Personnel' list.
===================================================== */
exports.getUsers = async (req, res, next) => {
  try {
    const users = await User.findAll({
      include: {
        model: Role,
        attributes: ["id", "name"]
      },
      attributes: [
        "id",
        "username",
        "email",
        "firstName",
        "lastName",
        "phone",
        "isActive"
      ]
    });
    
    res.json(users);
  } catch (err) {
    console.error("Fetch Users Error:", err);
    next(err);
  }
};

/* =====================================================                             
   GET CURRENT AUTHENTICATED USER (WITH PERMISSIONS)
   🔥 CRITICAL: Always fetch fresh permissions
===================================================== */
exports.getCurrentUser = async (req, res, next) => {
  try {
    const user = await User.findByPk(req.user.id, {
        include: {
        model: Role,
        include: {
          model: Permission,
          through: { attributes: [] }
        }
      }
    });

    if (!user)
      return res.status(404).json({ message: "User not found" });

    const permissions =
      user.Role?.Permissions?.map(p => p.name) || [];

    res.json({
      id: user.id,
      username: user.username,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      phone: user.phone,
      Role: {
        id: user.Role?.id,
        name: user.Role?.name
      },
      permissions
    });

  } catch (err) {
    console.error("Get Current User Error:", err);
    next(err);
  }
};

/* =====================================================
   GET PROFILE (Authenticated User - Basic Info Only)
===================================================== */
exports.getProfile = async (req, res, next) => {
  try {
    const user = await User.findByPk(req.user.id, {
      include: {
        model: Role,
        attributes: ["id", "name"]
      },
      attributes: [
        "id",
        "username",
        "email",
        "firstName",
        "lastName",
        "phone"
      ]
    });

    if (!user)
      return res.status(404).json({ message: "User not found" });

    res.json(user);

  } catch (err) {
    console.error("Get Profile Error:", err);
    next(err);
  }
};

/* =====================================================
   UPDATE PROFILE (Authenticated User)
===================================================== */
exports.updateProfile = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { username, email, firstName, lastName, phone } = req.body;

    const user = await User.findByPk(userId);

    if (!user)
      return res.status(404).json({ message: "User not found" });

    await user.update({
      username: username ?? user.username,
      email: email ?? user.email,
      firstName: firstName ?? user.firstName,
      lastName: lastName ?? user.lastName,
      phone: phone ?? user.phone,
    });

    // 🔥 RETURN UPDATED USER
    const updatedUser = await User.findByPk(userId, {
      include: {
        model: Role,
        attributes: ["id", "name"]
      }
    });

    res.json(updatedUser);

  } catch (err) {
    console.error("Update Profile Error:", err);
    next(err);
  }
};

/* =====================================================
   UPDATE USER ROLE (Admin Only)
===================================================== */
exports.updateUserRole = async (req, res, next) => {
  try {
    const { userId } = req.params;
    const { roleId } = req.body;

    if (!userId || isNaN(userId) || !roleId || isNaN(roleId)) {
      return res.status(400).json({
        message: "Valid User ID and Role ID are required"
      });
    }

    const user = await User.findByPk(userId);
    if (!user)
      return res.status(404).json({ message: "User not found" });

    const role = await Role.findByPk(roleId);
    if (!role)
      return res.status(404).json({
        message: "Target Role does not exist"
      });

    user.role_id = roleId;
    await user.save();

    res.json({
      message: "User role updated successfully",
      updatedUser: user.username,
      newRole: role.name
    });

  } catch (err) {
    console.error("Role Update Error:", err);
    next(err);
  }
};

/* =====================================================
   ACTIVATE / DEACTIVATE USER (Admin Only)
===================================================== */
exports.toggleUserStatus = async (req, res, next) => {
  try {
    const { userId } = req.params;

    // Security: Prevent self-deactivation
    if (Number(userId) === Number(req.user.id)) {
      return res.status(400).json({ 
        message: "You cannot deactivate your own account" 
      });
    }

    const user = await User.findByPk(userId);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    user.isActive = !user.isActive;
    await user.save();

    res.json({
      message: `User ${user.isActive ? "activated" : "deactivated"} successfully`,
      isActive: user.isActive
    });

  } catch (err) {
    console.error("Toggle Status Error:", err);
    next(err);
  }
};

/* =====================================================
   DELETE USER (Admin Only)
===================================================== */
exports.deleteUser = async (req, res, next) => {
  try {
    const { userId } = req.params;

    // Security: Prevent self-deletion
    if (Number(userId) === Number(req.user.id)) {
      return res.status(400).json({
        message: "You cannot delete your own account"
      });
    }

    const user = await User.findByPk(userId);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    await user.destroy();

    res.json({ message: "User deleted successfully" });

  } catch (err) {
    console.error("Delete User Error:", err);
    next(err);
  }
};
const { User, Role, Permission } = require("./models");
const { connectDB } = require("./config/db");

const testGetUsers = async () => {
  try {
    await connectDB();
    const users = await User.findAll({
      include: {
        model: Role,
        attributes: ["id", "name"],
        include: {
          model: Permission,
          through: { attributes: [] }
        }
      }
    });

    console.log("--- Users and Permissions ---");
    users.forEach(u => {
      console.log(`User: ${u.username}, Role: ${u.Role?.name}`);
      const perms = u.Role?.Permissions?.map(p => p.name) || [];
      console.log(`  Permissions: ${perms.join(", ")}`);
    });
    console.log("------------------------------");
    process.exit(0);
  } catch (err) {
    console.error("Test Error:", err);
    process.exit(1);
  }
};

testGetUsers();

const messages = require("../messages/messages");
const fs = require("fs");

const path = require("path");

async function checkAccess(req, res, next) {
  try {
    const apisContent = fs.readFileSync(
      path.join(__dirname, "../config/acl.json")
    );
    const permissionsJson = JSON.parse(apisContent);

    const { role } = req.decoded;

    const method = req.method.toLowerCase(); // e.g., get, post
    let url = req.url.replace("/api/", "").split("/")[0].split("?")[0];

    // If the role exists in general.json
    const rolePermissions = permissionsJson[role?.toString()];

    if (rolePermissions) {
      const allowedApis = rolePermissions[method];

      if (allowedApis && allowedApis.includes(url)) {
        return next(); // Access granted
      } else {
        return res.status(403).json({
          success: false,
          ...messages.ACCESS_DENIED,
        });
      }
    }

    // If role not listed in the permissions file, deny access
    return res.status(403).json({
      success: false,
      ...messages.ACCESS_DENIED,
    });
  } catch (error) {
    console.error("Error in checkAccess middleware:", error);
    return res.status(500).json({
      success: false,
      ...messages.INTERNAL_SERVER_ERROR,
    });
  }
}

module.exports = checkAccess;

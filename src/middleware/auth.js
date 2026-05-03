const jwt = require("jsonwebtoken");

function requireAuth(req, res, next) {
  const token =
    req.cookies?.token ||
    (req.headers.authorization?.startsWith("Bearer ")
      ? req.headers.authorization.slice(7)
      : null);

  console.log("token", token);
  if (!token) return res.status(401).json({ message: "Not authenticated XDDDDDD" });

  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET);
    req.user = { id: payload.sub };
    next();
  } catch {
    return res.status(401).json({ message: "Invalid/expired token" });
  }
}

module.exports = { requireAuth };

const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const User = require("../models/User");

function signToken(userId) {
  return jwt.sign({ sub: userId }, process.env.JWT_SECRET, { expiresIn: "7d" });
}

exports.register = async (req, res) => {
  const { name, email, password } = req.body;
  if (!name || !email || !password) return res.status(400).json({ message: "Missing fields" });

  const exists = await User.findOne({ email });
  if (exists) return res.status(409).json({ message: "Email already in use" });

  const passwordHash = await bcrypt.hash(password, 10);
  const user = await User.create({ name, email, passwordHash });

  const token = signToken(user._id.toString());
  console.log(token)
  res
    .cookie("token", token, { httpOnly: true, sameSite: "lax" })
    .status(201)
    .json({ user: { id: user._id, name: user.name, email: user.email } });
};

exports.login = async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) return res.status(400).json({ message: "Missing fields" });

  const user = await User.findOne({ email });
  if (!user) return res.status(401).json({ message: "Invalid credentials" });

  const ok = await bcrypt.compare(password, user.passwordHash);
  if (!ok) return res.status(401).json({ message: "Invalid credentials" });

  const token = signToken(user._id.toString());
  res
    .cookie("token", token, { httpOnly: true, sameSite: "lax" })
    .json({ user: { id: user._id, name: user.name, email: user.email } });
};

exports.me = async (req, res) => {
  const user = await User.findById(req.user.id).select("_id name email");
  res.json({ user });
};

exports.logout = async (req, res) => {
  res.clearCookie("token").json({ ok: true });
};

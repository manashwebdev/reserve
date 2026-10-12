const router = require("express").Router();
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/User");
const { JWT_SECRET } = require("../config");
const { validateCredentials } = require("../lib/validate");

const sign = (u) => jwt.sign({ sub: u._id.toString() }, JWT_SECRET, { expiresIn: "7d" });

router.post("/register", async (req, res, next) => {
  try {
    const v = validateCredentials(req.body);
    if (v.error) return res.status(400).json({ error: v.error });
    if (await User.exists({ email: v.value.email })) return res.status(409).json({ error: "That email is already registered" });
    const user = await User.create({ email: v.value.email, passwordHash: await bcrypt.hash(v.value.password, 10) });
    res.status(201).json({ token: sign(user) });
  } catch (e) { next(e); }
});

router.post("/login", async (req, res, next) => {
  try {
    const v = validateCredentials(req.body);
    if (v.error) return res.status(400).json({ error: v.error });
    const user = await User.findOne({ email: v.value.email });
    const ok = user && (await bcrypt.compare(v.value.password, user.passwordHash));
    if (!ok) return res.status(401).json({ error: "Invalid email or password" });
    res.json({ token: sign(user) });
  } catch (e) { next(e); }
});

module.exports = router;

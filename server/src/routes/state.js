const router = require("express").Router();
const auth = require("../middleware/auth");
const User = require("../models/User");
const Day = require("../models/Day");
const { carry, total } = require("../lib/energy");
const { validateCurrent } = require("../lib/validate");

const LETTERS = ["S", "M", "T", "W", "T", "F", "S"];
const plain = (items) => items.map(({ n, d, p, t }) => ({ n, d, p: !!p, t }));

async function buildState(user) {
  const days = await Day.find({ user: user._id }).sort({ closedAt: -1 }).limit(30).lean();
  return {
    current: { start: user.current.start, items: plain(user.current.items) },
    hist: days.reverse().map((d) => ({ d: LETTERS[new Date(d.closedAt).getUTCDay()], end: d.end })),
  };
}

router.use(auth);

router.get("/", async (req, res, next) => {
  try {
    const user = await User.findById(req.userId);
    if (!user) return res.status(401).json({ error: "Invalid or expired token" });
    res.json(await buildState(user));
  } catch (e) { next(e); }
});

router.put("/current", async (req, res, next) => {
  try {
    const v = validateCurrent(req.body);
    if (v.error) return res.status(400).json({ error: v.error });
    await User.updateOne({ _id: req.userId }, { $set: { current: v.value } });
    res.json({ ok: true });
  } catch (e) { next(e); }
});

// Archive today and start tomorrow with the carried-over energy.
router.post("/close", async (req, res, next) => {
  try {
    const user = await User.findById(req.userId);
    if (!user) return res.status(401).json({ error: "Invalid or expired token" });
    const { start, items } = user.current;
    const end = total(start, items);
    await Day.create({ user: user._id, start, end, items: plain(items) });
    user.current = { start: carry(end), items: [] };
    await user.save();
    res.json(await buildState(user));
  } catch (e) { next(e); }
});

module.exports = router;

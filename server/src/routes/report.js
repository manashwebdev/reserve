const router = require("express").Router();
const auth = require("../middleware/auth");
const Day = require("../models/Day");
const { weeklyReport } = require("../lib/energy");

router.get("/weekly", auth, async (req, res, next) => {
  try {
    const days = await Day.find({ user: req.userId }).sort({ closedAt: -1 }).limit(7).lean();
    res.json(weeklyReport(days.reverse()));
  } catch (e) { next(e); }
});

module.exports = router;

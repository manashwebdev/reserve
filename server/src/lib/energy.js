// Pure energy-budget logic. No database, no Express: easy to test.
const LOW = 15;

/** Tomorrow's starting energy. An overdraft carries half its size forward, never below 40. */
const carry = (end) => (end < 0 ? Math.max(40, Math.round(100 + end * 0.5)) : 100);

const total = (start, items) => start + items.reduce((a, i) => a + i.d, 0);

/** Sum of energy per activity name, sorted by impact (biggest first). */
function aggregate(items, positive) {
  const m = {};
  for (const i of items) {
    if (positive ? i.d > 0 : i.d < 0) m[i.n] = (m[i.n] || 0) + i.d;
  }
  return Object.entries(m).sort((a, b) => (positive ? b[1] - a[1] : a[1] - b[1]));
}

/** Consecutive most-recent days that ended without an overdraft. */
function streak(days) {
  let s = 0;
  for (let i = days.length - 1; i >= 0 && days[i].end >= 0; i--) s++;
  return s;
}

/** days: closed days, oldest first. Each: { end, items: [{n, d}] } */
function weeklyReport(days) {
  if (!days.length) {
    return {
      lines: ["No closed days yet. Finish a day with \"Start a new day\" to build your first report."],
      tip: "Log what drains you for a few days and the patterns will show up here.",
      stats: null,
    };
  }
  const ends = days.map((d) => d.end);
  const avg = Math.round(ends.reduce((a, b) => a + b, 0) / ends.length);
  const over = ends.filter((e) => e < 0).length;
  const low = ends.filter((e) => e >= 0 && e < LOW).length;
  const all = days.flatMap((d) => d.items);
  const drain = aggregate(all, false);
  const rech = aggregate(all, true);
  const spent = -drain.reduce((a, [, v]) => a + v, 0);
  const gained = rech.reduce((a, [, v]) => a + v, 0);
  const ratio = gained > 0 ? +(spent / gained).toFixed(1) : null;

  const lines = [
    `You closed ${days.length} ${days.length === 1 ? "day" : "days"} with an average ending energy of ${avg}%.`,
    over
      ? `You overdrew on ${over} ${over === 1 ? "day" : "days"}.`
      : low
        ? `No overdrafts, but ${low} ${low === 1 ? "day" : "days"} ended in the red zone.`
        : "No overdrafts and no red-zone endings. Your budget is holding.",
  ];
  if (drain[0]) lines.push(`Biggest drain: ${drain[0][0]} (${drain[0][1]}% in total).`);
  if (rech[0]) lines.push(`Best recharge: ${rech[0][0]} (+${rech[0][1]}% in total).`);
  if (ratio !== null) lines.push(`You spend about ${ratio}% for every 1% you recover.`);

  let tip;
  if (over >= 2 && drain[0]) tip = `Put a recharge right after ${drain[0][0]} on your heavy days. That is where the overdrafts start.`;
  else if (ratio === null && spent > 0) tip = "You logged drains but no recharges. Add one nap, walk or proper meal a day.";
  else if (ratio !== null && ratio > 2) tip = "You spend more than twice what you recover. Cut one drain or add one recharge.";
  else if (avg < 30) tip = "You end most days nearly empty. Start the day with fewer commitments.";
  else tip = "Your budget is balanced. Protect the routine that got you here.";

  return { lines, tip, stats: { avg, over, low, ratio, streak: streak(days) } };
}

module.exports = { LOW, carry, total, aggregate, streak, weeklyReport };

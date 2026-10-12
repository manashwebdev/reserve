const test = require("node:test");
const assert = require("node:assert");
const { carry, total, streak, aggregate, weeklyReport } = require("../src/lib/energy");

test("carry: no debt resets to 100", () => {
  assert.strictEqual(carry(0), 100);
  assert.strictEqual(carry(55), 100);
});
test("carry: debt carries half, floored at 40", () => {
  assert.strictEqual(carry(-20), 90);
  assert.strictEqual(carry(-60), 70);
  assert.strictEqual(carry(-200), 40);
});
test("total adds item changes to the start", () => {
  assert.strictEqual(total(100, [{ d: -25 }, { d: 10 }]), 85);
});
test("streak counts trailing days without overdraft", () => {
  assert.strictEqual(streak([{ end: -5 }, { end: 10 }, { end: 0 }]), 2);
  assert.strictEqual(streak([{ end: 40 }, { end: -1 }]), 0);
});
test("aggregate ranks drains by size", () => {
  const r = aggregate([{ n: "Meeting", d: -15 }, { n: "Meeting", d: -15 }, { n: "Walk", d: -5 }], false);
  assert.deepStrictEqual(r[0], ["Meeting", -30]);
});
test("weeklyReport handles no data", () => {
  assert.strictEqual(weeklyReport([]).stats, null);
});
test("weeklyReport flags repeated overdrafts and names the top drain", () => {
  const days = [
    { end: -10, items: [{ n: "Deep work", d: -40 }] },
    { end: -5, items: [{ n: "Deep work", d: -35 }, { n: "Nap", d: 10 }] },
  ];
  const r = weeklyReport(days);
  assert.strictEqual(r.stats.over, 2);
  assert.match(r.tip, /Deep work/);
});

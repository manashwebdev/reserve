const test = require("node:test");
const assert = require("node:assert");
const { validateCurrent, validateCredentials } = require("../src/lib/validate");

test("accepts a valid day", () => {
  const r = validateCurrent({ start: 80, items: [{ n: " Walk ", d: 8, p: false, t: "09:10" }] });
  assert.strictEqual(r.value.items[0].n, "Walk");
});
test("rejects out-of-range start, zero change and long names", () => {
  assert.ok(validateCurrent({ start: 150, items: [] }).error);
  assert.ok(validateCurrent({ start: 50, items: [{ n: "x", d: 0 }] }).error);
  assert.ok(validateCurrent({ start: 50, items: [{ n: "x".repeat(41), d: 5 }] }).error);
});
test("normalises email and enforces password length", () => {
  assert.strictEqual(validateCredentials({ email: " A@B.co ", password: "longenough" }).value.email, "a@b.co");
  assert.ok(validateCredentials({ email: "a@b.co", password: "short" }).error);
  assert.ok(validateCredentials({ email: "nope", password: "longenough" }).error);
});

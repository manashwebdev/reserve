// Validates payloads coming from the client.
function validateCurrent(body) {
  if (!body || typeof body !== "object") return { error: "Body must be an object" };
  const { start, items } = body;
  if (!Number.isInteger(start) || start < 0 || start > 100) return { error: "start must be an integer from 0 to 100" };
  if (!Array.isArray(items) || items.length > 200) return { error: "items must be an array of at most 200 entries" };
  const clean = [];
  for (const it of items) {
    if (!it || typeof it.n !== "string" || !it.n.trim() || it.n.length > 40) return { error: "Each item needs a name up to 40 characters" };
    if (!Number.isInteger(it.d) || it.d < -100 || it.d > 100 || it.d === 0) return { error: "Each item needs a non-zero integer change between -100 and 100" };
    clean.push({ n: it.n.trim(), d: it.d, p: !!it.p, t: String(it.t || "").slice(0, 10) });
  }
  return { value: { start, items: clean } };
}

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
function validateCredentials(body) {
  const email = String((body && body.email) || "").trim().toLowerCase();
  const password = String((body && body.password) || "");
  if (!EMAIL.test(email) || email.length > 120) return { error: "Enter a valid email address" };
  if (password.length < 8 || password.length > 100) return { error: "Password must be 8 to 100 characters" };
  return { value: { email, password } };
}

module.exports = { validateCurrent, validateCredentials };

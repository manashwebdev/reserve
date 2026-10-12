const path = require("path");
const express = require("express");
const helmet = require("helmet");
const rateLimit = require("express-rate-limit");

const app = express();
app.set("trust proxy", 1);
app.use(
  helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        scriptSrc: ["'self'", "'unsafe-inline'"],
        styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
        fontSrc: ["https://fonts.gstatic.com"],
        imgSrc: ["'self'", "data:"],
        connectSrc: ["'self'"],
        "upgrade-insecure-requests": null,
      },
    },
  })
);
app.use(express.json({ limit: "50kb" }));

app.get("/api/health", (_req, res) => res.json({ ok: true }));
app.use("/api/auth", rateLimit({ windowMs: 15 * 60 * 1000, limit: 30, standardHeaders: true, legacyHeaders: false }), require("./routes/auth"));
app.use("/api/state", require("./routes/state"));
app.use("/api/report", require("./routes/report"));
app.use("/api", (_req, res) => res.status(404).json({ error: "Not found" }));

app.use(express.static(path.join(__dirname, "../../client")));

// eslint-disable-next-line no-unused-vars
app.use((err, _req, res, _next) => {
  console.error(err);
  res.status(500).json({ error: "Something went wrong on the server" });
});

module.exports = app;

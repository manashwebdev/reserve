const mongoose = require("mongoose");
const { MONGODB_URI, PORT } = require("./config");
const app = require("./app");

mongoose
  .connect(MONGODB_URI)
  .then(() => app.listen(PORT, () => console.log(`Reserve running on http://localhost:${PORT}`)))
  .catch((e) => {
    console.error("Could not connect to MongoDB:", e.message);
    process.exit(1);
  });

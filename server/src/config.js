require("dotenv").config();

const { JWT_SECRET, MONGODB_URI, PORT = 3000 } = process.env;

if (!JWT_SECRET || JWT_SECRET.length < 16) {
  throw new Error("JWT_SECRET is missing or too short. Set a random string of 16+ characters in server/.env");
}
if (!MONGODB_URI) {
  throw new Error("MONGODB_URI is missing. Set it in server/.env");
}

module.exports = { JWT_SECRET, MONGODB_URI, PORT: Number(PORT) };

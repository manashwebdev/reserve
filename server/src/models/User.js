const { Schema, model } = require("mongoose");

const item = new Schema({ n: String, d: Number, p: Boolean, t: String }, { _id: false });

const userSchema = new Schema(
  {
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    passwordHash: { type: String, required: true },
    current: {
      start: { type: Number, default: 100 },
      items: { type: [item], default: [] },
    },
  },
  { timestamps: true }
);

module.exports = model("User", userSchema);

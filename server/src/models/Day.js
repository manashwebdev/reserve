const { Schema, model } = require("mongoose");

const item = new Schema({ n: String, d: Number, p: Boolean, t: String }, { _id: false });

const daySchema = new Schema({
  user: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
  start: Number,
  end: Number,
  items: [item],
  closedAt: { type: Date, default: Date.now, index: true },
});

module.exports = model("Day", daySchema);

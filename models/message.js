// models/Message.js
import { Schema, model } from "mongoose";
const messageSchema = new Schema({
  sender: String,
  receiver: String,
  text: String,
  timestamp: { type: Date, default: Date.now },
});
export default model("Message", messageSchema);

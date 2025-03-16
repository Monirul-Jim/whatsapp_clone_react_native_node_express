import mongoose, { Schema, Document } from "mongoose";

interface IMessage extends Document {
  sender: string;
  receiver: string;
  text?: string;
  voice?: string; // Store voice message URL
  emoji?: string;
  timestamp: Date;
}

const MessageSchema = new Schema<IMessage>({
  sender: { type: String, required: true },
  receiver: { type: String, required: true },
  text: { type: String },
  voice: { type: String },
  emoji: { type: String },
  timestamp: { type: Date, default: Date.now },
});

const Message = mongoose.model<IMessage>("Message", MessageSchema);
export default Message;

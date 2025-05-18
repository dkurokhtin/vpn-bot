import { Schema, model } from 'mongoose';

const userSchema = new Schema({
  telegramId: { type: Number, required: true, unique: true },
  username: String,
  balance: { type: Number, default: 0 },
  subscriptionEndsAt: Date,
  vpnConfigUrl: String,
  xrayUuid: String,
  createdAt: { type: Date, default: Date.now }
});

export default model('User', userSchema);

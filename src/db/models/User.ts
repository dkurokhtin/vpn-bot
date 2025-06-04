import { Schema, model } from 'mongoose';

const userSchema = new Schema({
  telegramId: { type: Number, required: true, unique: true },
  notifiedExpired: { type: Boolean, default: false },
  username: String,
  balance: { type: Number, default: 0 },
  subscriptionEndsAt: Date,
  vpnConfigUrl: String,
  xrayUuid: String,
  acceptedPolicy: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now },
  disabled: { type: Boolean, default: false },
});

export default model('User', userSchema);

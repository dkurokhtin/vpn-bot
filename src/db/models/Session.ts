import mongoose from 'mongoose';

const SessionSchema = new mongoose.Schema({
  key: { type: String, required: true, unique: true },
  session: { type: Object, required: true },
});

export default mongoose.model('Session', SessionSchema);

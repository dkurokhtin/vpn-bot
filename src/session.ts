import { session } from "telegraf";

import SessionModel from './db/models/Session';

export const mongooseSession = session({
    defaultSession: () => ({}),
    store: {
      async get(key) {
        const entry = await SessionModel.findOne({ key }).lean();
        return entry?.session || {};
      },
      async set(key, sessionData) {
        await SessionModel.updateOne(
          { key },
          { key, session: sessionData },
          { upsert: true }
        );
      },
      async delete(key) {
        await SessionModel.deleteOne({ key });
      },
    },
  });

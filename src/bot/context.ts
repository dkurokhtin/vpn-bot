import { Context } from 'telegraf'

export interface BotSession {
  menuMessageId?: number
}

export interface BotContext extends Context {
  session?: BotSession
}

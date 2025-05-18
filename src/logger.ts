import pino from 'pino';

const logger = pino({
  transport: {
    targets: [
      {
        target: 'pino-pretty',
        options: {
          colorize: true,
          translateTime: 'HH:MM:ss dd-mm-yyyy',
          ignore: 'pid,hostname'
        }
      },
      {
        target: 'pino/file',
        options: { destination: './logs/bot.log' }
      }
    ]
  }
});

export default logger;

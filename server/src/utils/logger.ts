import logger from 'pino';
import dayjs from 'dayjs';

type Time = string; // Defined format, e.g., HH:mm:ss

type Pid = number | string; // Can be either

export const log = logger({
  transport: {
    target: 'pino-pretty',
    options: {
      colorize: true,
    },
  },
  formatters: {
    level: (label: string): { level: string } => ({ level: label }),
  },
});

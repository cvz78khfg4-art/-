import pino from "pino";
import { env } from "./env.js";

const isDevelopment = env.nodeEnv === "development";

export const logger = pino({
  // В тестах логи выключены, если LOG_LEVEL не задан явно
  level:
    env.nodeEnv === "test" && !process.env.LOG_LEVEL ? "silent" : env.logLevel,

  // Секреты никогда не попадают в logs
  redact: [
    "password",
    "passwordHash",
    "accessToken",
    "refreshToken",
    "req.headers.authorization",
    "*.password",
    "*.passwordHash",
    "*.accessToken",
    "*.refreshToken"
  ],

  // Читаемый вывод только в development; в production — structured JSON
  ...(isDevelopment
    ? {
        transport: {
          target: "pino-pretty",
          options: { colorize: true }
        }
      }
    : {})
});

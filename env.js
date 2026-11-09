// Единый строгий config. Приложение падает на старте (fail-fast),
// если обязательная переменная отсутствует или некорректна.
const ALLOWED_NODE_ENVS = ["development", "test", "production"];

function requiredEnv(name) {
  const value = process.env[name];

  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`);
  }

  return value;
}

const nodeEnv = process.env.NODE_ENV ?? "development";

if (!ALLOWED_NODE_ENVS.includes(nodeEnv)) {
  throw new Error(
    `NODE_ENV must be one of: ${ALLOWED_NODE_ENVS.join(", ")}`
  );
}

const port = Number(process.env.PORT ?? 3000);

if (!Number.isInteger(port) || port < 1 || port > 65535) {
  throw new Error("PORT must be an integer from 1 to 65535");
}

// В production CORS_ORIGIN обязателен. В development/test (в т.ч. в CI)
// используется безопасное значение по умолчанию.
const corsOrigin =
  nodeEnv === "production"
    ? requiredEnv("CORS_ORIGIN")
    : process.env.CORS_ORIGIN ?? "http://localhost:5500";

try {
  const parsed = new URL(corsOrigin);

  if (parsed.protocol !== "http:" && parsed.protocol !== "https:") {
    throw new Error("unsupported protocol");
  }
} catch {
  throw new Error("CORS_ORIGIN must be a valid http(s) URL, e.g. https://shop.example.com");
}

export const env = {
  nodeEnv,
  port,
  host: process.env.HOST ?? "0.0.0.0",
  databaseUrl: requiredEnv("DATABASE_URL"),
  jwtSecret: requiredEnv("JWT_SECRET"),
  corsOrigin,
  logLevel: process.env.LOG_LEVEL ?? "info",
  appVersion: process.env.APP_VERSION ?? "dev"
};

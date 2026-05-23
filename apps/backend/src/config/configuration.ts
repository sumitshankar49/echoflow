import "dotenv/config";

const toNumber = (value: string | undefined, fallback: number): number => {
  const parsed = Number(value);
  return Number.isNaN(parsed) ? fallback : parsed;
};

const toBoolean = (value: string | undefined, fallback = false): boolean => {
  if (value === undefined) {
    return fallback;
  }

  return ['true', '1', 'yes', 'on'].includes(value.toLowerCase());
};
console.log("Configuration loading... NODE_ENV:", process.env.NODE_ENV, "DATABASE_URL:", process.env.DATABASE_URL);
export default () => ({
  app: {
    nodeEnv: process.env.NODE_ENV ?? 'development',
    name: process.env.APP_NAME ?? 'EchoFlow Backend',
    port: toNumber(process.env.PORT, 4000),
    apiPrefix: process.env.API_PREFIX ?? 'api',
  },
  database: {
    host:'127.0.0.1',
    url:'mysql://root:Sumit@123@localhost:3306/echoflow',
    // host: process.env.DB_HOST,
    // port: toNumber(process.env.DB_PORT, 3306),
    // username: process.env.DB_USER,
    // password: process.env.DB_PASSWORD,
    // name: process.env.DB_NAME,
    // synchronize: toBoolean(process.env.DB_SYNCHRONIZE, false),
    // logging: toBoolean(process.env.DB_LOGGING, false),
  },
  jwt: {
    accessSecret: process.env.JWT_ACCESS_SECRET,
    accessExpiresIn: process.env.JWT_ACCESS_EXPIRES_IN ?? '15m',
    refreshSecret: process.env.JWT_REFRESH_SECRET,
    refreshExpiresIn: process.env.JWT_REFRESH_EXPIRES_IN ?? '7d',
  },
  mail: {
    resendApiKey: process.env.RESEND_API_KEY,
    fromEmail: process.env.MAIL_FROM,
    frontendBaseUrl: process.env.FRONTEND_BASE_URL ?? 'http://localhost:3000',
    resetPasswordUrl:
      process.env.FRONTEND_RESET_PASSWORD_URL ?? 'http://localhost:3000/reset-password',
  },
  swagger: {
    enabled: toBoolean(process.env.SWAGGER_ENABLED, true),
    path: process.env.SWAGGER_PATH ?? 'api/docs',
    title: process.env.SWAGGER_TITLE ?? 'EchoFlow API',
    description:
      process.env.SWAGGER_DESCRIPTION ??
      'Smart real-time personal memory assistant backend API',
    version: process.env.SWAGGER_VERSION ?? '1.0.0',
  },
});

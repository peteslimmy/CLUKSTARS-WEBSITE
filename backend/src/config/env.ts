import dotenv from 'dotenv';
dotenv.config();

function assertSecret(name: string, value: string | undefined, minLength = 64): string {
  if (!value || value.length < minLength) {
    if (process.env.NODE_ENV === 'production') {
      throw new Error(`FATAL: ${name} must be at least ${minLength} characters in production. Set ${name} environment variable.`);
    }
    console.warn(`⚠️  WARNING: ${name} is weak or missing — set a strong secret (min ${minLength} chars) for production`);
    return value || 'dev-secret-warning-only';
  }
  return value;
}

export const config = {
  port: parseInt(process.env.PORT || '4000', 10),
  nodeEnv: process.env.NODE_ENV || 'development',
  databaseUrl: process.env.DATABASE_URL || '',
  redisUrl: process.env.REDIS_URL || 'redis://localhost:6379',
  jwt: {
    secret: assertSecret('JWT_SECRET', process.env.JWT_SECRET),
    refreshSecret: assertSecret('JWT_REFRESH_SECRET', process.env.JWT_REFRESH_SECRET),
    accessExpiry: process.env.JWT_ACCESS_EXPIRY || '15m',
    refreshExpiry: process.env.JWT_REFRESH_EXPIRY || '7d',
  },
  minio: {
    endpoint: process.env.MINIO_ENDPOINT || 'localhost',
    port: parseInt(process.env.MINIO_PORT || '9000', 10),
    accessKey: process.env.MINIO_ACCESS_KEY || 'minioadmin',
    secretKey: process.env.MINIO_SECRET_KEY || 'minioadmin',
    bucket: process.env.MINIO_BUCKET || 'clukstars-media',
    useSSL: process.env.MINIO_USE_SSL === 'true',
  },
  corsOrigin: process.env.CORS_ORIGIN || 'http://localhost:5173',
  appName: process.env.APP_NAME || 'CLUKSTARS CMS',
};

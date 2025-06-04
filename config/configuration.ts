import { NumberUtil } from '@/shared/util/number.util'

export default () => ({
  DB_HOST: process.env.DB_HOST || 'localhost',
  DB_PORT: process.env.DB_PORT || 5432,
  DB_USERNAME: process.env.DB_USERNAME || 'postgres',
  DB_PASSWORD: process.env.DB_PASSWORD || 'admin',
  DB_DATABASE: process.env.DB_DATABASE || 'postgres',

  REDIS_HOST: process.env.REDIS_HOST || 'localhost',
  REDIS_PORT: process.env.REDIS_PORT || 6379,

  CACHE_TTL: process.env.CACHE_TTL || '10m',

  YOUTUBE_CHAT_HTTP_LIMITER_MAX_CONCURRENT: NumberUtil.parse(process.env.YOUTUBE_CHAT_HTTP_LIMITER_MAX_CONCURRENT, 20),
  YOUTUBE_CHAT_ACTION_MAX_AGE: process.env.YOUTUBE_CHAT_ACTION_MAX_AGE || '1h',
})

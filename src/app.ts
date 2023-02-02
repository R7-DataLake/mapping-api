import fastify from 'fastify'
import path from 'path'

const autoload = require('@fastify/autoload')
const helmet = require('@fastify/helmet')

const app = fastify({
  logger: {
    transport:
      process.env.NODE_ENV === 'development'
        ? {
          target: 'pino-pretty',
          options: {
            translateTime: 'HH:MM:ss Z',
            ignore: 'pid,hostname',
            colorize: true
          }
        }
        : undefined
  }
})

// Plugins
app.register(require('@fastify/formbody'))
app.register(require('@fastify/cors'))
app.register(require('@fastify/multipart'))

// Rate limit
app.register(import('@fastify/rate-limit'), {
  global: false,
  max: 100,
  timeWindow: '1 minute'
})

app.register(
  helmet,
  { contentSecurityPolicy: false }
)

// Web services
app.register(require('fastify-axios'), {
  clients: {
    loginService: {
      baseURL: process.env.R7PLATFORM_MAPPING_API_LOGIN_ENDPOINT || 'http://127.0.0.1:3001'
    }
  }
})

// Database
app.register(require('./plugins/db'), {
  options: {
    client: 'pg',
    connection: {
      host: process.env.R7PLATFORM_MAPPING_API_DB_HOST || 'localhost',
      user: process.env.R7PLATFORM_MAPPING_API_DB_USER || 'postgres',
      port: Number(process.env.R7PLATFORM_MAPPING_API_DB_PORT) || 5432,
      password: process.env.R7PLATFORM_MAPPING_API_DB_PASSWORD || '',
      database: process.env.R7PLATFORM_MAPPING_API_DB_NAME || 'test',
    },
    searchPath: [process.env.R7PLATFORM_MAPPING_API_DB_SCHEMA || 'public'],
    pool: {
      min: 10,
      max: 500
    },
    debug: process.env.R7PLATFORM_MAPPING_API_DB_DEBUG === "Y" ? true : false,
  }
})

// JWT
app.register(require('./plugins/jwt'), {
  secret: process.env.R7PLATFORM_MAPPING_API_SECRET_KEY || '@1234567890@',
  sign: {
    iss: 'r7platform-mapping.moph.go.th',
    expiresIn: '1d'
  },
  messages: {
    badRequestErrorMessage: 'Format is Authorization: Bearer [token]',
    noAuthorizationInHeaderMessage: 'Autorization header is missing!',
    authorizationTokenExpiredMessage: 'Authorization token expired',
    authorizationTokenInvalid: (err: any) => {
      return `Authorization token is invalid: ${err.message}`
    }
  }
})

// routes
app.register(autoload, {
  dir: path.join(__dirname, 'routes')
})

export default app

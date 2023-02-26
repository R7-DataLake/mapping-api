import { FastifyInstance } from "fastify"

export default async (fastify: FastifyInstance, _options: any, done: any) => {

  fastify.addHook("onRequest", (request) => request.jwtVerify())

  fastify.register(require('./person'), { prefix: '/person' })
  fastify.register(require('./opd'), { prefix: '/opd' })

  done()

} 

import { FastifyInstance } from "fastify"

export default async (fastify: FastifyInstance, _options: any, done: any) => {

  fastify.addHook("onRequest", (request) => request.jwtVerify())

  fastify.register(require('./dashboard'), { prefix: '/dashboard' })

  done()

} 

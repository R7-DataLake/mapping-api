import { FastifyInstance, FastifyReply, FastifyRequest } from "fastify"
import { StatusCodes } from "http-status-codes"

export default async (fastify: FastifyInstance, _options: any, done: any) => {

  fastify.addHook("onRequest", (request) => request.jwtVerify())

  fastify.get('/', async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      reply.status(StatusCodes.OK).send(request.user)
    } catch (error: any) {
      request.log.error(error)
      reply.status(StatusCodes.INTERNAL_SERVER_ERROR).send()
    }
  })

  done()

} 

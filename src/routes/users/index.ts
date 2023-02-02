import { FastifyInstance, FastifyReply, FastifyRequest } from "fastify"
import { StatusCodes } from "http-status-codes"

export default async (fastify: FastifyInstance, _: any, done: any) => {

  fastify.addHook("onRequest", (request) => request.jwtVerify())

  fastify.get('/', async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      console.log(request.user)
      reply.status(StatusCodes.OK).send({})
    } catch (error: any) {
      request.log.error(error)
      reply.status(StatusCodes.INTERNAL_SERVER_ERROR).send()
    }
  })

  done()

} 

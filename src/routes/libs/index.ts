import { FastifyInstance } from "fastify"

export default async (fastify: FastifyInstance) => {

  fastify.register(require('./drug'), { prefix: '/drugs' })
  fastify.register(require('./drug_usage'), { prefix: '/drug-usages' })
  fastify.register(require('./lab'), { prefix: '/labs' })

} 

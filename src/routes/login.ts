import { AxiosResponse } from "axios"
import { FastifyInstance, FastifyReply, FastifyRequest } from "fastify"
import { getReasonPhrase, StatusCodes } from "http-status-codes"

import { LoginService } from '../models/login'
import _ from 'lodash'

export default async (fastify: FastifyInstance, _options: any, done: any) => {

  const loginService = new LoginService()

  fastify.post('/login', {
    config: {
      rateLimit: {
        max: 10,
        timeWindow: '1 minute'
      }
    }
  }, async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const body: any = request.body
      const { username, password } = body
      // Login via Login Service
      const rs: AxiosResponse = await loginService.doLogin(fastify.axios, username, password)
      // Response data from login service
      const data: any = rs.data
      // Check access_token key
      if (_.has(data, 'access_token')) {
        const loginToken: any = data.access_token
        // Decode JWT
        const decoded: any = fastify.jwt.decode(loginToken)
        // Create data payload
        const payload: any = {
          sub: decoded.sub,
          hospcode: decoded.hospcode,
          hospname: decoded.hospname,
        }

        // Sign new JWT token
        const access_token = fastify.jwt.sign(payload)
        reply.status(StatusCodes.OK).send({ access_token })
      } else {
        reply.status(StatusCodes.UNAUTHORIZED)
          .send(getReasonPhrase(StatusCodes.UNAUTHORIZED))
      }
    } catch (error: any) {
      request.log.info(error.message);
      reply.status(StatusCodes.BAD_GATEWAY).send(error)
    }
  })

  done()

} 

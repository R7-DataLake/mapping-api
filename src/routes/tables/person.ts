import { FastifyInstance, FastifyReply, FastifyRequest } from 'fastify'
import {
  StatusCodes,
} from 'http-status-codes'
import { TableModel } from '../../models/table'

import { DateTime } from 'luxon'

import listSchema from '../../schema/search'

export default async (fastify: FastifyInstance, _options: any, done: any) => {

  const db = fastify.dbraw
  const tableModel = new TableModel()

  fastify.get('/', {
    schema: listSchema
  }, async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const _query: any = request.query
      const { limit, offset, query } = _query
      const _limit = limit || 20
      const _offset = offset || 0

      const hospcode = request.user.hospcode

      const _data: any = await tableModel.person(db, hospcode, query, _limit, _offset)

      const data: any = _data.map((v: any) => {
        v.birth = DateTime.fromJSDate(v.birth).toISODate();
        v.d_update = DateTime.fromJSDate(v.d_update).toISO();

        return v;
      })

      const rsTotal: any = await tableModel.personTotal(db, hospcode, query)

      reply.status(StatusCodes.OK).send({
        status: 'success',
        data,
        total: Number(rsTotal[0].total)
      })
    } catch (error: any) {
      request.log.error(error)
      reply.status(StatusCodes.INTERNAL_SERVER_ERROR).send()
    }
  })

  done()

} 

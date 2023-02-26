import { FastifyInstance, FastifyReply, FastifyRequest } from 'fastify'
import {
  StatusCodes,
} from 'http-status-codes'
import { DrugModel } from "../../models/drug"
import { TableModel } from '../../models/table'

const { DateTime } = require('luxon')

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
        v.birth = DateTime.fromSQL(v.birth, { locale: 'th' }).toLocaleString(DateTime.DATE_MED);
        v.d_update = DateTime.fromSQL(v.d_update, { locale: 'th' }).toLocaleString(DateTime.DATETIME_MED_WITH_SECONDS);

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

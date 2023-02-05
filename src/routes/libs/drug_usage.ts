import { FastifyInstance, FastifyReply, FastifyRequest } from 'fastify'
import {
  StatusCodes,
  getReasonPhrase,
} from 'http-status-codes'
import { IDrugUsageInsert, IDrugUsageUpdate } from "../../../@types/drug_usage"
import { DrugUsageModel } from "../../models/drug_usage"

const fs = require('fs')
const csv = require('csv-parser')

const { DateTime } = require('luxon')

import deleteSchema from '../../schema/drug_usage/delete'
import updateSchema from '../../schema/drug_usage/update'
import listSchema from '../../schema/drug_usage/list'
import addSchema from '../../schema/drug_usage/add'


export default async (fastify: FastifyInstance, _options: any, done: any) => {

  const db = fastify.db
  const drugUsageModel = new DrugUsageModel()

  fastify.get('/list', {
    schema: listSchema
  }, async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const _query: any = request.query
      const { limit, offset, query } = _query
      const _limit = limit || 20
      const _offset = offset || 0

      const hospcode = request.user.hospcode

      const results: any = await drugUsageModel.list(db, hospcode, query, _limit, _offset)

      const rsTotal: any = await drugUsageModel.listTotal(db, hospcode, query)

      reply.status(StatusCodes.OK).send({
        results,
        'total': Number(rsTotal[0].total)
      })
    } catch (error: any) {
      request.log.error(error)
      reply.status(StatusCodes.INTERNAL_SERVER_ERROR)
        .send({
          status: 'error',
          error: {
            code: StatusCodes.INTERNAL_SERVER_ERROR,
            message: getReasonPhrase(StatusCodes.INTERNAL_SERVER_ERROR)
          }
        })
    }
  })

  fastify.post('/upload', {
    config: {
      rateLimit: {
        max: 10,
        timeWindow: '1 minute'
      }
    },
  }, async (request: FastifyRequest, reply: FastifyReply) => {
    try {

      const userId: any = request.user.sub
      const hospcode: any = request.user.hospcode

      const now = DateTime.now().setZone('Asia/Bangkok')

      const files = await request.saveRequestFiles({
        limits: {
          fileSize: 10 * 1024 * 1024 // 10mb
        }
      })

      for (const file of files) {
        if (file.mimetype !== 'text/csv') {
          return reply.status(StatusCodes.BAD_REQUEST)
            .send({ error: 'Invalid file type' })
        }
      }

      const filepath = files[0].filepath
      let results: IDrugUsageInsert[] = []

      const stream = fs.createReadStream(filepath)
        .pipe(csv())

      const expectedHeader = ['code', 'usage1', 'usage2', 'usage3']
      let headerChecked = false

      for await (const data of stream) {
        if (!headerChecked) {
          const header = Object.keys(data);
          if (!expectedHeader.every((h) => header.includes(h))) {
            const errorMessage = `ERROR: The header of the CSV file is invalid. Expected: ${expectedHeader.join(', ')}. Found: ${header.join(', ')}.`
            console.error(errorMessage)

            return reply
              .status(StatusCodes.INTERNAL_SERVER_ERROR)
              .send({
                code: StatusCodes.INTERNAL_SERVER_ERROR,
                error: errorMessage
              })
          }
          headerChecked = true
        }

        results.push({
          hospcode,
          usage1: data.usage1,
          usage2: data.usage2,
          usage3: data.usage3,
          code: data.code,
          user_id: userId,
          updated_at: now,
        })
      }

      // Import
      await drugUsageModel.bulkInsert(db, results)

      reply.status(StatusCodes.OK)
        .send({ status: 'success' })

    } catch (error: any) {
      request.log.error(error)
      reply.status(StatusCodes.INTERNAL_SERVER_ERROR)
        .send({
          status: 'error',
          error: {
            code: StatusCodes.INTERNAL_SERVER_ERROR,
            message: getReasonPhrase(StatusCodes.INTERNAL_SERVER_ERROR)
          }
        })
    }
  })

  // Remove drug
  fastify.delete('/:code/delete', {
    schema: deleteSchema,
  }, async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const hospcode = request.user.hospcode
      // const userId = request.user.sub

      const params: any = request.params
      const { code } = params
      await drugUsageModel.remove(db, code, hospcode)
      reply.status(StatusCodes.OK).send(getReasonPhrase(StatusCodes.OK))
    } catch (error: any) {
      request.log.error(error)
      reply.status(StatusCodes.INTERNAL_SERVER_ERROR)
        .send({
          status: 'error',
          error: {
            code: StatusCodes.INTERNAL_SERVER_ERROR,
            message: getReasonPhrase(StatusCodes.INTERNAL_SERVER_ERROR)
          }
        })
    }
  })

  // Update info
  fastify.put('/:code/update', {
    schema: updateSchema,
  }, async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const hospcode = request.user.hospcode
      const userId = request.user.sub

      const params: any = request.params
      const { code } = params

      const body: any = request.body
      const { usage1, usage2, usage3 } = body

      const now = DateTime.now().setZone('Asia/Bangkok');

      const data: IDrugUsageUpdate = {
        usage1,
        usage2,
        usage3,
        user_id: userId,
        updated_at: now
      }

      await drugUsageModel.update(db, hospcode, code, data)
      reply.status(StatusCodes.OK).send(getReasonPhrase(StatusCodes.OK))
    } catch (error: any) {
      request.log.error(error)
      reply.status(StatusCodes.INTERNAL_SERVER_ERROR)
        .send({
          status: 'error',
          error: {
            code: StatusCodes.INTERNAL_SERVER_ERROR,
            message: getReasonPhrase(StatusCodes.INTERNAL_SERVER_ERROR)
          }
        })
    }
  })

  // Save new
  fastify.post('/new', {
    schema: addSchema,
  }, async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const hospcode = request.user.hospcode
      const userId = request.user.sub

      const body: any = request.body
      const { code, usage1, usage2, usage3 } = body

      const now = DateTime.now().setZone('Asia/Bangkok');

      const data: IDrugUsageInsert = {
        code,
        usage1,
        usage2,
        usage3,
        user_id: userId,
        hospcode,
        updated_at: now
      }

      await drugUsageModel.save(db, data)
      reply.status(StatusCodes.OK)
        .send({ status: 'success' })
    } catch (error: any) {
      reply.status(StatusCodes.INTERNAL_SERVER_ERROR)
        .send({
          status: 'error',
          error: {
            code: StatusCodes.INTERNAL_SERVER_ERROR,
            message: getReasonPhrase(StatusCodes.INTERNAL_SERVER_ERROR)
          }
        })
    }
  })

  done()

} 

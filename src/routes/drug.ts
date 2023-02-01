import { FastifyInstance, FastifyReply, FastifyRequest } from 'fastify'
import {
  StatusCodes,
  getReasonPhrase,
} from 'http-status-codes'
import { IDrugInsert, IDrugMapping } from "../../@types/mapping"
import { DrugModel } from "../models/drug"

const fs = require('fs')
const csv = require('csv-parser')

const { DateTime, Settings } = require('luxon')

import mappingSchema from '../schema/mapping'


export default async (fastify: FastifyInstance) => {

  const db = fastify.db
  const drugModel = new DrugModel()

  fastify.post('/drugs/upload', {
    onRequest: [fastify.authenticate],
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

      const now = DateTime.now().setZone('Asia/Bangkok');

      const files = await request.saveRequestFiles({ limits: { fileSize: 17000 } })

      for (const file of files) {
        if (file.mimetype !== 'text/csv') {
          return reply.status(StatusCodes.BAD_REQUEST)
            .send({ error: 'Invalid file type' });
        }
      }

      const filepath = files[0].filepath
      let results: IDrugInsert[] = [];

      const stream = fs.createReadStream(filepath)
        .pipe(csv())

      const expectedHeader = ['code', 'name']
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
          name: data.name,
          code: data.code,
          user_id: userId,
          updated_at: now,
        })
      }

      // Import
      await drugModel.bulkInsert(db, results)

      reply.status(StatusCodes.OK)
        .send(getReasonPhrase(StatusCodes.OK))

    } catch (error: any) {
      request.log.error(error)
      reply
        .status(StatusCodes.INTERNAL_SERVER_ERROR)
        .send({
          code: StatusCodes.INTERNAL_SERVER_ERROR,
          error: getReasonPhrase(StatusCodes.INTERNAL_SERVER_ERROR)
        })
    }
  })

  // Save mapping
  fastify.post('/drugs/mapping', {
    onRequest: [fastify.authenticate],
    schema: mappingSchema,
  }, async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const hospcode = request.user.hospcode
      const userId = request.user.sub

      const body: any = request.body
      const { code, f43, nhso, tmt } = body

      const now = DateTime.now().setZone('Asia/Bangkok');

      const data: IDrugMapping = {
        code,
        f43,
        nhso,
        tmt,
        user_id: userId,
        hospcode,
        updated_at: now
      }

      await drugModel.mapping(db, data)
      reply.status(StatusCodes.OK).send(getReasonPhrase(StatusCodes.OK))
    } catch (error: any) {
      request.log.error(error)
      reply.status(StatusCodes.INTERNAL_SERVER_ERROR).send()
    }
  })

} 

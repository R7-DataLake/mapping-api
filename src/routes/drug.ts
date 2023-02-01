import { FastifyInstance, FastifyReply, FastifyRequest } from "fastify"
import {
  StatusCodes,
  getReasonPhrase,
} from 'http-status-codes'
import { IDrugInsert } from "../../@types/mapping"
import { DrugModel } from "../models/drug"

const fs = require('fs')
const csv = require('csv-parser')

const { DateTime, Settings } = require('luxon');


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

      Settings.defaultZone = "Asia/Bangkok";
      const now = DateTime.now();

      const files = await request.saveRequestFiles({ limits: { fileSize: 17000 } })

      const filepath = files[0].filepath
      // console.log(filepath)
      // files[0].fieldname
      // files[0].filename
      // files[0].encoding
      // files[0].mimetype
      // files[0].fields

      let results: IDrugInsert[] = [];

      const stream = fs.createReadStream(filepath)
        .pipe(csv())

      const expectedHeader = ['code', 'name']
      let headerChecked = false

      for await (const data of stream) {
        if (!headerChecked) {
          const header = Object.keys(data);
          if (!expectedHeader.every((h) => header.includes(h))) {
            console.error(`ERROR: The header of the CSV file is invalid. Expected: ${expectedHeader.join(', ')}. Found: ${header.join(', ')}.`)
            return reply
              .status(StatusCodes.INTERNAL_SERVER_ERROR)
              .send({
                code: StatusCodes.INTERNAL_SERVER_ERROR,
                error: 'The header of the CSV file is invalid.'
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

} 

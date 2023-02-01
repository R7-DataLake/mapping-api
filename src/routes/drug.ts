import { FastifyInstance, FastifyReply, FastifyRequest } from "fastify"
import {
  StatusCodes,
  getReasonPhrase,
} from 'http-status-codes'

const fs = require('fs')
const csv = require('csv-parser')

export default async (fastify: FastifyInstance) => {

  const db = fastify.db

  fastify.post('/upload', {
    config: {
      rateLimit: {
        max: 10,
        timeWindow: '1 minute'
      }
    },
  }, async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const files = await request.saveRequestFiles({ limits: { fileSize: 17000 } })
      const filepath = files[0].filepath
      // files[0].fieldname
      // files[0].filename
      // files[0].encoding
      // files[0].mimetype
      // files[0].fields

      let results: any = [];

      const stream = fs.createReadStream(filepath)
        .pipe(csv())

      const expectedHeader = ['code', 'name']
      let headerChecked = false;
      for await (const data of stream) {
        if (!headerChecked) {
          const header = Object.keys(data);
          if (!expectedHeader.every((h) => header.includes(h))) {
            console.error(`ERROR: The header of the CSV file is invalid. Expected: ${expectedHeader.join(', ')}. Found: ${header.join(', ')}.`);
            return;
          }
          headerChecked = true;
        }
        results.push(data)
      }

      if (headerChecked) {

      }

      reply
        .status(StatusCodes.UNAUTHORIZED)
        .send({
          code: StatusCodes.UNAUTHORIZED,
          error: getReasonPhrase(StatusCodes.UNAUTHORIZED)
        })
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

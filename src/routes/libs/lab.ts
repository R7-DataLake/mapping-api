import { FastifyInstance, FastifyReply, FastifyRequest } from 'fastify'
import {
  StatusCodes,
  getReasonPhrase,
} from 'http-status-codes'
import { LabModel } from "../../models/lab"

const fs = require('fs')
const csv = require('csv-parser')

const { DateTime } = require('luxon')

import mappingSchema from '../../schema/lab/mapping'
import deleteSchema from '../../schema/lab/delete'
import updateSchema from '../../schema/lab/update'
import listSchema from '../../schema/lab/list'
import addSchema from '../../schema/lab/add'

import { ILabInsert, ILabMapping, ILabUpdate } from '../../../@types/lab'


export default async (fastify: FastifyInstance, _options: any, done: any) => {

  const db = fastify.db
  const labModel = new LabModel()

  fastify.get('/list', {
    schema: listSchema
  }, async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const _query: any = request.query
      const { limit, offset, query } = _query
      const _limit = limit || 20
      const _offset = offset || 0

      const hospcode = request.user.hospcode

      const data: any = await labModel.list(db, hospcode, query, _limit, _offset)

      const rsTotal: any = await labModel.listTotal(db, hospcode, query)

      reply.status(StatusCodes.OK).send({
        status: 'success',
        data,
        total: Number(rsTotal[0].total)
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
        tmpdir: './tmp',
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
      let results: ILabInsert[] = [];

      const stream = fs.createReadStream(filepath)
        .pipe(csv({
          separator: '|',
          mapHeaders: ({ header, index }: { header: any, index: number }) => header.toLowerCase()
        }))

      const expectedHeader = ['code', 'name', 'lab_group_code']
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
          lab_group_code: data.lab_group_code,
          user_id: userId,
          updated_at: now,
        })
      }

      // Import
      await labModel.bulkInsert(db, results)

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
      await labModel.remove(db, code, hospcode)
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

  // Save mapping
  fastify.post('/mapping', {
    schema: mappingSchema,
  }, async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const hospcode = request.user.hospcode
      const userId = request.user.sub

      const body: any = request.body
      const { code, f43, loinc } = body

      const now = DateTime.now().setZone('Asia/Bangkok');

      const data: ILabMapping = {
        code,
        f43,
        loinc,
        user_id: userId,
        hospcode,
        updated_at: now
      }

      await labModel.mapping(db, data)
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
      const { name, lab_group_code } = body

      const now = DateTime.now().setZone('Asia/Bangkok');

      const data: ILabUpdate = {
        name,
        user_id: userId,
        updated_at: now,
        lab_group_code: lab_group_code
      }

      await labModel.update(db, hospcode, code, data)
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

  // Save new drug
  fastify.post('/new', {
    schema: addSchema,
  }, async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const hospcode = request.user.hospcode
      const userId = request.user.sub

      const body: any = request.body
      const { code, name, lab_group_code } = body

      const now = DateTime.now().setZone('Asia/Bangkok');

      const data: ILabInsert = {
        code,
        name,
        lab_group_code,
        user_id: userId,
        hospcode,
        updated_at: now
      }

      await labModel.save(db, data)
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


  done()

} 

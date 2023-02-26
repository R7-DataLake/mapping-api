import { FastifyInstance, FastifyReply, FastifyRequest } from 'fastify';
import { getReasonPhrase, StatusCodes } from 'http-status-codes';

import { IProviderInsert, IProviderMapping, IProviderUpdate } from '../../../@types/provider';
import { ProviderModel } from '../../models/provider';
import addSchema from '../../schema/provider/add';
import deleteSchema from '../../schema/provider/delete';
import listSchema from '../../schema/provider/list';
import mappingSchema from '../../schema/provider/mapping';
import updateSchema from '../../schema/provider/update';

const fs = require('fs')
const csv = require('csv-parser')

const { DateTime } = require('luxon')

export default async (fastify: FastifyInstance, _options: any, done: any) => {

  const db = fastify.db
  const providerModel = new ProviderModel()

  fastify.get('/list', {
    schema: listSchema
  }, async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const _query: any = request.query
      const { limit, offset, query } = _query
      const _limit = limit || 20
      const _offset = offset || 0

      const hospcode = request.user.hospcode

      const data: any = await providerModel.list(db, hospcode, query, _limit, _offset)

      const rsTotal: any = await providerModel.listTotal(db, hospcode, query)

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
      let results: IProviderInsert[] = []

      const stream = fs.createReadStream(filepath)
        .pipe(csv({ separator: '|' }))

      const expectedHeader = ['code', 'cid', 'prename', 'fname', 'lname', 'sex', 'birth', 'provider_type', 'start_date', 'end_date', 'register_no', 'council']
      let headerChecked = false

      for await (const data of stream) {
        if (!headerChecked) {
          const header = Object.keys(data)
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

        const birth = DateTime.fromFormat(data.birth, "yyyyMMdd")
        const start_date = DateTime.fromFormat(data.start_date, "yyyyMMdd")
        const end_date = DateTime.fromFormat(data.end_date, "yyyyMMdd")

        results.push({
          hospcode,
          code: data.code,
          prename: data.prename,
          fname: data.fname,
          lname: data.lname,
          sex: data.sex,
          provider_type: data.provider_type,
          birth: birth.toFormat('yyyy-MM-dd'),
          start_date: start_date.toFormat('yyyy-MM-dd'),
          end_date: end_date.toFormat('yyyy-MM-dd'),
          cid: data.cid,
          register_no: data.register_no,
          council: data.council,
          user_id: userId,
          updated_at: now,
        })
      }

      // Import
      await providerModel.bulkInsert(db, results)

      reply.status(StatusCodes.OK)
        .send({ status: 'success' })

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

  // Remove Insurance
  fastify.delete('/:code/delete', {
    schema: deleteSchema,
  }, async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const hospcode = request.user.hospcode
      // const userId = request.user.sub

      const params: any = request.params
      const { code } = params
      await providerModel.remove(db, code, hospcode)
      reply.status(StatusCodes.OK)
        .send({ status: 'success' })
    } catch (error: any) {
      request.log.error(error)
      reply.status(StatusCodes.INTERNAL_SERVER_ERROR).send()
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
      const { code, f43, nhso, tmt } = body

      const now = DateTime.now().setZone('Asia/Bangkok');

      const data: IProviderMapping = {
        code,
        f43,
        nhso,
        user_id: userId,
        hospcode,
        updated_at: now
      }

      await providerModel.mapping(db, data)
      reply.status(StatusCodes.OK)
        .send({ status: 'success' })
    } catch (error: any) {
      request.log.error(error)
      reply.status(StatusCodes.INTERNAL_SERVER_ERROR).send()
    }
  })

  fastify.post('/new', {
    schema: addSchema,
  }, async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const hospcode = request.user.hospcode
      const userId = request.user.sub

      const body: any = request.body
      const { code, prename, fname, lname, sex, birth, provider_type, cid, start_date, end_date, register_no, council } = body

      const now = DateTime.now().setZone('Asia/Bangkok');

      const _birth = DateTime.fromFormat(birth, "yyyyMMdd")
      const _start_date = DateTime.fromFormat(start_date, "yyyyMMdd")
      const _end_date = DateTime.fromFormat(end_date, "yyyyMMdd")

      const data: IProviderInsert = {
        code,
        user_id: userId,
        hospcode,
        updated_at: now,
        prename,
        fname,
        lname,
        sex,
        provider_type,
        birth: _birth.toFormat('yyyy-MM-dd'),
        start_date: _start_date.toFormat('yyyy-MM-dd'),
        end_date: _end_date.toFormat('yyyy-MM-dd'),
        cid,
        register_no,
        council
      }

      await providerModel.save(db, data)
      reply.status(StatusCodes.OK)
        .send({ status: 'success' })
    } catch (error: any) {
      request.log.error(error)
      reply.status(StatusCodes.INTERNAL_SERVER_ERROR).send()
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
      const { prename, fname, lname, sex, birth, provider_type, cid, start_date, end_date, register_no, council } = body

      const now = DateTime.now().setZone('Asia/Bangkok');

      const _birth = DateTime.fromFormat(birth, "yyyyMMdd")
      const _start_date = DateTime.fromFormat(start_date, "yyyyMMdd")
      const _end_date = DateTime.fromFormat(end_date, "yyyyMMdd")

      const data: IProviderUpdate = {
        user_id: userId,
        updated_at: now,
        prename,
        fname,
        lname,
        sex,
        provider_type,
        birth: _birth.toFormat('yyyy-MM-dd'),
        start_date: _start_date.toFormat('yyyy-MM-dd'),
        end_date: _end_date.toFormat('yyyy-MM-dd'),
        cid,
        register_no,
        council
      }

      await providerModel.update(db, hospcode, code, data)
      reply.status(StatusCodes.OK)
        .send({ status: 'success' })
    } catch (error: any) {
      request.log.error(error)
      reply.status(StatusCodes.INTERNAL_SERVER_ERROR).send()
    }
  })

  done()

} 

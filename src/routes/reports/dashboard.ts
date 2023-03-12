import { FastifyInstance, FastifyReply, FastifyRequest } from 'fastify'
import {
  StatusCodes,
} from 'http-status-codes'
import { ReportModel } from '../../models/report'

import { DateTime } from 'luxon'

export default async (fastify: FastifyInstance, _options: any, done: any) => {

  const db = fastify.dbraw;
  const model = new ReportModel();

  fastify.get('/person-typearea',
    async (request: FastifyRequest, reply: FastifyReply) => {
      try {
        const hospcode = request.user.hospcode;
        const _results: any = await model.getPersonByTypearea(db, hospcode);
        const results: any = _results.map((v: any) => {
          v.total = Number(v.total);
          return v;
        });

        reply.status(StatusCodes.OK).send({
          status: 'success',
          results
        });

      } catch (error: any) {
        request.log.error(error);
        reply.status(StatusCodes.INTERNAL_SERVER_ERROR).send();
      }
    });

  fastify.get('/total',
    async (request: FastifyRequest, reply: FastifyReply) => {
      try {
        const hospcode = request.user.hospcode;
        const person: any = await model.getTotalPerson(db, hospcode);
        const opd: any = await model.getTotalOpd(db, hospcode);
        const ipd: any = await model.getTotalIpd(db, hospcode);
        const chronic: any = await model.getTotalChronic(db, hospcode);

        reply.status(StatusCodes.OK).send({
          status: 'success',
          person, opd, ipd, chronic
        });

      } catch (error: any) {
        request.log.error(error);
        reply.status(StatusCodes.INTERNAL_SERVER_ERROR).send();
      }
    });

  fastify.get('/last-services',
    async (request: FastifyRequest, reply: FastifyReply) => {
      try {
        const hospcode = request.user.hospcode;
        const query: any = request.query;
        let { start, end } = query;

        start = DateTime.fromFormat(start, "yyyyMMdd").toSQLDate();
        end = DateTime.fromFormat(end, "yyyyMMdd").toSQLDate();

        const opd: any = await model.getLastOpd(db, hospcode, start, end);
        const ipd: any = await model.getLastIpd(db, hospcode, start, end);
        const resultOpd: any = opd.map((v: any) => {
          v.total = Number(v.total);
          v.date_serv = DateTime.fromJSDate(v.date_serv).toFormat('yyyy-MM-dd');
          return v;
        });
        const resultIpd: any = ipd.map((v: any) => {
          v.total = Number(v.total);
          v.dateadm = DateTime.fromJSDate(v.dateadm).toFormat('yyyy-MM-dd');
          return v;
        });

        reply.status(StatusCodes.OK).send({
          status: 'success',
          opd: resultOpd,
          ipd: resultIpd
        });

      } catch (error: any) {
        request.log.error(error);
        reply.status(StatusCodes.INTERNAL_SERVER_ERROR).send();
      }
    });

  done();

} 

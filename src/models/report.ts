import { Knex } from 'knex';

export class ReportModel {

  constructor () { }

  getPersonByTypearea(db: Knex, hospcode: any) {

    let sql = db('person as p')
      .select('p.typearea', db.raw('count(1) as total'))
      .where('p.hospcode', hospcode)
      .groupBy('p.typearea')
      .orderBy('p.typearea', 'asc');

    return sql;

  }

  getLastOpd(db: Knex, hospcode: any, start: any, end: any) {

    let sql = db('opd as o')
      .select('o.date_serv', db.raw('count(1) as total'))
      .where('o.hospcode', hospcode)
      .whereBetween('o.date_serv', [start, end])
      .groupBy('o.date_serv')
      .orderBy('o.date_serv', 'asc');

    return sql;

  }

  getLastIpd(db: Knex, hospcode: any, start: any, end: any) {

    let sql = db('ipd as i')
      .select('i.dateadm', db.raw('count(1) as total'))
      .where('i.hospcode', hospcode)
      .whereBetween('i.dateadm', [start, end])
      .groupBy('i.dateadm')
      .orderBy('i.dateadm', 'asc');

    return sql;

  }

  getTotalOpd(db: Knex, hospcode: any) {

    let sql = db('opd')
      .select(db.raw('count(1) as total'))
      .where('hospcode', hospcode);

    return sql.first();

  }

  getTotalIpd(db: Knex, hospcode: any) {

    let sql = db('ipd')
      .select(db.raw('count(1) as total'))
      .where('hospcode', hospcode);

    return sql.first();

  }

  getTotalChronic(db: Knex, hospcode: any) {

    let sql = db('chronic')
      .select(db.raw('count(1) as total'))
      .where('hospcode', hospcode);

    return sql.first();

  }

  getTotalPerson(db: Knex, hospcode: any) {

    let sql = db('person')
      .select(db.raw('count(1) as total'))
      .where('hospcode', hospcode);

    return sql.first();

  }

}

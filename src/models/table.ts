import { Knex } from 'knex';

export class TableModel {

  person(db: Knex, hospcode: any, query: any, limit: any, offset: any) {
    let sql = db('person')
      .select()
    if (query) {
      let _query = `%${query}%`
      sql.where(builder => {
        builder.whereRaw('LOWER(fname) like LOWER(?)', [_query])
          .orWhere('cid', query)
          .orWhere('hn', query)
      })
    }

    return sql
      .whereRaw('hospcode=?', [hospcode])
      .orderBy('fname', 'asc')
      .limit(limit).offset(offset)

  }

  personTotal(db: Knex, hospcode: any, query: any) {

    let sql = db('person')

    if (query) {
      let _query = `%${query}%`
      sql.where(builder => {
        builder.whereRaw('LOWER(fname) like LOWER(?)', [_query])
          .orWhere('cid', query)
          .orWhere('hn', query)
      })
    }

    return sql
      .whereRaw('hospcode=?', [hospcode])
      .count({ total: '*' })

  }

  opd(db: Knex, hospcode: any, date_serv: any, limit: any, offset: any) {
    let sql = db('opd')
      .select()
    if (date_serv) {
      sql.where('date_serv', date_serv)
    }

    return sql
      .whereRaw('hospcode=?', [hospcode])
      .orderByRaw('date_serv desc, time_serv desc')
      .limit(limit).offset(offset)

  }

  opdTotal(db: Knex, hospcode: any, date_serv: any) {

    let sql = db('opd')

    if (date_serv) {
      sql.where('date_serv', date_serv)
    }

    return sql
      .whereRaw('hospcode=?', [hospcode])
      .count({ total: '*' })

  }

  ipd(db: Knex, hospcode: any, datedsc: any, limit: any, offset: any) {
    let sql = db('ipd')
      .select()
    if (datedsc) {
      sql.where('datedsc', datedsc)
    }

    return sql
      .whereRaw('hospcode=?', [hospcode])
      .orderByRaw('datedsc desc, timedsc desc')
      .limit(limit).offset(offset)

  }

  ipdTotal(db: Knex, hospcode: any, datedsc: any) {

    let sql = db('ipd')

    if (datedsc) {
      sql.where('datedsc', datedsc)
    }

    return sql
      .whereRaw('hospcode=?', [hospcode])
      .count({ total: '*' })

  }
}
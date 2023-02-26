import { Knex } from 'knex';

export class TableModel {

  person(db: Knex, hospcode: any, query: any, limit: any, offset: any) {
    let sql = db('person')
      .select()
    if (query) {
      let _query = `%${query}%`
      sql.where(builder => {
        builder.whereRaw('LOWER(fname) like LOWER(?)', [_query])
          .orWhere('cid', 'like', _query)
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
          .orWhere('cid', 'like', _query)
      })
    }

    return sql
      .whereRaw('hospcode=?', [hospcode])
      .count({ total: '*' })

  }

  opd(db: Knex, hospcode: any, query: any, limit: any, offset: any) {
    let sql = db('opd')
      .select()
    if (query) {
      let _query = `%${query}%`
      sql.where(builder => {
        builder.whereRaw('LOWER(fname) like LOWER(?)', [_query])
          .orWhere('cid', 'like', _query)
      })
    }

    return sql
      .whereRaw('hospcode=?', [hospcode])
      .orderByRaw('date_serv desc, time_serv desc')
      .limit(limit).offset(offset)

  }

  opdTotal(db: Knex, hospcode: any, query: any) {

    let sql = db('opd')

    if (query) {
      let _query = `%${query}%`
      sql.where(builder => {
        builder.whereRaw('LOWER(hn) like LOWER(?)', [_query])
          .orWhere('vn', 'like', _query)
      })
    }

    return sql
      .whereRaw('hospcode=?', [hospcode])
      .count({ total: '*' })

  }
}
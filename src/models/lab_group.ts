import { Knex } from 'knex'
import { ILabGroupInsert, ILabGroupUpdate } from '../../@types/lab_group'
export class LabGroupModel {

  constructor () { }

  list(db: Knex, hospcode: any, query: any, limit: any, offset: any) {

    let sql = db('lab_groups as l')
      .select('l.code', 'l.name', 'l.created_at', 'l.updated_at')

    if (query) {
      let _query = `%${query}%`
      sql.where(builder => {
        builder.whereRaw('LOWER(l.name) like LOWER(?)', [_query])
          .orWhere('l.code', 'like', _query)
      })
    }

    return sql
      .whereRaw('l.hospcode=?', [hospcode])
      .limit(limit).offset(offset)

  }

  listTotal(db: Knex, hospcode: any, query: any) {

    let sql = db('lab_groups')

    if (query) {
      let _query = `%${query}%`
      sql.where(builder => {
        builder.whereRaw('LOWER(name) like LOWER(?)', [_query])
          .orWhere('code', 'like', _query)
      })
    }

    return sql
      .where({ hospcode })
      .count({ total: '*' })

  }

  bulkInsert(db: Knex, data: ILabGroupInsert[]) {
    return db('lab_groups')
      .insert(data)
      .onConflict(['code', 'hospcode'])
      .merge(['name', 'user_id', 'updated_at'])
  }

  save(db: Knex, data: ILabGroupInsert) {
    return db('lab_groups')
      .insert(data)
  }

  update(db: Knex, hospcode: any, code: any, data: ILabGroupUpdate) {
    return db('lab_groups')
      .update(data)
      .where({ code, hospcode })
  }

  remove(db: Knex, code: any, hospcode: any) {
    return db('lab_groups')
      .where({ code, hospcode })
      .del()
  }

}

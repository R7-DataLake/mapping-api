import { Knex } from 'knex'
import { ILabInsert, ILabMapping, ILabUpdate } from '../../@types/lab'
export class LabModel {

  constructor () { }

  list(db: Knex, hospcode: any, query: any, limit: any, offset: any) {

    let sql = db('labs as l')
      .select('l.code', 'l.name', 'l.lab_group_code', 'g.name as lab_group_name', 'l.created_at', 'l.updated_at', 'm.f43', 'm.loinc')
      .joinRaw('left join lab_mappings as m on m.code=l.code and m.hospcode=l.hospcode')
      .joinRaw('left join lab_groups as g on g.hospcode=l.hospcode and g.code=l.lab_group_code')

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

    let sql = db('labs')

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

  bulkInsert(db: Knex, data: ILabInsert[]) {
    return db('labs')
      .insert(data)
      .onConflict(['code', 'hospcode'])
      .merge(['name', 'lab_group_code', 'user_id', 'updated_at'])
  }

  save(db: Knex, data: ILabInsert) {
    return db('labs')
      .insert(data)
  }

  update(db: Knex, hospcode: any, code: any, data: ILabUpdate) {
    return db('labs')
      .update(data)
      .where({ code, hospcode })
  }

  remove(db: Knex, code: any, hospcode: any) {
    return db('labs')
      .where({ code, hospcode })
      .del()
  }

  mapping(db: Knex, data: ILabMapping) {
    return db('lab_mappings')
      .insert(data)
      .onConflict(['code', 'hospcode'])
      .merge(['f43', 'loinc', 'updated_at'])
  }

}

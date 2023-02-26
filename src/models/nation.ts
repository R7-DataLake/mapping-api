import { Knex } from 'knex';
import { INationInsert, INationMapping, INationUpdate } from '../../@types/nation';

export class NationModel {

  list(db: Knex, hospcode: any, query: any, limit: any, offset: any) {

    let sql = db('nations as n')
      .select('n.code', 'n.name', 'n.created_at', 'n.updated_at', 'm.f43', 'm.nhso')
      .joinRaw('left join nation_mappings as m on m.code=n.code and m.hospcode=n.hospcode')
    if (query) {
      let _query = `%${query}%`
      sql.where(builder => {
        builder.whereRaw('LOWER(n.name) like LOWER(?)', [_query])
          .orWhere('n.code', 'like', _query)
      })
    }

    return sql
      .whereRaw('n.hospcode=?', [hospcode])
      .limit(limit).offset(offset)

  }

  listTotal(db: Knex, hospcode: any, query: any) {

    let sql = db('nations as n')
      .joinRaw('left join nation_mappings as m on m.code=n.code and m.hospcode=n.hospcode')

    if (query) {
      let _query = `%${query}%`
      sql.where(builder => {
        builder.whereRaw('LOWER(n.name) like LOWER(?)', [_query])
          .orWhere('n.code', 'like', _query)
      })
    }

    return sql
      .whereRaw('n.hospcode=?', [hospcode])
      .count({ total: '*' })

  }

  bulkInsert(db: Knex, data: INationInsert[]) {
    return db('nations')
      .insert(data)
      .onConflict(['code', 'hospcode'])
      .merge(['name', 'user_id', 'updated_at'])
  }

  save(db: Knex, data: INationInsert) {
    return db('nations')
      .insert(data)
  }

  update(db: Knex, hospcode: any, code: any, data: INationUpdate) {
    return db('nations')
      .update(data)
      .where({ code, hospcode })
  }

  remove(db: Knex, code: any, hospcode: any) {
    return db('nations')
      .where({ code, hospcode })
      .del()
  }

  mapping(db: Knex, data: INationMapping) {
    return db('nation_mappings')
      .insert(data)
      .onConflict(['code', 'hospcode'])
      .merge(['f43', 'nhso', 'updated_at'])
  }

}

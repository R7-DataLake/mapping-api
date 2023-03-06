import { Knex } from 'knex';
import { IOccupationInsert, IOccupationMapping, IOccupationUpdate } from '../../@types/occupation';

export class OccupationModel {

  list(db: Knex, hospcode: any, query: any, limit: any, offset: any) {

    let sql = db('occupations as o')
      .select('o.code', 'o.name', 'o.created_at', 'o.updated_at', 'm.f43', 'm.nhso')
      .joinRaw('left join occupation_mappings as m on m.code=o.code and m.hospcode=o.hospcode')
    if (query) {
      let _query = `%${query}%`
      sql.where(builder => {
        builder.whereRaw('LOWER(o.name) like LOWER(?)', [_query])
          .orWhere('o.code', 'like', _query)
      })
    }

    return sql
      .whereRaw('o.hospcode=?', [hospcode])
      .limit(limit).offset(offset)

  }

  listTotal(db: Knex, hospcode: any, query: any) {

    let sql = db('occupations as o')
      .joinRaw('left join occupation_mappings as m on m.code=o.code and m.hospcode=o.hospcode')

    if (query) {
      let _query = `%${query}%`
      sql.where(builder => {
        builder.whereRaw('LOWER(o.name) like LOWER(?)', [_query])
          .orWhere('o.code', 'like', _query)
      })
    }

    return sql
      .whereRaw('o.hospcode=?', [hospcode])
      .count({ total: '*' })

  }

  bulkInsert(db: Knex, data: IOccupationInsert[]) {
    return db('occupations')
      .insert(data)
      .onConflict(['code', 'hospcode'])
      .merge(['name', 'user_id', 'updated_at'])
  }

  save(db: Knex, data: IOccupationInsert) {
    return db('occupations')
      .insert(data)
  }

  update(db: Knex, hospcode: any, code: any, data: IOccupationUpdate) {
    return db('occupations')
      .update(data)
      .where({ code, hospcode })
  }

  remove(db: Knex, code: any, hospcode: any) {
    return db('occupations')
      .where({ code, hospcode })
      .del()
  }

  mapping(db: Knex, data: IOccupationMapping) {
    return db('occupation_mappings')
      .insert(data)
      .onConflict(['code', 'hospcode'])
      .merge(['f43', 'nhso', 'updated_at'])
  }

}

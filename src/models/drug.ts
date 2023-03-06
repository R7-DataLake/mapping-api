import { Knex } from 'knex'
import { IDrugInsert, IDrugMapping, IDrugUpdate } from '../../@types/drug'
export class DrugModel {

  constructor () { }

  list(db: Knex, hospcode: any, query: any, limit: any, offset: any) {

    let sql = db('drugs as d')
      .select('d.code', 'd.name', 'd.created_at', 'd.updated_at', 'm.f43', 'm.tmt')
      .joinRaw('left join drug_mappings as m on m.code=d.code and m.hospcode=d.hospcode')
    if (query) {
      let _query = `%${query}%`
      sql.where(builder => {
        builder.whereRaw('LOWER(d.name) like LOWER(?)', [_query])
          .orWhere('d.code', 'like', _query)
      })
    }

    return sql
      .whereRaw('d.hospcode=?', [hospcode])
      .limit(limit).offset(offset)

  }

  listTotal(db: Knex, hospcode: any, query: any) {

    let sql = db('drugs as d')
      .joinRaw('left join drug_mappings as m on m.code=d.code and m.hospcode=d.hospcode')

    if (query) {
      let _query = `%${query}%`
      sql.where(builder => {
        builder.whereRaw('LOWER(d.name) like LOWER(?)', [_query])
          .orWhere('d.code', 'like', _query)
      })
    }

    return sql
      .whereRaw('d.hospcode=?', [hospcode])
      .count({ total: '*' })

  }

  bulkInsert(db: Knex, data: IDrugInsert[]) {
    return db('drugs')
      .insert(data)
      .onConflict(['code', 'hospcode'])
      .merge(['name', 'user_id', 'updated_at'])
  }

  save(db: Knex, data: IDrugInsert) {
    return db('drugs')
      .insert(data)
  }

  update(db: Knex, hospcode: any, code: any, data: IDrugUpdate) {
    return db('drugs')
      .update(data)
      .where({ code, hospcode })
  }

  remove(db: Knex, code: any, hospcode: any) {
    return db('drugs')
      .where({ code, hospcode })
      .del()
  }

  mapping(db: Knex, data: IDrugMapping) {
    return db('drug_mappings')
      .insert(data)
      .onConflict(['code', 'hospcode'])
      .merge(['f43', 'tmt', 'nhso', 'updated_at'])
  }

}

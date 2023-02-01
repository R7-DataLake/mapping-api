import { Knex } from 'knex'
import { IDrugInsert, IDrugMapping, IDrugUpdate } from '../../@types/drug'
export class DrugModel {

  constructor () { }

  list(db: Knex, hospcode: any, query: any, limit: any, offset: any) {

    let sql = db('drugs')
      .select('code', 'name', 'created_at', 'updated_at')

    if (query) {
      let _query = `%${query}%`
      sql.where(builder => {
        builder.where('name', 'like', _query)
          .orWhere('code', 'like', _query)
      })
    }

    return sql
      .where({ hospcode })
      .limit(limit).offset(offset)

  }

  listTotal(db: Knex, hospcode: any, query: any) {

    let sql = db('drugs')

    if (query) {
      let _query = `%${query}%`
      sql.where(builder => {
        builder.where('name', 'like', _query)
          .orWhere('code', 'like', _query)
      })
    }

    return sql
      .where({ hospcode })
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
      .onConflict(['code', 'hospcode'])
      .merge(['name', 'user_id', 'updated_at'])
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

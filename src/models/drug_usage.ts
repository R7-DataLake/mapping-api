import { Knex } from 'knex'
import { IDrugUsageInsert, IDrugUsageUpdate } from '../../@types/drug_usage'
export class DrugUsageModel {

  constructor () { }


  list(db: Knex, hospcode: any, query: any, limit: any, offset: any) {

    let sql = db('drug_usages as d')
      .select('d.code', 'd.usage1', 'd.usage2', 'd.usage3', 'd.created_at', 'd.updated_at')

    if (query) {
      let _query = `%${query}%`
      sql.where(builder => {
        builder.whereRaw('LOWER(d.usage1) like LOWER(?)', [_query])
          .orWhereRaw('LOWER(d.usage2) like LOWER(?)', [_query])
          .orWhereRaw('LOWER(d.usage3) like LOWER(?)', [_query])
      })
    }

    return sql
      .whereRaw('d.hospcode=?', [hospcode])
      .limit(limit).offset(offset)

  }

  listTotal(db: Knex, hospcode: any, query: any) {

    let sql = db('drug_usages as d')

    if (query) {
      let _query = `%${query}%`
      sql.where(builder => {
        builder.whereRaw('LOWER(d.usage1) like LOWER(?)', [_query])
          .orWhereRaw('LOWER(d.usage2) like LOWER(?)', [_query])
          .orWhereRaw('LOWER(d.usage3) like LOWER(?)', [_query])
      })
    }

    return sql
      .whereRaw('d.hospcode=?', [hospcode])
      .count({ total: '*' })

  }

  bulkInsert(db: Knex, data: IDrugUsageInsert[]) {
    return db('drug_usages')
      .insert(data)
      .onConflict(['code', 'hospcode'])
      .merge(['usage1', 'usage2', 'usage3', 'user_id', 'updated_at'])
  }

  save(db: Knex, data: IDrugUsageInsert) {
    return db('drug_usages')
      .insert(data)
  }

  update(db: Knex, hospcode: any, code: any, data: IDrugUsageUpdate) {
    return db('drug_usages')
      .update(data)
      .where({ code, hospcode })
  }

  remove(db: Knex, code: any, hospcode: any) {
    return db('drug_usages')
      .where({ code, hospcode })
      .del()
  }

}

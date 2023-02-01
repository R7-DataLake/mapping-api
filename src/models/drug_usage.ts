import { Knex } from 'knex'
import { IDrugUsageInsert, IDrugUsageUpdate } from '../../@types/drug_usage'
export class DrugUsageModel {

  constructor () { }

  bulkInsert(db: Knex, data: IDrugUsageInsert[]) {
    return db('drug_usages')
      .insert(data)
      .onConflict(['code', 'hospcode'])
      .merge(['usage1', 'usage2', 'usage3', 'user_id', 'updated_at'])
  }

  save(db: Knex, data: IDrugUsageInsert) {
    return db('drug_usages')
      .insert(data)
      .onConflict(['code', 'hospcode'])
      .merge(['usage1', 'usage2', 'usage3', 'user_id', 'updated_at'])
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

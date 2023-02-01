import { Knex } from 'knex'
import { IDrugInsert, IDrugMapping, IDrugUpdate } from '../../@types/mapping'
export class DrugModel {

  constructor () { }

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
      .merge()
  }

}

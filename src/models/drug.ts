import { Knex } from 'knex'
import { IDrugInsert, IDrugMapping, IDrugUpdate } from '../../@types/mapping'
export class LoginModel {

  constructor () { }

  bulkInsert(db: Knex, data: IDrugInsert[]) {
    return db('drugs')
      .insert(data)
      .onConflict(['code', 'hospcode'])
      .merge()
  }

  save(db: Knex, data: IDrugInsert) {
    return db('drugs')
      .insert(data)
      .onConflict(['code', 'hospcode'])
      .merge()
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

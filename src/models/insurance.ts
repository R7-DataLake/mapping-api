import { Knex } from 'knex';
import { IInsuranceInsert, IInsuranceMapping, IInsuranceUpdate } from '../../@types/insurance';

export class InsuranceModel {

  list(db: Knex, hospcode: any, query: any, limit: any, offset: any) {

    let sql = db('insurances as i')
      .select('i.code', 'i.name', 'i.created_at', 'i.updated_at', 'm.f43', 'm.nhso')
      .joinRaw('left join insurance_mappings as m on m.code=i.code and m.hospcode=i.hospcode')
    if (query) {
      let _query = `%${query}%`
      sql.where(builder => {
        builder.whereRaw('LOWER(i.name) like LOWER(?)', [_query])
          .orWhere('i.code', 'like', _query)
      })
    }

    return sql
      .whereRaw('i.hospcode=?', [hospcode])
      .limit(limit).offset(offset)

  }

  listTotal(db: Knex, hospcode: any, query: any) {

    let sql = db('insurances as i')
      .joinRaw('left join insurance_mappings as m on m.code=i.code and m.hospcode=i.hospcode')

    if (query) {
      let _query = `%${query}%`
      sql.where(builder => {
        builder.whereRaw('LOWER(i.name) like LOWER(?)', [_query])
          .orWhere('i.code', 'like', _query)
      })
    }

    return sql
      .whereRaw('i.hospcode=?', [hospcode])
      .count({ total: '*' })

  }

  bulkInsert(db: Knex, data: IInsuranceInsert[]) {
    return db('insurances')
      .insert(data)
      .onConflict(['code', 'hospcode'])
      .merge(['name', 'user_id', 'updated_at'])
  }

  save(db: Knex, data: IInsuranceInsert) {
    return db('insurances')
      .insert(data)
  }

  update(db: Knex, hospcode: any, code: any, data: IInsuranceUpdate) {
    return db('insurances')
      .update(data)
      .where({ code, hospcode })
  }

  remove(db: Knex, code: any, hospcode: any) {
    return db('insurances')
      .where({ code, hospcode })
      .del()
  }

  mapping(db: Knex, data: IInsuranceMapping) {
    return db('insurance_mappings')
      .insert(data)
      .onConflict(['code', 'hospcode'])
      .merge(['f43', 'nhso', 'updated_at'])
  }

}

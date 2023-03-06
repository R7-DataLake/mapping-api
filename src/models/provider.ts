import { Knex } from 'knex';
import { IProviderInsert, IProviderMapping, IProviderUpdate } from '../../@types/provider';

export class ProviderModel {

  list(db: Knex, hospcode: any, query: any, limit: any, offset: any) {

    let sql = db('providers as p')
      .select('p.code', 'p.cid', 'p.prename', 'p.fname', 'p.lname', 'p.sex', 'p.start_date', 'p.end_date', 'p.register_no', 'p.council', 'p.provider_type', 'p.birth', 'p.created_at', 'p.updated_at', 'm.f43', 'm.nhso')
      .joinRaw('left join provider_mappings as m on m.code=p.code and m.hospcode=p.hospcode')
    if (query) {
      let _query = `%${query}%`
      sql.where(builder => {
        builder.whereRaw('LOWER(p.fname) like LOWER(?)', [_query])
          .orWhere('p.code', 'like', _query)
      })
    }

    return sql
      .whereRaw('p.hospcode=?', [hospcode])
      .limit(limit).offset(offset)

  }

  listTotal(db: Knex, hospcode: any, query: any) {

    let sql = db('providers as p')
      .joinRaw('left join provider_mappings as m on m.code=p.code and m.hospcode=p.hospcode')

    if (query) {
      let _query = `%${query}%`
      sql.where(builder => {
        builder.whereRaw('LOWER(p.fname) like LOWER(?)', [_query])
          .orWhere('p.code', 'like', _query)
      })
    }

    return sql
      .whereRaw('p.hospcode=?', [hospcode])
      .count({ total: '*' })

  }

  bulkInsert(db: Knex, data: IProviderInsert[]) {
    return db('providers')
      .insert(data)
      .onConflict(['code', 'hospcode'])
      .merge(['fname', 'lname', 'prename', 'birth', 'sex', 'provider_type', 'register_no', 'council', 'user_id', 'cid', 'updated_at'])
  }

  save(db: Knex, data: IProviderInsert) {
    return db('providers')
      .insert(data)
  }

  update(db: Knex, hospcode: any, code: any, data: IProviderUpdate) {
    return db('providers')
      .update(data)
      .where({ code, hospcode })
  }

  remove(db: Knex, code: any, hospcode: any) {
    return db('providers')
      .where({ code, hospcode })
      .del()
  }

  mapping(db: Knex, data: IProviderMapping) {
    return db('provider_mappings')
      .insert(data)
      .onConflict(['code', 'hospcode'])
      .merge(['f43', 'nhso', 'updated_at'])
  }

}

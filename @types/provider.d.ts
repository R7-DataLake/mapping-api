export interface IProviderMapping {
  code: string
  hospcode: string
  f43: string
  nhso: string
  user_id: string
  updated_at: string
}

export interface IProviderInsert {
  hospcode: string
  code: string
  prename: string
  fname: string
  lname: string
  sex: string
  birth: string
  provider_type: string
  start_date: string
  end_date: string
  cid: string
  register_no: string
  council: string
  user_id: string
  updated_at: string
}

export interface IProviderUpdate {
  prename: string
  fname: string
  lname: string
  sex: string
  birth: string
  provider_type: string
  start_date: string
  end_date: string
  cid: string
  register_no: string
  council: string
  user_id: string
  updated_at: string
}

export interface ILabMapping {
  code: string
  hospcode: string
  f43: string
  nhso: string
  loinc: string
  user_id: string
  updated_at: string
}

export interface ILabInsert {
  code: string
  hospcode: string
  name: string
  lab_group_code: string
  user_id: string
  updated_at: string
}

export interface ILabUpdate {
  name: string
  lab_group_code: string
  user_id: string
  updated_at: string
}

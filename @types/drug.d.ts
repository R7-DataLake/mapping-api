export interface IDrugMapping {
  code: string
  hospcode: string
  tmt: string
  f43: string
  nhso: string
  user_id: string
  updated_at: string
}

export interface IDrugInsert {
  code: string
  hospcode: string
  name: string
  user_id: string
  updated_at: string
}

export interface IDrugUpdate {
  name: string
  user_id: string
  updated_at: string
}

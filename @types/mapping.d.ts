export interface IDrugMapping {
  code: string
  hospcode: string
  tmt: string
  nhso: string
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

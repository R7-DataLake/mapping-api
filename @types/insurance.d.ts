export interface IInsuranceMapping {
  code: string
  hospcode: string
  f43: string
  nhso: string
  user_id: string
  updated_at: string
}

export interface IInsuranceInsert {
  hospcode: string
  code: string
  name: string
  user_id: string
  updated_at: string
}

export interface IInsuranceUpdate {
  name: string
  user_id: string
  updated_at: string
}

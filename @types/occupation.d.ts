export interface IOccupationMapping {
  code: string
  hospcode: string
  f43: string
  nhso: string
  user_id: string
  updated_at: string
}

export interface IOccupationInsert {
  hospcode: string
  code: string
  name: string
  user_id: string
  updated_at: string
}

export interface IOccupationUpdate {
  name: string
  user_id: string
  updated_at: string
}

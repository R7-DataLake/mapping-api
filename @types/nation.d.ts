export interface INationMapping {
  code: string
  hospcode: string
  f43: string
  nhso: string
  user_id: string
  updated_at: string
}

export interface INationInsert {
  hospcode: string
  code: string
  name: string
  user_id: string
  updated_at: string
}

export interface INationUpdate {
  name: string
  user_id: string
  updated_at: string
}

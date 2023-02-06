export interface ILabGroup {
  code: string
  hospcode: string
  name: string
  user_id: string
  created_at: string
  updated_at: string
}

export interface ILabGroupInsert {
  code: string
  hospcode: string
  name: string
  user_id: string
}

export interface ILabGroupUpdate {
  name: string
  user_id: string
  updated_at: string
}

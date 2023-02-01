export interface IDrugUsageInsert {
  code: string
  hospcode: string
  usage1: string
  usage2: string
  usage3: string
  user_id: string
  updated_at: string
}

export interface IDrugUsageUpdate {
  usage1: string
  usage2: string
  usage3: string
  user_id: string
  updated_at: string
}

export type NodeType = 'entity' | 'date_day' | 'date_month' | 'time'

export type Node = {
  id: string
  name: string
  type: NodeType
  context_note?: string | null
  created_at: string
  updated_at: string
}

export type Edge = {
  id: string
  from_id: string
  to_id: string
  is_same_as: boolean
  note?: string | null
  created_at: string
}

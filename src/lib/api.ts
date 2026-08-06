import { supabase } from './supabaseClient'
import { detectNodeType } from './parser'
import type { Edge, Node, NodeType } from './types'

async function currentUserId(): Promise<string> {
  const { data } = await supabase.auth.getUser()
  const uid = data.user?.id
  if (!uid) throw new Error('ログインが必要です')
  return uid
}

export async function fetchAllNodes(): Promise<Node[]> {
  const { data, error } = await supabase.from('nodes').select('*').order('created_at')
  if (error) throw error
  return data as Node[]
}

export async function fetchAllEdges(): Promise<Edge[]> {
  const { data, error } = await supabase.from('edges').select('*').order('created_at')
  if (error) throw error
  return data as Edge[]
}

export async function insertNode(input: {
  name: string
  type?: NodeType
  context_note?: string
}): Promise<Node> {
  const user_id = await currentUserId()
  const { data, error } = await supabase
    .from('nodes')
    .insert({
      user_id,
      name: input.name,
      type: input.type ?? detectNodeType(input.name),
      context_note: input.context_note ?? null,
    })
    .select()
    .single()
  if (error) throw error
  return data as Node
}

export async function insertEdge(input: {
  from_id: string
  to_id: string
  is_same_as?: boolean
  note?: string
}): Promise<Edge> {
  const user_id = await currentUserId()
  const { data, error } = await supabase
    .from('edges')
    .insert({ user_id, ...input })
    .select()
    .single()
  if (error) throw error
  return data as Edge
}

export async function removeEdge(edgeId: string): Promise<void> {
  const { error } = await supabase.from('edges').delete().eq('id', edgeId)
  if (error) throw error
}

export async function removeNode(nodeId: string): Promise<void> {
  // edges は FK の on delete cascade により DB 側で同時に削除される
  const { error } = await supabase.from('nodes').delete().eq('id', nodeId)
  if (error) throw error
}

export async function updateNode(
  nodeId: string,
  patch: Partial<Pick<Node, 'name' | 'type' | 'context_note'>>,
): Promise<Node> {
  const { data, error } = await supabase
    .from('nodes')
    .update(patch)
    .eq('id', nodeId)
    .select()
    .single()
  if (error) throw error
  return data as Node
}

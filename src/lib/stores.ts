import { derived, get, writable } from 'svelte/store'
import * as api from './api'
import type { Edge, Node } from './types'

export const nodes = writable<Node[]>([])
export const edges = writable<Edge[]>([])
export const loading = writable(false)
export const currentNodeId = writable<string | null>(null)

export const nodeMap = derived(nodes, ($nodes) => new Map($nodes.map((n) => [n.id, n])))

export const recentNodes = derived(nodes, ($nodes) =>
  [...$nodes].sort((a, b) => b.updated_at.localeCompare(a.updated_at)),
)

export const currentNode = derived(
  [currentNodeId, nodeMap],
  ([$id, $map]) => ($id ? ($map.get($id) ?? null) : null),
)

function incidentEdges(all: Edge[], nodeId: string): Edge[] {
  return all.filter((e) => e.from_id === nodeId || e.to_id === nodeId)
}

function opposite(edge: Edge, nodeId: string): string {
  return edge.from_id === nodeId ? edge.to_id : edge.from_id
}

export type Connection = {
  edgeId: string
  node: Node
  viaSameAs?: { id: string; name: string }
  degree: number
}

export const sameAsNodes = derived(
  [currentNodeId, nodes, edges],
  ([$id, $nodes, $edges]) => {
    if (!$id) return [] as { edgeId: string; node: Node }[]
    const map = new Map($nodes.map((n) => [n.id, n]))
    const result: { edgeId: string; node: Node }[] = []
    for (const e of incidentEdges($edges, $id)) {
      if (!e.is_same_as) continue
      const node = map.get(opposite(e, $id))
      if (node) result.push({ edgeId: e.id, node })
    }
    return result
  },
)

function computeConnections(
  allNodes: Node[],
  allEdges: Edge[],
  centerId: string,
): Connection[] {
  const map = new Map(allNodes.map((n) => [n.id, n]))
  const direct = incidentEdges(allEdges, centerId)

  const sameAsNeighborIds = new Set<string>()
  for (const e of direct) {
    if (e.is_same_as) sameAsNeighborIds.add(opposite(e, centerId))
  }
  const viaFor = new Map<string, { id: string; name: string }>()
  for (const sid of sameAsNeighborIds) {
    const sn = map.get(sid)
    viaFor.set(sid, { id: sid, name: sn?.name ?? sid })
  }

  const seen = new Set<string>()
  const result: Connection[] = []
  const addEdges = (
    ownerId: string,
    edgeList: Edge[],
    via?: { id: string; name: string },
  ) => {
    for (const e of edgeList) {
      if (e.is_same_as) continue
      const nid = opposite(e, ownerId)
      if (!map.has(nid) || seen.has(nid)) continue
      seen.add(nid)
      result.push({
        edgeId: e.id,
        node: map.get(nid)!,
        viaSameAs: via,
        degree: incidentEdges(allEdges, nid).length,
      })
    }
  }

  addEdges(centerId, direct)
  for (const sid of sameAsNeighborIds) {
    addEdges(sid, incidentEdges(allEdges, sid), viaFor.get(sid))
  }
  return result
}

export const connections = derived(
  [currentNodeId, nodes, edges],
  ([$id, $nodes, $edges]) => ($id ? computeConnections($nodes, $edges, $id) : []),
)

export type SameNameGroup = {
  node: Node
  connections: Connection[]
}

export const sameNameGroups = derived(
  [currentNode, nodes, edges],
  ([$cur, $nodes, $edges]) => {
    if (!$cur) return [] as SameNameGroup[]
    return $nodes
      .filter((n) => n.id !== $cur.id && n.name === $cur.name)
      .sort((a, b) => b.updated_at.localeCompare(a.updated_at))
      .map((n) => ({ node: n, connections: computeConnections($nodes, $edges, n.id) }))
  },
)

export const hasTimeline = derived(connections, (cs) =>
  cs.some((c) => c.node.type === 'time'),
)

function timeValue(node: Node): number {
  const m = node.name.match(/^(\d{1,2}):(\d{2})$/)
  if (!m) return Number.POSITIVE_INFINITY
  return Number(m[1]) * 60 + Number(m[2])
}

export const orderedConnections = derived([connections, hasTimeline], ([cs, timeline]) => {
  const arr = [...cs]
  if (timeline) {
    arr.sort((a, b) => timeValue(a.node) - timeValue(b.node))
  } else {
    arr.sort((a, b) => b.degree - a.degree || a.node.name.localeCompare(b.node.name))
  }
  return arr
})

export async function loadGraph(): Promise<void> {
  loading.set(true)
  try {
    const [ns, es] = await Promise.all([api.fetchAllNodes(), api.fetchAllEdges()])
    nodes.set(ns)
    edges.set(es)
  } finally {
    loading.set(false)
  }
}

export function clearGraph(): void {
  nodes.set([])
  edges.set([])
  currentNodeId.set(null)
}

export async function createNode(name: string, context_note?: string): Promise<Node> {
  const n = await api.insertNode({ name, context_note })
  nodes.update((list) => [n, ...list])
  return n
}

function touchNodes(ids: string[]): void {
  const stamp = new Date().toISOString()
  const set = new Set(ids)
  nodes.update((list) =>
    list.map((n) => (set.has(n.id) ? { ...n, updated_at: stamp } : n)),
  )
}

export async function connect(
  fromId: string,
  toId: string,
  opts: { is_same_as?: boolean; note?: string } = {},
): Promise<Edge | null> {
  const existing = get(edges).find(
    (e) =>
      (e.from_id === fromId && e.to_id === toId) ||
      (e.from_id === toId && e.to_id === fromId),
  )
  if (existing) return null
  const e = await api.insertEdge({ from_id: fromId, to_id: toId, ...opts })
  edges.update((list) => [...list, e])
  touchNodes([fromId, toId])
  return e
}

export async function disconnect(edgeId: string): Promise<void> {
  const target = get(edges).find((e) => e.id === edgeId)
  await api.removeEdge(edgeId)
  edges.update((list) => list.filter((e) => e.id !== edgeId))
  if (target) touchNodes([target.from_id, target.to_id])
}

export async function deleteNode(nodeId: string): Promise<void> {
  await api.removeNode(nodeId)
  nodes.update((list) => list.filter((n) => n.id !== nodeId))
  edges.update((list) => list.filter((e) => e.from_id !== nodeId && e.to_id !== nodeId))
  if (get(currentNodeId) === nodeId) currentNodeId.set(null)
}

export async function updateNodeMeta(
  nodeId: string,
  patch: Partial<Pick<Node, 'name' | 'type' | 'context_note'>>,
): Promise<void> {
  const n = await api.updateNode(nodeId, patch)
  nodes.update((list) => list.map((x) => (x.id === n.id ? n : x)))
}

export function searchLocal(query: string): Node[] {
  const q = query.trim().toLowerCase()
  if (!q) return []
  return get(nodes)
    .filter((n) => n.name.toLowerCase().includes(q))
    .sort((a, b) => a.name.localeCompare(b.name))
}

export function nodeContextNames(nodeId: string, max = 2): string[] {
  const map = new Map(get(nodes).map((n) => [n.id, n]))
  const names: string[] = []
  for (const e of incidentEdges(get(edges), nodeId)) {
    const n = map.get(opposite(e, nodeId))
    if (n && !n.name.startsWith('20')) names.push(n.name)
    if (names.length >= max) break
  }
  return names
}

export function adjacentDate(offset: 1 | -1): string | null {
  const cur = get(currentNode)
  if (!cur || cur.type !== 'date_day') return null
  const d = new Date(cur.name + 'T00:00:00')
  d.setDate(d.getDate() + offset)
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  const target = `${y}-${m}-${day}`
  return get(nodes).find((n) => n.name === target)?.id ?? target
}
